import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Question, buildGameQuestions } from '../data/questions';
import { SIMULATED_OPPONENTS } from '../data/mockData';
import { useAuth } from './AuthContext';

export type GameMode = 'Solo' | '1v1' | 'Room';
export type LifelineType = 'fifty' | 'skip' | 'audience' | 'phone' | 'doubleDip';
export type JoinType = 'Link' | 'Code' | 'Random';

export interface SimulatedOpponent {
  id: string;
  username: string;
  avatar: string;
  score: number;
  answered: boolean;
  skillLevel: number;
  isBot?: boolean;
}

export interface GameAnswer {
  questionId: string;
  selectedAnswerId: string | null;
  correctAnswerId: string;
  isCorrect: boolean;
  timeRemaining: number;
  pointsEarned: number;
}

export interface LifelineState {
  fifty: boolean;
  skip: boolean;
  audience: boolean;
  phone: boolean;
  doubleDip: boolean;
}

export interface AudienceData {
  [answerId: string]: number;
}

export interface GameState {
  mode: GameMode;
  questions: Question[];
  currentQuestionIndex: number;
  answers: GameAnswer[];
  playerScore: number;
  opponents: SimulatedOpponent[];
  roomCode: string;
  lifelines: LifelineState;
  eliminatedAnswers: string[];
  status: 'matchmaking' | 'active' | 'finished';
  // Lobby fields
  isHost?: boolean;
  lobbyPlayers?: { id: string; username: string; avatar: string; isBot?: boolean; joinType?: JoinType }[];
  lobbyCountdown?: number;
  lobbyStatus?: 'waiting' | 'ready' | 'expired';
  roomSize?: number; // Dynamic: up to 5 for Room, 2 for 1v1
  isPrivate?: boolean;
  // New ERD fields
  expires_at?: number; // Unix timestamp (60 min from creation for invite modes)
  is_joinable?: boolean; // false when "Start Play" clicked or room hits max
  is_ranked?: boolean; // true for ranked 1v1
}

interface GameContextType {
  gameState: GameState | null;
  initGame: (mode: GameMode, categoryIds: string[]) => void;
  answerQuestion: (answerId: string | null, timeRemaining: number) => GameAnswer;
  useLifeline: (type: LifelineType) => AudienceData | string | null;
  nextQuestion: () => void;
  simulateOpponentAnswer: (questionIndex: number) => void;
  resetGame: () => void;
  finalizeGame: () => void;
  // Small Room Mode lobby methods
  createSmallRoom: (categoryIds: string[]) => string; // Invite Room (dynamic 3-5)
  createRandomSmallRoom: (categoryIds: string[]) => void; // Random Room (auto-fill & start)
  joinSmallRoom: (roomCode: string) => void;
  startSmallRoomGame: () => void;
  extendLobbyTimer: () => void;
  addAIPlayers: (count: number) => void;
  // 1v1 Battle methods
  createPrivate1v1: (categoryIds: string[]) => string; // Invite Friend
  joinPrivate1v1: (roomCode: string) => void;
  startRanked1v1: (categoryIds: string[]) => string; // Random Match
  switchToRandom: () => void; // Switch private lobby to public matchmaking
  startBattle: () => void; // Start 1v1 battle when opponent joined
}

const GameContext = createContext<GameContextType | null>(null);

const defaultGameContext: GameContextType = {
  gameState: null,
  initGame: () => {},
  answerQuestion: () => ({ questionId: '', selectedAnswerId: null, correctAnswerId: '', isCorrect: false, timeRemaining: 0, pointsEarned: 0 }),
  useLifeline: () => null,
  nextQuestion: () => {},
  simulateOpponentAnswer: () => {},
  resetGame: () => {},
  finalizeGame: () => {},
  createSmallRoom: () => '',
  createRandomSmallRoom: () => {},
  joinSmallRoom: () => {},
  startSmallRoomGame: () => {},
  extendLobbyTimer: () => {},
  addAIPlayers: () => {},
  createPrivate1v1: () => '',
  joinPrivate1v1: () => {},
  startRanked1v1: () => '',
  switchToRandom: () => {},
  startBattle: () => {},
};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function calculatePoints(difficulty: Question['difficulty'], timeRemaining: number): number {
  const base = difficulty === 'Easy' ? 100 : difficulty === 'Medium' ? 200 : 300;
  const timeBonus = Math.round((timeRemaining / 30) * base);
  return base + timeBonus;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { currentUser, updateUser } = useAuth();
  const timeoutRefs = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const lobbyTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      if (lobbyTimerRef.current) clearInterval(lobbyTimerRef.current);
    };
  }, []);

  const initGame = useCallback((mode: GameMode, categoryIds: string[]) => {
    const questions = buildGameQuestions(categoryIds);
    const opponentPool = [...SIMULATED_OPPONENTS].sort(() => Math.random() - 0.5);

    let opponents: SimulatedOpponent[] = [];
    if (mode === '1v1') {
      opponents = [{ ...opponentPool[0], score: 0, answered: false }];
    } else if (mode === 'Room') {
      const count = Math.floor(Math.random() * 3) + 2; // 2-4 opponents
      opponents = opponentPool.slice(0, count).map(o => ({ ...o, score: 0, answered: false }));
    }

    setGameState({
      mode,
      questions,
      currentQuestionIndex: 0,
      answers: [],
      playerScore: 0,
      opponents,
      roomCode: generateRoomCode(),
      lifelines: { fifty: false, skip: false, audience: false, phone: false, doubleDip: false },
      eliminatedAnswers: [],
      status: 'matchmaking',
    });
  }, []);

  const answerQuestion = useCallback((answerId: string | null, timeRemaining: number): GameAnswer => {
    if (!gameState) throw new Error('No active game');
    const question = gameState.questions[gameState.currentQuestionIndex];
    const correctAnswer = question.answers.find(a => a.isCorrect)!;
    const isCorrect = answerId === correctAnswer.id;
    const pointsEarned = isCorrect ? calculatePoints(question.difficulty, timeRemaining) : 0;

    const gameAnswer: GameAnswer = {
      questionId: question.id,
      selectedAnswerId: answerId,
      correctAnswerId: correctAnswer.id,
      isCorrect,
      timeRemaining,
      pointsEarned,
    };

    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: [...prev.answers, gameAnswer],
        playerScore: prev.playerScore + pointsEarned,
      };
    });

    return gameAnswer;
  }, [gameState]);

  const useLifeline = useCallback((type: LifelineType): AudienceData | string | null => {
    if (!gameState) return null;
    if (gameState.lifelines[type]) return null;

    const question = gameState.questions[gameState.currentQuestionIndex];
    const correctAnswer = question.answers.find(a => a.isCorrect)!;
    const difficulty = question.difficulty;

    const correctProbability = difficulty === 'Easy' ? 0.70 : difficulty === 'Medium' ? 0.55 : 0.40;

    setGameState(prev => {
      if (!prev) return prev;
      const newLifelines = { ...prev.lifelines, [type]: true };
      let newEliminated = prev.eliminatedAnswers;

      if (type === 'fifty') {
        const wrongAnswers = question.answers.filter(a => !a.isCorrect);
        const toEliminate = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
        newEliminated = toEliminate.map(a => a.id);
      }

      return { ...prev, lifelines: newLifelines, eliminatedAnswers: newEliminated };
    });

    if (type === 'audience') {
      const total = 100;
      const correctVotes = Math.round(correctProbability * total);
      const remaining = total - correctVotes;
      const wrongAnswers = question.answers.filter(a => !a.isCorrect);
      const splits = [Math.round(remaining * 0.5), Math.round(remaining * 0.3)];
      splits.push(remaining - splits[0] - splits[1]);
      const data: AudienceData = { [correctAnswer.id]: correctVotes };
      wrongAnswers.forEach((a, i) => { data[a.id] = splits[i] || 0; });
      return data;
    }

    if (type === 'phone') {
      const isCorrectGuess = Math.random() < correctProbability;
      const guessAnswer = isCorrectGuess
        ? correctAnswer
        : question.answers.filter(a => !a.isCorrect)[Math.floor(Math.random() * 3)];
      const confidence = Math.round(correctProbability * 100);
      return `"I'm pretty sure the answer is "${guessAnswer.text}"... I'm about ${confidence}% confident on this one!"`;
    }

    return null;
  }, [gameState]);

  const nextQuestion = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const nextIndex = prev.currentQuestionIndex + 1;
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        eliminatedAnswers: [],
        opponents: prev.opponents.map(o => ({ ...o, answered: false })),
        status: nextIndex >= prev.questions.length ? 'finished' : 'active',
      };
    });
  }, []);

  const simulateOpponentAnswer = useCallback((questionIndex: number) => {
    setGameState(prev => {
      if (!prev) return prev;
      const question = prev.questions[questionIndex];
      if (!question) return prev;
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
      prev.opponents.forEach(opponent => {
        const delay = Math.random() * 20000 + 5000;
        const t = setTimeout(() => {
          setGameState(inner => {
            if (!inner || inner.currentQuestionIndex !== questionIndex) return inner;
            const isCorrect = Math.random() < opponent.skillLevel;
            const timeUsed = delay / 1000;
            const timeRemaining = Math.max(0, 30 - timeUsed);
            const points = isCorrect ? calculatePoints(question.difficulty, timeRemaining) : 0;
            return {
              ...inner,
              opponents: inner.opponents.map(o =>
                o.id === opponent.id ? { ...o, score: o.score + points, answered: true } : o
              ),
            };
          });
        }, delay);
        timeoutRefs.current.push(t);
      });
      return { ...prev, status: 'active' as const };
    });
  }, []);

  const finalizeGame = useCallback(() => {
    if (!gameState || !currentUser) return;
    const correctCount = gameState.answers.filter(a => a.isCorrect).length;
    const isWin = gameState.mode === 'Solo' || gameState.playerScore > Math.max(...gameState.opponents.map(o => o.score));
    updateUser({
      totalScore: currentUser.totalScore + gameState.playerScore,
      gamesPlayed: currentUser.gamesPlayed + 1,
      wins: currentUser.wins + (isWin ? 1 : 0),
    });
  }, [gameState, currentUser, updateUser]);

  const resetGame = useCallback(() => {
    setGameState(null);
  }, []);

  // ==================== SMALL ROOM METHODS ====================

  // Invite Room: Dynamic capacity 3-5, no fixed size. Host creates, friends join.
  const createSmallRoom = useCallback((categoryIds: string[]) => {
    const questions = buildGameQuestions(categoryIds);
    const roomCode = generateRoomCode();
    const expiresAt = Date.now() + 60 * 1000; // 60 seconds
    setGameState({
      mode: 'Room',
      questions,
      currentQuestionIndex: 0,
      answers: [],
      playerScore: 0,
      opponents: [],
      roomCode,
      lifelines: { fifty: false, skip: false, audience: false, phone: false, doubleDip: false },
      eliminatedAnswers: [],
      status: 'matchmaking',
      isHost: true,
      lobbyPlayers: [{ id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar, joinType: 'Link' }],
      lobbyCountdown: 60, // 60 seconds
      lobbyStatus: 'waiting',
      roomSize: 5, // Dynamic max capacity
      isPrivate: true,
      expires_at: expiresAt,
      is_joinable: true,
    });
    return roomCode;
  }, [currentUser]);

  // Random Room: Auto-fill 3-5 slots with AI players, auto-start
  const createRandomSmallRoom = useCallback((categoryIds: string[]) => {
    const questions = buildGameQuestions(categoryIds);
    const roomCode = generateRoomCode();
    const playerCount = Math.floor(Math.random() * 3) + 3; // 3-5 total
    const aiCount = playerCount - 1;

    const aiPlayers = [...SIMULATED_OPPONENTS]
      .sort(() => Math.random() - 0.5)
      .slice(0, aiCount)
      .map(o => ({
        id: o.id,
        username: o.username,
        avatar: o.avatar,
        isBot: false, // Treated as "real" players in random mode
        joinType: 'Random' as JoinType,
      }));

    const opponents = aiPlayers.map(p => {
      const opp = SIMULATED_OPPONENTS.find(o => o.id === p.id)!;
      return { ...opp, score: 0, answered: false };
    });

    setGameState({
      mode: 'Room',
      questions,
      currentQuestionIndex: 0,
      answers: [],
      playerScore: 0,
      opponents,
      roomCode,
      lifelines: { fifty: false, skip: false, audience: false, phone: false, doubleDip: false },
      eliminatedAnswers: [],
      status: 'matchmaking',
      isHost: true,
      lobbyPlayers: [
        { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar, joinType: 'Random' },
        ...aiPlayers,
      ],
      lobbyCountdown: 0,
      lobbyStatus: 'waiting',
      roomSize: playerCount,
      isPrivate: false,
      is_joinable: false,
      is_ranked: false,
    });
  }, [currentUser]);

  const joinSmallRoom = useCallback((roomCode: string) => {
    setGameState(prev => {
      if (!prev || prev.mode !== 'Room' || prev.status !== 'matchmaking') return prev;
      if (!prev.is_joinable) return prev;
      if (prev.lobbyPlayers?.some(p => p.id === currentUser.id)) return prev;
      const maxPlayers = 5;
      if ((prev.lobbyPlayers?.length || 0) >= maxPlayers) return prev;
      const newPlayers = [...prev.lobbyPlayers!, { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar, joinType: 'Code' as JoinType }];
      return {
        ...prev,
        lobbyPlayers: newPlayers,
        is_joinable: newPlayers.length < 5,
      };
    });
  }, [currentUser]);

  const startSmallRoomGame = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.mode !== 'Room' || prev.status !== 'matchmaking') return prev;
      if (!prev.lobbyPlayers || prev.lobbyPlayers.length < 3) return prev; // Min 3 players

      const opponents = prev.lobbyPlayers
        .filter(player => player.id !== currentUser.id)
        .map(player => ({
          ...player,
          score: 0,
          answered: false,
          skillLevel: Math.random() * 0.4 + 0.5,
        }));

      return {
        ...prev,
        opponents,
        status: 'active',
        lobbyStatus: 'ready',
        is_joinable: false,
      };
    });
  }, [currentUser]);

  const extendLobbyTimer = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.status !== 'matchmaking') return prev;
      if (prev.lobbyStatus !== 'waiting') return prev;
      return {
        ...prev,
        lobbyCountdown: 60,
        expires_at: Date.now() + 60 * 1000,
      };
    });
  }, []);

  const addAIPlayers = useCallback((count: number) => {
    setGameState(prev => {
      if (!prev || prev.mode !== 'Room' || prev.status !== 'matchmaking') return prev;
      const maxPlayers = 5;
      const currentCount = prev.lobbyPlayers?.length || 0;
      const actualCount = Math.min(count, maxPlayers - currentCount);
      if (actualCount <= 0) return prev;

      const existingIds = new Set(prev.lobbyPlayers?.map(p => p.id) || []);
      const aiPlayers = [...SIMULATED_OPPONENTS]
        .filter(o => !existingIds.has(o.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, actualCount)
        .map(o => ({
          id: o.id,
          username: o.username,
          avatar: o.avatar,
          isBot: true,
          joinType: 'Random' as JoinType,
        }));

      return {
        ...prev,
        lobbyPlayers: [...(prev.lobbyPlayers || []), ...aiPlayers],
      };
    });
  }, []);

  // ==================== 1v1 BATTLE METHODS ====================

  // Invite Friend: 60-second window, Room Link/Code
  const createPrivate1v1 = useCallback((categoryIds: string[]) => {
    const questions = buildGameQuestions(categoryIds);
    const roomCode = generateRoomCode();
    const expiresAt = Date.now() + 60 * 1000; // 60 seconds
    setGameState({
      mode: '1v1',
      questions,
      currentQuestionIndex: 0,
      answers: [],
      playerScore: 0,
      opponents: [],
      roomCode,
      lifelines: { fifty: false, skip: false, audience: false, phone: false, doubleDip: false },
      eliminatedAnswers: [],
      status: 'matchmaking',
      isHost: true,
      lobbyPlayers: [{ id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar, joinType: 'Link' }],
      lobbyCountdown: 60, // 60 seconds
      lobbyStatus: 'waiting',
      isPrivate: true,
      roomSize: 2,
      expires_at: expiresAt,
      is_joinable: true,
      is_ranked: false,
    });
    return roomCode;
  }, [currentUser]);

  const joinPrivate1v1 = useCallback((roomCode: string) => {
    setGameState(prev => {
      if (!prev || prev.mode !== '1v1' || prev.status !== 'matchmaking') return prev;
      if (!prev.is_joinable) return prev;
      if (prev.lobbyPlayers?.some(p => p.id === currentUser.id)) return prev;
      if ((prev.lobbyPlayers?.length || 0) >= 2) return prev;
      return {
        ...prev,
        lobbyPlayers: [...prev.lobbyPlayers!, { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar, joinType: 'Code' as JoinType }],
        is_joinable: false,
      };
    });
  }, [currentUser]);

  // Random Match: Search for human, fallback to AI "System Random"
  const startRanked1v1 = useCallback((categoryIds: string[]) => {
    const questions = buildGameQuestions(categoryIds);
    const roomCode = generateRoomCode();
    setGameState({
      mode: '1v1',
      questions,
      currentQuestionIndex: 0,
      answers: [],
      playerScore: 0,
      opponents: [],
      roomCode,
      lifelines: { fifty: false, skip: false, audience: false, phone: false, doubleDip: false },
      eliminatedAnswers: [],
      status: 'matchmaking',
      isHost: true,
      lobbyPlayers: [{ id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar, joinType: 'Random' }],
      lobbyCountdown: 30, // Short search window
      lobbyStatus: 'waiting',
      isPrivate: false,
      roomSize: 2,
      is_joinable: false,
      is_ranked: true,
    });
    return roomCode;
  }, [currentUser]);

  // Switch private 1v1 lobby to public matchmaking (PATCH is_private: false)
  const switchToRandom = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.mode !== '1v1' || !prev.isPrivate) return prev;
      return {
        ...prev,
        isPrivate: false,
        is_ranked: true,
        lobbyCountdown: 30, // Reset to short search window
      };
    });
  }, []);

  // Start 1v1 battle when opponent is in lobby
  const startBattle = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.mode !== '1v1' || prev.status !== 'matchmaking') return prev;
      if (!prev.lobbyPlayers || prev.lobbyPlayers.length < 2) return prev;

      const opponents = prev.lobbyPlayers
        .filter(player => player.id !== currentUser.id)
        .map(player => ({
          ...player,
          score: 0,
          answered: false,
          skillLevel: Math.random() * 0.4 + 0.5,
        }));

      return {
        ...prev,
        opponents,
        status: 'active',
        lobbyStatus: 'ready',
        is_joinable: false,
      };
    });
  }, [currentUser]);

  return (
    <GameContext.Provider value={{
      gameState, initGame, answerQuestion, useLifeline, nextQuestion, simulateOpponentAnswer,
      resetGame, finalizeGame,
      createSmallRoom, createRandomSmallRoom, joinSmallRoom, startSmallRoomGame, extendLobbyTimer, addAIPlayers,
      createPrivate1v1, joinPrivate1v1, startRanked1v1, switchToRandom, startBattle,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) return defaultGameContext;
  return ctx;
}