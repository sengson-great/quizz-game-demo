import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useGame, GameAnswer, AudienceData, LifelineType } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORIES } from '../data/questions';
import { loadSystemConfig } from '../data/systemConfig';
import { CircularTimer } from '../components/game/CircularTimer';
import { AnswerOption } from '../components/game/AnswerOption';
import { LifelineButtons } from '../components/game/LifelineButtons';
import { LiveScorePanel } from '../components/game/LiveScorePanel';
import { AudienceModal } from '../components/game/AudienceModal';
import { ReturnButton } from '../components/ui/ReturnButton';

const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';
const RESULT_DELAY = 2200;

export default function GamePage() {
  const { gameState, answerQuestion, useLifeline, nextQuestion, simulateOpponentAnswer, finalizeGame } = useGame();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const sysConfig = useMemo(() => loadSystemConfig(), []);
  const TOTAL_TIME = sysConfig.timerDuration;

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
  const [oppScorePulse, setOppScorePulse] = useState(false);
  const prevOppScoreRef = useRef(0);

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
    if (gameState.mode !== 'Solo') simulateOpponentAnswer(gameState.currentQuestionIndex);
  }, [gameState?.currentQuestionIndex]);

  useEffect(() => {
    if (!gameState || gameState.opponents.length === 0) return;
    const totalOppScore = gameState.opponents.reduce((s, o) => s + o.score, 0);
    if (totalOppScore > prevOppScoreRef.current) { setOppScorePulse(true); setTimeout(() => setOppScorePulse(false), 600); }
    prevOppScoreRef.current = totalOppScore;
  }, [gameState?.opponents]);

  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => { if (prev <= 1) { clearInterval(timerRef.current!); return 0; } return prev - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, gameState?.currentQuestionIndex]);

  const submitAnswer = useCallback((answerId: string | null, time: number) => {
    if (answeredRef.current || !gameState) return;
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
        if (gameState.currentQuestionIndex >= gameState.questions.length - 1) { finalizeGame(); navigate('/results'); } else { nextQuestion(); }
      }, RESULT_DELAY);
      return;
    }
    if (doubleDipActiveRef.current && !doubleDipFirstAnswerRef.current) {
      const question = gameState.questions[gameState.currentQuestionIndex];
      const correctAnswer = question.answers.find(a => a.isCorrect)!;
      const isCorrect = answerId === correctAnswer.id;
      if (!isCorrect && answerId !== null) {
        doubleDipFirstAnswerRef.current = answerId;
        setDoubleDipWrongId(answerId);
        setSelectedAnswer(answerId);
        setTimeout(() => { setSelectedAnswer(null); }, 800);
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
      if (gameState.currentQuestionIndex >= gameState.questions.length - 1) { finalizeGame(); navigate('/results'); } else { nextQuestion(); }
    }, RESULT_DELAY);
  }, [gameState, answerQuestion, nextQuestion, finalizeGame, navigate]);

  const handleTimerExpire = useCallback(() => { if (!answeredRef.current) submitAnswer(null, 0); }, [submitAnswer]);

  const handleLifeline = (type: LifelineType) => {
    if (!gameState || revealed) return;
    const lifelineConfigMap: Record<LifelineType, boolean> = { fifty: sysConfig.enableFiftyFifty, skip: sysConfig.enableSkip, audience: sysConfig.enableAudience, phone: sysConfig.enablePhone, doubleDip: sysConfig.enableDoubleDip };
    if (!lifelineConfigMap[type]) return;
    const result = useLifeline(type);
    if (type === 'skip') { submitAnswer(null, timeRemaining); return; }
    if (type === 'doubleDip') { doubleDipActiveRef.current = true; doubleDipFirstAnswerRef.current = null; return; }
    if (type === 'audience' && result) setLifelineModal({ type: 'audience', data: result as AudienceData });
    if (type === 'phone' && result) setLifelineModal({ type: 'phone', data: result as string });
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
    Hard: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'rgba(239,68,68,0.15)' },
  };
  const ds = difficultyStyles[question.difficulty];

  const enabledLifelines = {
    fifty: sysConfig.enableFiftyFifty ? gameState.lifelines.fifty : true,
    skip: sysConfig.enableSkip ? gameState.lifelines.skip : true,
    audience: sysConfig.enableAudience ? gameState.lifelines.audience : true,
    phone: sysConfig.enablePhone ? gameState.lifelines.phone : true,
    doubleDip: sysConfig.enableDoubleDip ? gameState.lifelines.doubleDip : true,
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-5 max-w-3xl mx-auto relative"
      style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
      
      <AnimatePresence>
        {revealed && lastAnswer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-0"
            style={{ background: lastAnswer.isCorrect ? 'linear-gradient(to top, rgba(52,211,153,0.06), transparent)' : 'linear-gradient(to top, rgba(239,68,68,0.06), transparent)' }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {oppScorePulse && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(232,76,106,0.08), transparent 60%)' }} />
        )}
      </AnimatePresence>

      <div className="fixed top-4 left-4 z-[60]"><ReturnButton context="game" /></div>

      <div className="flex items-start justify-between mb-3 relative z-30 pt-1">
        <div className="flex items-center gap-2 ml-14">
          <div className="text-xs px-3 py-1.5 rounded-full" style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}`, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{question.difficulty}</div>
          <div className="flex items-center gap-1 text-slate-500 text-xs"><span>{category?.icon}</span><span className="hidden sm:inline">{category?.name}</span></div>
        </div>
        <div className="flex flex-col items-center gap-1.5 absolute left-1/2 -translate-x-1/2 top-1">
          <span className="text-slate-400 text-[10px]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Q{qNum}/{total}</span>
          <div className="w-32 sm:w-40 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #E84C6A, #F472B6)' }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
        <LiveScorePanel playerScore={gameState.playerScore} playerAvatar={currentUser.avatar} playerName={currentUser.username} opponents={gameState.opponents} mode={gameState.mode} />
      </div>

      {/* Player chips for 1v1 */}
      {gameState.mode === '1v1' && gameState.opponents.length === 1 && (
        <div className="mb-3 relative z-20">
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' }}>
              <span className="text-sm">{currentUser.avatar}</span>
              <span className="text-xs text-[#E84C6A]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>{currentUser.username.slice(0, 8)}</span>
              <motion.span key={gameState.playerScore} initial={{ scale: 1.3, color: '#E84C6A' }} animate={{ scale: 1, color: '#1A1A2E' }} className="text-xs tabular-nums" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{gameState.playerScore}</motion.span>
            </motion.div>
            {gameState.opponents.map(opp => (
              <motion.div key={opp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.02)', border: `1px solid ${opp.answered ? 'rgba(52,211,153,0.15)' : 'rgba(0,0,0,0.06)'}` }}>
                <span className="text-sm">{opp.avatar}</span>
                <span className="text-xs text-slate-500" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>{opp.username.slice(0, 8)}</span>
                <motion.span key={opp.score} initial={{ scale: 1.3, color: '#E84C6A' }} animate={{ scale: 1, color: '#64748b' }} className="text-xs tabular-nums" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{opp.score}</motion.span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Room mode chips */}
      {gameState.mode === 'Room' && gameState.opponents.length > 0 && (
        <div className="mb-3 relative z-20">
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' }}>
              <span className="text-sm">{currentUser.avatar}</span>
              <span className="text-xs text-[#E84C6A]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>{currentUser.username.slice(0, 8)}</span>
              <motion.span key={gameState.playerScore} initial={{ scale: 1.3, color: '#E84C6A' }} animate={{ scale: 1, color: '#1A1A2E' }} className="text-xs tabular-nums" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{gameState.playerScore}</motion.span>
            </motion.div>
            {gameState.opponents.map(opp => (
              <motion.div key={opp.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.02)', border: `1px solid ${opp.answered ? 'rgba(52,211,153,0.15)' : 'rgba(0,0,0,0.06)'}` }}>
                <span className="text-sm">{opp.avatar}</span>
                <span className="text-xs text-slate-500" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>{opp.username.slice(0, 8)}</span>
                <motion.span key={opp.score} initial={{ scale: 1.2, color: '#E84C6A' }} animate={{ scale: 1, color: '#64748b' }} className="text-xs tabular-nums" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{opp.score}</motion.span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={question.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="relative z-10 flex-1 flex flex-col">
          <div className="rounded-2xl p-6 mb-4"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <p className="text-[#1A1A2E] text-lg leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{question.text}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {question.answers.map((answer, i) => {
              const isDoubleDipWrong = doubleDipWrongId === answer.id;
              return (
                <AnswerOption key={answer.id} id={answer.id} text={answer.text} label={labels[i]} isSelected={selectedAnswer === answer.id} isCorrect={answer.isCorrect}
                  isEliminated={gameState.eliminatedAnswers.includes(answer.id) || isDoubleDipWrong} revealed={revealed}
                  disabled={revealed || answeredRef.current || isDoubleDipWrong}
                  onClick={() => !revealed && !answeredRef.current && !isDoubleDipWrong && submitAnswer(answer.id, timeRemaining)} index={i} />
              );
            })}
          </div>
          <AnimatePresence>
            {revealed && lastAnswer && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl p-4 mb-4"
                style={{ background: lastAnswer.isCorrect ? 'rgba(52,211,153,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${lastAnswer.isCorrect ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${lastAnswer.isCorrect ? 'text-emerald-600' : 'text-red-600'}`} style={{ fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                      {lastAnswer.isCorrect ? '✓ Correct!' : selectedAnswer === null ? '⏰ Time\'s up!' : '✗ Wrong!'}
                    </p>
                    {question.explanation && <p className="text-slate-500 text-xs mt-1">{question.explanation}</p>}
                  </div>
                  {lastAnswer.isCorrect && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-amber-500 text-right">
                      <p className="text-xs text-slate-400">Points</p>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>+{lastAnswer.pointsEarned}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex justify-center py-3">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-1">
          <CircularTimer timeRemaining={timeRemaining} totalTime={TOTAL_TIME} onExpire={handleTimerExpire} isActive={timerActive} size="md" />
          {timeRemaining <= 10 && timeRemaining > 0 && timerActive && (
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-[10px] text-rose-500 mt-0.5"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Hurry up!</motion.span>
          )}
        </motion.div>
      </div>

      <div className="relative z-10 mt-auto pt-2 pb-2">
        <LifelineButtons lifelines={enabledLifelines} onUse={handleLifeline} disabled={revealed} />
      </div>

      <AnimatePresence>
        {lifelineModal && (
          <AudienceModal type={lifelineModal.type} answers={question.answers}
            audienceData={lifelineModal.type === 'audience' ? lifelineModal.data as AudienceData : undefined}
            phoneMessage={lifelineModal.type === 'phone' ? lifelineModal.data as string : undefined}
            onClose={() => setLifelineModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}