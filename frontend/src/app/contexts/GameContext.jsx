import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../../api/axios';
import echo from '../../api/echo';
import { useAuth } from './AuthContext';

const GameContext = createContext(null);

const DEFAULT_LIFELINES = { fifty: false, skip: false, audience: false, phone: false, doubleDip: false };

export function GameProvider({ children }) {
    const [gameState, setGameState] = useState(null);
    const { currentUser } = useAuth();
    
    // Clear game state when user logs out
    useEffect(() => {
        if (!currentUser) {
            setGameState(null);
        }
    }, [currentUser]);

    // Map frontend lifelines (true=used) to backend format (missing or false=used, true=available) or parse them
    const parseLifelines = (backendLifelines) => {
        if (!backendLifelines) return { ...DEFAULT_LIFELINES };
        // Backend: true=available, false/'active'=used/active. Frontend: true=used.
        return {
            fifty: backendLifelines.fiftyFifty === false,
            skip: backendLifelines.skip === false,
            audience: backendLifelines.audienceVote === false,
            phone: backendLifelines.phoneFriend === false,
            doubleDip: backendLifelines.doubleChance === false || backendLifelines.doubleChance === 'active',
        };
    };

    const mapLifelineType = (type) => {
        const map = {
            fifty: 'fiftyFifty',
            skip: 'skip',
            audience: 'audienceVote',
            phone: 'phoneFriend',
            doubleDip: 'doubleChance',
        };
        return map[type] || type;
    };

    /** ---------------- GAMEPLAY ---------------- **/
    const initGame = useCallback(async (mode, matchId = null, categories = []) => {
        try {
            const res = await api.post('/games', { 
                match_id: matchId,
                categories: categories
            });
            const { session, question } = res.data;
            
            setGameState({
                status: 'active',
                mode,
                matchId,
                currentQuestion: question,
                questions: [question],
                currentQuestionIndex: 0,
                playerScore: 0,
                answers: [],
                lifelines: parseLifelines(session.lifelines),
                eliminatedAnswers: [],
                opponents: mode === '1v1' ? (res.data.opponent ? [{ ...res.data.opponent, score: 0 }] : []) : [],
                session,
            });
        } catch (error) {
            console.error("Failed to start game", error);
        }
    }, []);

    const answerQuestion = useCallback(async (answerId, timeRemaining) => {
        if (!gameState || !gameState.session) throw new Error('No active game');
        
        try {
            const res = await api.post(`/games/${gameState.session.id}/answer`, { answer_id: answerId });
            const result = res.data;
            
            const isCorrect = result.status === 'correct';
            const gameAnswer = {
                questionId: gameState.currentQuestion.id,
                selectedAnswerId: answerId,
                correctAnswerId: result.correct_answer || (isCorrect ? answerId : null),
                isCorrect,
                timeRemaining,
                pointsEarned: isCorrect ? result.score - gameState.playerScore : 0,
                status: result.status,
            };

            setGameState(prev => {
                if (!prev) return prev;
                // Double chance logic
                if (result.status === 'try_again') {
                    // It was wrong, but double chance saved them.
                    return {
                        ...prev,
                        answers: [...prev.answers, { ...gameAnswer, isCorrect: false }],
                        lifelines: { ...prev.lifelines, doubleDip: true }
                    };
                }

                return {
                    ...prev,
                    questions: prev.questions || [],
                    answers: [...(prev.answers || []), gameAnswer],
                    playerScore: isCorrect ? result.score : prev.playerScore,
                    // Keep old question/index for animation sync
                    status: (result.status === 'wrong' || result.status === 'failed' || result.status === 'timeout') ? 'failed' : (!result.next_question && isCorrect ? 'finished' : 'active'),
                    eliminatedAnswers: isCorrect ? [] : prev.eliminatedAnswers, 
                };
            });
            return gameAnswer;
        } catch (error) {
            console.error("Answer failed", error);
            throw error;
        }
    }, [gameState]);

    const useLifeline = useCallback(async (type) => {
        if (!gameState || !gameState.session) return null;
        // lifelines is in frontend format: true = already used, block re-use
        if (gameState.lifelines[type] === true) return null;
        
        try {
            const payload = {
                type: mapLifelineType(type),
                question_id: gameState.currentQuestion.id
            };
            const res = await api.post(`/games/${gameState.session.id}/lifeline`, payload);
            const data = res.data;

            setGameState(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    lifelines: { ...prev.lifelines, [type]: true },
                    eliminatedAnswers: type === 'fifty' && data.hidden_ids ? data.hidden_ids : prev.eliminatedAnswers,
                    currentQuestion: type === 'skip' && data.next_question ? data.next_question : prev.currentQuestion,
                };
            });

            if (type === 'audience') {
                return data.vote_data;
            }
            if (type === 'phone') {
                return data.friend_advice;
            }
            return null;
        } catch (error) {
            console.error("Lifeline failed", error);
            return null;
        }
    }, [gameState]);

    const nextQuestion = useCallback(async () => {
        // Automatically handled by 'answerQuestion' returning the next_question, but expose if needed.
        if (!gameState || !gameState.session) return;
        try {
            const res = await api.get(`/games/${gameState.session.id}`);
            setGameState(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    currentQuestion: res.data.question,
                    questions: [...(prev.questions || []), res.data.question],
                    currentQuestionIndex: res.data.session.current_level - 1,
                    lifelines: parseLifelines(res.data.session.lifelines),
                    eliminatedAnswers: [],
                    session: res.data.session
                };
            });
        } catch (error) {
            console.error(error);
        }
    }, [gameState]);

    const resetGame = useCallback(() => {
        setGameState(null);
    }, []);

    const finalizeGame = useCallback(() => {
        if (gameState && gameState.matchId) {
            // Signal to others we finished
            api.post('/multiplayer/action', {
                match_id: gameState.matchId,
                action_type: 'player_finished',
                payload: { score: gameState.playerScore }
            }).catch(console.error);
        }
    }, [gameState]);


    /** ---------------- MULTIPLAYER/LOBBY ---------------- **/

    // Bind lobby channel logic
    const bindLobbyChannel = useCallback((inviteCode) => {
        const channel = echo.channel(`lobby.${inviteCode}`);
        /* If a specific battle lobby channel was supported we'd bind it here.
           But MultiplayerController sends BattleLobbyUpdate using PrivateChannel('user.{userId}')
           So we listen on the user channel instead! */
    }, []);

    const bindUserChannel = useCallback(() => {
        if (!currentUser) return;
        const channel = echo.private(`user.${currentUser.id}`);
        
        channel.listen('BattleLobbyUpdate', (e) => {
            setGameState(prev => {
                if (!prev || prev.lobbyInviteCode !== e.battle_id /* Note backend uses battle_id vs inviteCode ambiguously, we need to adapt */) return prev;
                // Update players
                if (e.action === 'player_joined' || e.action === 'player_left' || e.action === 'player_ready') {
                    return { ...prev, lobbyPlayers: e.data.players };
                }
                return prev;
            });
        });

        channel.listen('BattleStarted', (e) => {
            // Transition to active game
            initGame('battle', e.match_id);
        });

        channel.listen('BattleLobbyClosed', (e) => {
            setGameState(null);
        });

        channel.listen('MatchFound', (e) => {
            initGame('1v1', e.match_id);
            setGameState(prev => prev ? { 
                ...prev, 
                opponents: [{ id: e.opponent.id, name: e.opponent.name, score: 0 }],
                status: 'active' 
            } : prev);
        });

        return () => echo.leave(`user.${currentUser.id}`);
    }, [currentUser, initGame]);

    useEffect(() => {
        const unbind = bindUserChannel();
        return () => {
             if (unbind) unbind();
        }
    }, [bindUserChannel]);

    // Used for 1v1 Ranked Matchmaking
    const startRanked1v1 = useCallback(async (categories = []) => {
        try {
            setGameState({
                mode: '1v1',
                status: 'matchmaking',
                is_ranked: true,
                preferredCategories: categories
            });
            await api.post('/multiplayer/matchmake', { mode: '1v1', categories: categories });
            return 'searching';
        } catch (error) {
            console.error("Matchmaking failed", error);
        }
    }, []);

    const cancelMatchmake = useCallback(async () => {
        try {
            await api.post('/multiplayer/cancel-matchmake');
            setGameState(null);
        } catch (error) {}
    }, []);

    // Used for Private Battles
    const createBattle = useCallback(async (playerCount, isPrivate = true, categories = []) => {
        try {
            const res = await api.post('/multiplayer/battle/create', { 
                player_count: playerCount, 
                is_private: isPrivate,
                categories: categories
            });
            const data = res.data;
            setGameState({
                mode: 'Room',
                status: 'matchmaking',
                lobbyInviteCode: data.invite_code,
                lobbyPlayers: data.players,
                isHost: true,
                roomSize: playerCount,
                isPrivate
            });
            return data.invite_code;
        } catch (error) {
            console.error("Create battle failed", error);
        }
    }, []);

    const joinBattle = useCallback(async (inviteCode) => {
        try {
            const res = await api.post(`/multiplayer/battle/join/${inviteCode}`);
            const data = res.data;
            setGameState({
                mode: 'Room',
                status: 'matchmaking',
                lobbyInviteCode: inviteCode,
                lobbyPlayers: data.players,
                isHost: data.is_host,
                roomSize: data.total_needed
            });
        } catch (error) {
            console.error("Join battle failed", error);
            throw error;
        }
    }, []);

    const setReady = useCallback(async (ready) => {
        if (!gameState || !gameState.lobbyInviteCode) return;
        try {
             await api.post(`/multiplayer/battle/ready/${gameState.lobbyInviteCode}`, { ready });
        } catch (error) {
             console.error("Ready failed", error);
        }
    }, [gameState]);

    const startBattle = useCallback(async () => {
        if (!gameState || !gameState.lobbyInviteCode) return;
        try {
             await api.post(`/multiplayer/battle/start/${gameState.lobbyInviteCode}`);
             // Will trigger via pusher BattleStarted event
        } catch (error) {
             console.error("Start battle failed", error);
        }
    }, [gameState]);

    const leaveBattle = useCallback(async () => {
        if (!gameState || !gameState.lobbyInviteCode) {
            setGameState(null);
            return;
        }
        try {
             await api.post(`/multiplayer/battle/leave/${gameState.lobbyInviteCode}`);
             setGameState(null);
        } catch (error) {
             console.error("Leave battle failed", error);
        }
    }, [gameState]);

    // Aliases to fit the old mocked names used in UI forms
    const createPrivate1v1 = useCallback(async (categories) => createBattle(2, true, categories), [createBattle]);
    const joinPrivate1v1 = useCallback(async (code) => joinBattle(code), [joinBattle]);
    const createSmallRoom = useCallback(async (categories) => createBattle(5, true, categories), [createBattle]);
    const joinSmallRoom = useCallback(async (code) => joinBattle(code), [joinBattle]);
    
    // Fallbacks to remove mocked calls
    const switchToRandom = cancelMatchmake;
    const startSmallRoomGame = useCallback(async () => startBattle(), [startBattle]);
    const addAIPlayers = useCallback(() => {}, []);
    const extendLobbyTimer = useCallback(() => {}, []);
    const createRandomSmallRoom = useCallback((categories) => createBattle(5, false, categories), [createBattle]);

    const contextValue = React.useMemo(() => ({
        gameState, 
        initGame, answerQuestion, useLifeline, nextQuestion, resetGame, finalizeGame,
        createSmallRoom, createRandomSmallRoom, joinSmallRoom, extendLobbyTimer, addAIPlayers, startSmallRoomGame,
        createPrivate1v1, joinPrivate1v1, startRanked1v1, switchToRandom, cancelMatchmake, startBattle, setReady, leaveBattle
    }), [
        gameState, 
        initGame, answerQuestion, useLifeline, nextQuestion, resetGame, finalizeGame,
        createSmallRoom, createRandomSmallRoom, joinSmallRoom, extendLobbyTimer, addAIPlayers, startSmallRoomGame,
        createPrivate1v1, joinPrivate1v1, startRanked1v1, switchToRandom, cancelMatchmake, startBattle, setReady, leaveBattle
    ]);

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) return {
        gameState: null,
        initGame: () => {},
        answerQuestion: async () => {},
        useLifeline: async () => {},
        nextQuestion: async () => {},
        resetGame: () => {},
        finalizeGame: () => {},
        createSmallRoom: async () => {},
        joinSmallRoom: async () => {},
        startSmallRoomGame: async () => {},
        extendLobbyTimer: () => {},
        addAIPlayers: () => {},
        createRandomSmallRoom: async () => {},
        createPrivate1v1: async () => {},
        joinPrivate1v1: async () => {},
        startRanked1v1: async () => {},
        startBattle: async () => {},
        switchToRandom: async () => {},
        cancelMatchmake: async () => {},
        setReady: async () => {},
        leaveBattle: async () => {},
    };
    return ctx;
}
