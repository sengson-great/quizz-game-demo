import React, { createContext, useContext, useState, useCallback } from 'react';
import { Question, buildGameQuestions } from '../data/questions';
import { SIMULATED_OPPONENTS } from '../data/mockData';
import { useAuth } from './AuthContext';

export type GameMode = 'Solo' | '1v1' | 'Room';
export type LifelineType = 'fifty' | 'skip' | 'audience' | 'phone';

export interface SimulatedOpponent {
  id: string;
  username: string;
  avatar: string;
  score: number;
  answered: boolean;
  skillLevel: number;
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
}

const GameContext = createContext<GameContextType | null>(null);

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
      lifelines: { fifty: false, skip: false, audience: false, phone: false },
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
    if (gameState.lifelines[type]) return null; // Already used

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
      // Clear existing timeouts
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

  return (
    <GameContext.Provider value={{ gameState, initGame, answerQuestion, useLifeline, nextQuestion, simulateOpponentAnswer, resetGame, finalizeGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}