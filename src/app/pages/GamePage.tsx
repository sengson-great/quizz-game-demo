import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameAnswer, AudienceData, LifelineType } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../data/questions';
import { CircularTimer } from '../components/game/CircularTimer';
import { AnswerOption } from '../components/game/AnswerOption';
import { LifelineButtons } from '../components/game/LifelineButtons';
import { LiveScorePanel } from '../components/game/LiveScorePanel';
import { AudienceModal } from '../components/game/AudienceModal';
import { ReturnButton } from '../components/ui/ReturnButton';

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
  const doubleDipActiveRef = useRef(false);
  const doubleDipFirstAnswerRef = useRef<string | null>(null);
  const [doubleDipWrongId, setDoubleDipWrongId] = useState<string | null>(null);

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
    doubleDipActiveRef.current = false;
    doubleDipFirstAnswerRef.current = null;
    setDoubleDipWrongId(null);

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

    // Handle Double Dip: if active and first answer was wrong, allow second try
    if (doubleDipActiveRef.current && doubleDipFirstAnswerRef.current) {
      doubleDipActiveRef.current = false;
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
      return;
    }

    // Check if Double Dip is active for first attempt
    if (doubleDipActiveRef.current && !doubleDipFirstAnswerRef.current) {
      const question = gameState.questions[gameState.currentQuestionIndex];
      const correctAnswer = question.answers.find(a => a.isCorrect)!;
      const isCorrect = answerId === correctAnswer.id;

      if (!isCorrect && answerId !== null) {
        doubleDipFirstAnswerRef.current = answerId;
        setDoubleDipWrongId(answerId);
        setSelectedAnswer(answerId);
        setTimeout(() => {
          setSelectedAnswer(null);
        }, 800);
        return;
      }
      doubleDipActiveRef.current = false;
    }

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
    if (type === 'doubleDip') {
      doubleDipActiveRef.current = true;
      doubleDipFirstAnswerRef.current = null;
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
    Easy: { bg: 'rgba(52,211,153,0.1)', color: '#34d399', border: 'rgba(52,211,153,0.2)' },
    Medium: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
    Hard: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.2)' },
  };
  const ds = difficultyStyles[question.difficulty];

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-3xl mx-auto relative"
      style={{ background: 'linear-gradient(145deg, #0a0e27 0%, #131842 40%, #1a1145 70%, #0f172a 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      
      {/* Result flash overlay */}
      <AnimatePresence>
        {revealed && lastAnswer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              background: lastAnswer.isCorrect
                ? 'linear-gradient(to top, rgba(52,211,153,0.08), transparent)'
                : 'linear-gradient(to top, rgba(239,68,68,0.08), transparent)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ TOP-LEFT: Return Button (highest z-index, Saturated Crimson outline) ═══ */}
      <div className="fixed top-4 left-4 z-[60]">
        <ReturnButton context="game" />
      </div>

      {/* ═══ TOP BAR: Progress Center + Live Scores Right ═══ */}
      <div className="flex items-center justify-between mb-4 relative z-30 pt-1">
        {/* Left: Difficulty badge + category (offset for return button) */}
        <div className="flex items-center gap-2 ml-14">
          <div className="text-xs px-3 py-1.5 rounded-full"
            style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}`, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            {question.difficulty}
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span>{category?.icon}</span>
            <span className="hidden sm:inline">{category?.name}</span>
          </div>
        </div>

        {/* Center: 15-Question Progress Bar + Timer */}
        <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-1">
            <span className="text-slate-500 text-[10px]" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              Q{qNum}/{total}
            </span>
            <div className="w-28 sm:w-36 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
          <CircularTimer
            timeRemaining={timeRemaining}
            totalTime={TOTAL_TIME}
            onExpire={handleTimerExpire}
            isActive={timerActive}
          />
        </div>

        {/* Right: Live Scores */}
        <LiveScorePanel
          playerScore={gameState.playerScore}
          playerAvatar={currentUser.avatar}
          playerName={currentUser.username}
          opponents={gameState.opponents}
          mode={gameState.mode}
        />
      </div>

      {/* ═══ 1v1 TUG-OF-WAR BAR (below top bar, only for 1v1) ═══ */}
      {gameState.mode === '1v1' && gameState.opponents.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 relative z-20"
        >
          <TugOfWarBar
            playerScore={gameState.playerScore}
            playerAvatar={currentUser.avatar}
            opponentScore={gameState.opponents[0].score}
            opponentAvatar={gameState.opponents[0].avatar}
            opponentName={gameState.opponents[0].username}
          />
        </motion.div>
      )}

      {/* Room mode: compact opponent list */}
      {gameState.mode === 'Room' && gameState.opponents.length > 0 && (
        <div className="mb-3 relative z-20">
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
            {gameState.opponents.map(opp => (
              <motion.div
                key={opp.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg flex-shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${opp.answered ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <span className="text-sm">{opp.avatar}</span>
                <span className="text-xs text-slate-400">{opp.username.slice(0, 8)}</span>
                <motion.span
                  key={opp.score}
                  initial={{ scale: 1.2, color: '#f472b6' }}
                  animate={{ scale: 1, color: '#94a3b8' }}
                  className="text-xs tabular-nums"
                  style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                  {opp.score}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ CENTER: Question Card ═══ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 mb-6 flex-1 flex flex-col"
        >
          <div className="rounded-2xl p-6 mb-4"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white text-lg leading-relaxed">{question.text}</p>
          </div>

          {/* ═══ BOTTOM AREA: 4 Answer Buttons ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.answers.map((answer, i) => {
              const isDoubleDipWrong = doubleDipWrongId === answer.id;
              return (
                <AnswerOption
                  key={answer.id}
                  id={answer.id}
                  text={answer.text}
                  label={labels[i]}
                  isSelected={selectedAnswer === answer.id}
                  isCorrect={answer.isCorrect}
                  isEliminated={gameState.eliminatedAnswers.includes(answer.id) || isDoubleDipWrong}
                  revealed={revealed}
                  disabled={revealed || answeredRef.current || isDoubleDipWrong}
                  onClick={() => !revealed && !answeredRef.current && !isDoubleDipWrong && submitAnswer(answer.id, timeRemaining)}
                  index={i}
                />
              );
            })}
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
              background: lastAnswer.isCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${lastAnswer.isCorrect ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${lastAnswer.isCorrect ? 'text-emerald-400' : 'text-red-400'}`} style={{ fontWeight: 600 }}>
                  {lastAnswer.isCorrect ? '✓ Correct!' : selectedAnswer === null ? '⏰ Time\'s up!' : '✗ Wrong!'}
                </p>
                {question.explanation && (
                  <p className="text-slate-400 text-xs mt-1">{question.explanation}</p>
                )}
              </div>
              {lastAnswer.isCorrect && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                  className="text-amber-400 text-right">
                  <p className="text-xs text-slate-500">Points</p>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>+{lastAnswer.pointsEarned}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ BOTTOM: 5 Lifelines ═══ */}
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

/* ═══ Tug-of-War Bar Component (1v1 only) ═══ */
function TugOfWarBar({
  playerScore,
  playerAvatar,
  opponentScore,
  opponentAvatar,
  opponentName,
}: {
  playerScore: number;
  playerAvatar: string;
  opponentScore: number;
  opponentAvatar: string;
  opponentName: string;
}) {
  const total = playerScore + opponentScore;
  const playerPct = total > 0 ? (playerScore / total) * 100 : 50;
  const isLeading = playerScore > opponentScore;
  const isTied = playerScore === opponentScore;

  return (
    <div className="rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Labels */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{playerAvatar}</span>
          <span className="text-xs text-indigo-400" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            You
          </span>
          {isLeading && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              LEAD
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {!isLeading && !isTied && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20">
              LEAD
            </motion.span>
          )}
          <span className="text-xs text-pink-400" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
            {opponentName}
          </span>
          <span className="text-sm">{opponentAvatar}</span>
        </div>
      </div>

      {/* Tug-of-War Progress Bar */}
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="absolute left-0 top-0 h-full rounded-l-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #818cf8)' }}
          animate={{ width: `${playerPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute right-0 top-0 h-full rounded-r-full"
          style={{ background: 'linear-gradient(270deg, #ec4899, #f472b6)' }}
          animate={{ width: `${100 - playerPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Center marker */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full -translate-x-1/2"
          style={{ background: 'rgba(255,255,255,0.15)' }} />
        {/* Momentum indicator dot */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg"
          animate={{ left: `${playerPct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ marginLeft: '-4px', boxShadow: '0 0 8px rgba(255,255,255,0.5)' }}
        />
      </div>
    </div>
  );
}
