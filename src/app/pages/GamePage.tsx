import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameAnswer, AudienceData, LifelineType } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../data/questions';
import { CircularTimer } from '../components/game/CircularTimer';
import { AnswerOption } from '../components/game/AnswerOption';
import { LifelineButtons } from '../components/game/LifelineButtons';
import { OpponentProgress } from '../components/game/OpponentProgress';
import { AudienceModal } from '../components/game/AudienceModal';

const TOTAL_TIME = 30;
const RESULT_DELAY = 2200;

export default function GamePage() {
  const { gameState, answerQuestion, useLifeline, nextQuestion, simulateOpponentAnswer, finalizeGame } = useGame();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [timerActive, setTimerActive] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<GameAnswer | null>(null);
  const [lifelineModal, setLifelineModal] = useState<{ type: 'audience' | 'phone'; data: AudienceData | string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  useEffect(() => {
    if (!gameState || !currentUser) { navigate('/mode-select'); return; }
    if (gameState.status === 'finished') { navigate('/results'); return; }
  }, [gameState, currentUser, navigate]);

  useEffect(() => {
    if (!gameState) return;
    setTimeRemaining(TOTAL_TIME);
    setTimerActive(true);
    setSelectedAnswer(null);
    setRevealed(false);
    setLastAnswer(null);
    answeredRef.current = false;

    if (gameState.mode !== 'Solo') {
      simulateOpponentAnswer(gameState.currentQuestionIndex);
    }
  }, [gameState?.currentQuestionIndex]);

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, gameState?.currentQuestionIndex]);

  const submitAnswer = useCallback((answerId: string | null, time: number) => {
    if (answeredRef.current || !gameState) return;
    answeredRef.current = true;
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedAnswer(answerId);
    setRevealed(true);
    const result = answerQuestion(answerId, time);
    setLastAnswer(result);

    setTimeout(() => {
      const isLastQuestion = gameState.currentQuestionIndex >= gameState.questions.length - 1;
      if (isLastQuestion) {
        finalizeGame();
        navigate('/results');
      } else {
        nextQuestion();
      }
    }, RESULT_DELAY);
  }, [gameState, answerQuestion, nextQuestion, finalizeGame, navigate]);

  const handleTimerExpire = useCallback(() => {
    if (!answeredRef.current) submitAnswer(null, 0);
  }, [submitAnswer]);

  const handleLifeline = (type: LifelineType) => {
    if (!gameState || revealed) return;
    const result = useLifeline(type);
    if (type === 'skip') {
      submitAnswer(null, timeRemaining);
      return;
    }
    if (type === 'audience' && result) {
      setLifelineModal({ type: 'audience', data: result as AudienceData });
    }
    if (type === 'phone' && result) {
      setLifelineModal({ type: 'phone', data: result as string });
    }
  };

  if (!gameState || !currentUser) return null;

  const question = gameState.questions[gameState.currentQuestionIndex];
  if (!question) return null;

  const category = CATEGORIES.find(c => c.id === question.categoryId);
  const labels = ['A', 'B', 'C', 'D'];
  const qNum = gameState.currentQuestionIndex + 1;
  const total = gameState.questions.length;
  const progressPct = (qNum / total) * 100;

  const difficultyStyles: Record<string, { bg: string; color: string; border: string }> = {
    Easy: { bg: 'rgba(52,211,153,0.08)', color: '#059669', border: 'rgba(52,211,153,0.15)' },
    Medium: { bg: 'rgba(251,191,36,0.08)', color: '#d97706', border: 'rgba(251,191,36,0.15)' },
    Hard: { bg: 'rgba(244,63,94,0.08)', color: '#e11d48', border: 'rgba(244,63,94,0.15)' },
  };
  const ds = difficultyStyles[question.difficulty];

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-3xl mx-auto relative"
      style={{ background: 'linear-gradient(145deg, #fff5f5 0%, #fff0f0 50%, #ffffff 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* Result flash */}
      <AnimatePresence>
        {revealed && lastAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none"
            style={{
              background: lastAnswer.isCorrect
                ? 'linear-gradient(to top, rgba(52,211,153,0.08), transparent)'
                : 'linear-gradient(to top, rgba(244,63,94,0.08), transparent)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}`, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            {question.difficulty}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <span>{category?.icon}</span>
            <span>{category?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            {qNum}/{total}
          </span>
          <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #e8364e, #f43f5e)' }}
              animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </div>

      {/* Score display */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">{currentUser.avatar}</span>
          <div>
            <p className="text-gray-800 text-sm">{currentUser.username}</p>
            <motion.p
              key={gameState.playerScore}
              initial={{ scale: 1.2, color: '#e8364e' }}
              animate={{ scale: 1, color: '#f43f5e' }}
              className="text-xs"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              {gameState.playerScore.toLocaleString()} pts
            </motion.p>
          </div>
        </div>

        <CircularTimer
          timeRemaining={timeRemaining}
          totalTime={TOTAL_TIME}
          onExpire={handleTimerExpire}
          isActive={timerActive}
        />

        <div className="text-right">
          <p className="text-gray-400 text-xs">Mode</p>
          <p className="text-rose-500 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{gameState.mode}</p>
        </div>
      </div>

      {/* Opponent progress */}
      {gameState.mode !== 'Solo' && (
        <div className="mb-4 relative z-10">
          <OpponentProgress
            opponents={gameState.opponents}
            playerScore={gameState.playerScore}
            playerAvatar={currentUser.avatar}
            playerName={currentUser.username}
          />
        </div>
      )}

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 mb-6"
        >
          <div className="rounded-2xl p-6 mb-4 bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <p className="text-gray-800 text-lg leading-relaxed">{question.text}</p>
          </div>

          {/* Answers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.answers.map((answer, i) => (
              <AnswerOption
                key={answer.id}
                id={answer.id}
                text={answer.text}
                label={labels[i]}
                isSelected={selectedAnswer === answer.id}
                isCorrect={answer.isCorrect}
                isEliminated={gameState.eliminatedAnswers.includes(answer.id)}
                revealed={revealed}
                disabled={revealed || answeredRef.current}
                onClick={() => !revealed && !answeredRef.current && submitAnswer(answer.id, timeRemaining)}
                index={i}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Result feedback */}
      <AnimatePresence>
        {revealed && lastAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-10 rounded-2xl p-4 mb-4"
            style={{
              background: lastAnswer.isCorrect ? 'rgba(52,211,153,0.06)' : 'rgba(244,63,94,0.06)',
              border: `1px solid ${lastAnswer.isCorrect ? 'rgba(52,211,153,0.15)' : 'rgba(244,63,94,0.15)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${lastAnswer.isCorrect ? 'text-emerald-600' : 'text-rose-500'}`} style={{ fontWeight: 600 }}>
                  {lastAnswer.isCorrect ? '✓ Correct!' : selectedAnswer === null ? '⏰ Time\'s up!' : '✗ Wrong!'}
                </p>
                {question.explanation && (
                  <p className="text-gray-500 text-xs mt-1">{question.explanation}</p>
                )}
              </div>
              {lastAnswer.isCorrect && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                  className="text-amber-500 text-right">
                  <p className="text-xs text-gray-400">Points</p>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>+{lastAnswer.pointsEarned}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lifelines */}
      <div className="relative z-10 mt-auto pt-4">
        <LifelineButtons
          lifelines={gameState.lifelines}
          onUse={handleLifeline}
          disabled={revealed}
        />
      </div>

      {/* Lifeline Modal */}
      <AnimatePresence>
        {lifelineModal && (
          <AudienceModal
            type={lifelineModal.type}
            answers={question.answers}
            audienceData={lifelineModal.type === 'audience' ? lifelineModal.data as AudienceData : undefined}
            phoneMessage={lifelineModal.type === 'phone' ? lifelineModal.data as string : undefined}
            onClose={() => setLifelineModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
