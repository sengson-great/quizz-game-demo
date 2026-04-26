import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../../api/axios';
import echo from '../../api/echo';
import { useAuth } from './AuthContext';
import { getFixedAvatar } from '../utils/avatar';

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
            
            setGameState(prev => ({
                ...(prev || {}),
                status: (session.status === 'completed' || session.status === 'failed') ? 'finished' : 'active',
                mode,
                matchId,
                currentQuestion: question,
                questions: [question],
                currentQuestionIndex: 0,
                playerScore: session.score || 0,
                answers: [],
                lifelines: parseLifelines(session.lifelines),
                eliminatedAnswers: [],
                opponents: mode === '1v1' 
                    ? (res.data.opponent 
                        ? [{ ...res.data.opponent, avatar: getFixedAvatar(res.data.opponent.id || res.data.opponent.name || res.data.opponent.username, res.data.opponent.avatar), score: 0, answered: false }]
                        : (prev?.opponents?.length ? prev.opponents : []))
                    : (res.data.opponents && res.data.opponents.length > 0
                        ? res.data.opponents.map(o => ({ ...o, avatar: getFixedAvatar(o.id || o.name || o.username, o.avatar), score: 0, answered: false }))
                        : (prev?.opponents?.length ? prev.opponents : [])),
                session,
            }));
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

            // Broadcast score update if correct
            if (isCorrect && gameState.matchId) {
                api.post('/multiplayer/action', {
                    match_id: gameState.matchId,
                    action_type: 'score_update',
                    payload: { score: result.score }
                }).catch(console.error);
            }

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

    const finalizedRef = useRef(new Set());
    const finalizeGame = useCallback(() => {
        if (gameState && gameState.matchId && !finalizedRef.current.has(gameState.matchId)) {
            finalizedRef.current.add(gameState.matchId);
            // Signal to others we finished
            api.post('/multiplayer/action', {
                match_id: gameState.matchId,
                action_type: 'player_finished',
                payload: { score: gameState.playerScore }
            }).catch(error => {
                console.error(error);
                finalizedRef.current.delete(gameState.matchId); // allow retry on failure
            });
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

    const bindMatchChannel = useCallback((matchId) => {
        if (!matchId) return;
        const channel = echo.private(`match.${matchId}`);
        
        channel.listen('.game.action', (e) => {
            if (e.action === 'player_finished' || e.action === 'score_update') {
                setGameState(prev => {
                    if (!prev || !prev.opponents) return prev;
                    const newOpponents = prev.opponents.map(opp => {
                        if (opp.id === e.user_id) {
                            return { 
                                ...opp, 
                                score: e.data?.score ?? opp.score, 
                                answered: e.action === 'player_finished' ? true : opp.answered 
                            };
                        }
                        return opp;
                    });
                    return { ...prev, opponents: newOpponents };
                });
            }
        });
        
        return () => echo.leave(`match.${matchId}`);
    }, []);

    const bindUserChannel = useCallback(() => {
        if (!currentUser) return;
        const channel = echo.private(`user.${currentUser.id}`);
        
        channel.listen('.battle.lobby.update', (e) => {
            setGameState(prev => {
                if (!prev || prev.lobbyBattleId !== e.battle_id) return prev;
                // Update players
                if (e.action === 'player_joined' || e.action === 'player_left' || e.action === 'player_ready') {
                    const mappedPlayers = (e.data.players || []).map(p => ({ ...p, avatar: getFixedAvatar(p.id || p.name || p.username, p.avatar) }));
                    
                    let newIsHost = prev.isHost;
                    if (e.action === 'player_left' && e.data.new_host_id && currentUser?.id === e.data.new_host_id) {
                        newIsHost = true;
                    }
                    
                    return { ...prev, lobbyPlayers: mappedPlayers, isHost: newIsHost };
                }
                return prev;
            });
        });

        channel.listen('.battle.started', (e) => {
            // Transition to active game
            initGame('battle', e.match_id);
        });

        channel.listen('.battle.lobby.closed', (e) => {
            setGameState(null);
        });

        channel.listen('.match.found', (e) => {
            initGame('1v1', e.match_id);
            setGameState(prev => prev ? { 
                ...prev, 
                opponents: [{ id: e.opponent.id, name: e.opponent.name, username: e.opponent.name, avatar: getFixedAvatar(e.opponent.id || e.opponent.name, e.opponent.avatar), score: 0 }],
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

    useEffect(() => {
        if (gameState?.matchId) {
            const unbind = bindMatchChannel(gameState.matchId);
            return unbind;
        }
    }, [gameState?.matchId, bindMatchChannel]);

    // Used for 1v1 Ranked Matchmaking
    const startRanked1v1 = useCallback(async (categories = []) => {
        try {
            setGameState({
                mode: '1v1',
                status: 'matchmaking',
                is_ranked: true,
                preferredCategories: categories,
                opponents: []
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
            const mappedPlayers = (data.players || []).map(p => ({ ...p, avatar: getFixedAvatar(p.id || p.name || p.username, p.avatar) }));
            setGameState({
                mode: playerCount === 2 ? '1v1' : 'Room',
                status: 'matchmaking',
                lobbyBattleId: data.battle_id,
                lobbyInviteCode: data.invite_code,
                lobbyPlayers: mappedPlayers,
                isHost: data.is_host !== false,
                roomSize: playerCount,
                isPrivate,
                opponents: []
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
            const mappedPlayers = (data.players || []).map(p => ({ ...p, avatar: getFixedAvatar(p.id || p.name || p.username, p.avatar) }));
            setGameState({
                mode: data.total_needed === 2 ? '1v1' : 'Room',
                status: 'matchmaking',
                lobbyBattleId: data.battle_id,
                lobbyInviteCode: inviteCode,
                lobbyPlayers: mappedPlayers,
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
        const inviteCode = gameState?.lobbyInviteCode;
        // Reset state immediately so UI doesn't wait on network
        setGameState(null);
        if (!inviteCode) return;
        // Fire leave in background — server will broadcast to remaining players
        api.post(`/multiplayer/battle/leave/${inviteCode}`).catch(console.error);
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
        createPrivate1v1, joinPrivate1v1, startRanked1v1, switchToRandom, cancelMatchmake, startBattle, setReady, leaveBattle, joinBattle
    }), [
        gameState, 
        initGame, answerQuestion, useLifeline, nextQuestion, resetGame, finalizeGame,
        createSmallRoom, createRandomSmallRoom, joinSmallRoom, extendLobbyTimer, addAIPlayers, startSmallRoomGame,
        createPrivate1v1, joinPrivate1v1, startRanked1v1, switchToRandom, cancelMatchmake, startBattle, setReady, leaveBattle, joinBattle
    ]);

    // Ping loop to keep presence active in lobbies
    useEffect(() => {
        if (!gameState?.lobbyInviteCode || gameState.status !== 'matchmaking') return;
        
        const interval = setInterval(() => {
            api.post(`/multiplayer/battle/ping/${gameState.lobbyInviteCode}`).catch(() => {});
        }, 2000);
        
        return () => clearInterval(interval);
    }, [gameState?.lobbyInviteCode, gameState?.status]);

    // Instant leave when tab is closed or hidden — uses keepalive fetch so it survives page unload
    useEffect(() => {
        if (!gameState?.lobbyInviteCode || gameState.status !== 'matchmaking') return;

        const inviteCode = gameState.lobbyInviteCode;

        const sendLeave = () => {
            const token = localStorage.getItem('auth_token');
            // VITE_API_BASE_URL is already '/api', so don't append '/api' again
            const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
            fetch(`${apiBase}/multiplayer/battle/leave/${inviteCode}`, {
                method: 'POST',
                keepalive: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            }).catch(() => {});
        };

        // Only fire on actual close/refresh — NOT on tab switch (visibilitychange fires on tab switch too)
        window.addEventListener('beforeunload', sendLeave);
        return () => window.removeEventListener('beforeunload', sendLeave);
    }, [gameState?.lobbyInviteCode, gameState?.status]);

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
