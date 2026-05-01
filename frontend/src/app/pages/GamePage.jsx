import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { CATEGORIES as MOCK_CATEGORIES } from '../data/questions';
import { loadSystemConfig } from '../data/systemConfig';
import api from '../../api/axios';
import { CircularTimer } from '../components/game/CircularTimer';
import { AnswerOption } from '../components/game/AnswerOption';
import { LifelineButtons } from '../components/game/LifelineButtons';
import { LiveScorePanel } from '../components/game/LiveScorePanel';
import { AudienceModal } from '../components/game/AudienceModal';
import { ReturnButton } from '../components/ui/ReturnButton';
import { useTranslation } from '../hooks/useTranslation';
import { Check, Sparkles, AlertCircle, Flag, Brain, Cpu, History, Globe, Zap, Palette } from 'lucide-react';

const LIGHT_BG = 'var(--grad-surface)';
const RESULT_DELAY = 2200;

function ShowForceResultsButton({ onForce }) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), 12000);
        return () => clearTimeout(t);
    }, []);
    if (!show) return null;
    return (
        <motion.button 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={onForce}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-[#FACC15] hover:bg-[#FACC15]/5 transition-colors border border-[#FACC15]/20"
        >
            Still waiting? Skip to Results
        </motion.button>
    );
}

const CategoryIcon = ({ name, className, style }) => {
    const icons = { Brain, Cpu, History, Globe, Zap, Palette };
    const Icon = icons[name] || Zap;
    return <Icon className={className} style={style} />;
};

export default function GamePage() {
    const { gameState, answerQuestion, useLifeline, nextQuestion, finalizeGame } = useGame();
    const { currentUser } = useAuth();
    const { playSFX } = useAudio();
    const { t, lang } = useTranslation();
    const navigate = useNavigate();
    const sysConfig = useMemo(() => loadSystemConfig(), []);
    const TOTAL_TIME = sysConfig.timerDuration;
    const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
    const [timerActive, setTimerActive] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [revealed, setRevealed] = useState(false);
    const [lastAnswer, setLastAnswer] = useState(null);
    const [lifelineModal, setLifelineModal] = useState(null);
    const timerRef = useRef(null);
    const answeredRef = useRef(false);
    const doubleDipActiveRef = useRef(false);
    const doubleDipFirstAnswerRef = useRef(null);
    const [doubleDipWrongId, setDoubleDipWrongId] = useState(null);
    const [oppScorePulse, setOppScorePulse] = useState(false);
    const prevOppScoreRef = useRef(0);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        api.get('/categories').then(res => {
            setCategories(res.data.data || res.data || []);
        }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        if (!gameState || !currentUser) {
            navigate('/mode-select');
            return;
        }
        if (gameState.status === 'finished' && gameState.mode === 'Solo') {
            navigate('/results');
            return;
        }
    }, [gameState, currentUser, navigate]);

    // Check if we are spectating and waiting for others to finish
    useEffect(() => {
        if (!gameState || gameState.mode === 'Solo') return;
        
        // Only proceed if the player is actually finished (no more questions)
        if (gameState.status === 'finished') {
            const opponents = gameState.opponents || [];
            const allOpponentsDone = opponents.every(opp => opp.answered);
            if (allOpponentsDone) {
                finalizeGame();
                navigate('/results');
            }
        }
    }, [gameState?.status, gameState?.opponents, finalizeGame, navigate]);

    useEffect(() => {
        if (!gameState)
            return;
        setTimeRemaining(TOTAL_TIME);
        setTimerActive(true);
        setSelectedAnswer(null);
        setRevealed(false);
        setLastAnswer(null);
        answeredRef.current = false;
        doubleDipActiveRef.current = false;
        doubleDipFirstAnswerRef.current = null;
        setDoubleDipWrongId(null);
    }, [gameState?.currentQuestionIndex, gameState?.currentQuestion?.id]);

    useEffect(() => {
        if (!gameState || gameState.opponents.length === 0)
            return;
        const totalOppScore = gameState.opponents.reduce((s, o) => s + o.score, 0);
        if (totalOppScore > prevOppScoreRef.current) {
            setOppScorePulse(true);
            setTimeout(() => setOppScorePulse(false), 600);
        }
        prevOppScoreRef.current = totalOppScore;
    }, [gameState?.opponents]);

    useEffect(() => {
        if (!timerActive)
            return;
        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => { if (prev <= 1) {
                clearInterval(timerRef.current);
                return 0;
            } return prev - 1; });
        }, 1000);
        return () => { if (timerRef.current)
            clearInterval(timerRef.current); };
    }, [timerActive, gameState?.currentQuestionIndex]);

    const submitAnswer = useCallback(async (answerId, time) => {
        if (answeredRef.current || !gameState)
            return;
        
        // Stop timer
        setTimerActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        
        setSelectedAnswer(answerId);

        // ── TIMEOUT CASE ──────────────────────────────────────────────────────────
        if (answerId === null) {
            setRevealed(true);
            answeredRef.current = true;
            playSFX('timeout');
            
            const timeoutPlaceholder = {
                status: 'timeout',
                isCorrect: false,
                pointsEarned: 0,
            };
            setLastAnswer(timeoutPlaceholder);

            try {
                const result = await answerQuestion(null, 0);
                setLastAnswer(result);

                setTimeout(() => {
                    if (result.next_question) {
                        nextQuestion();
                    } else {
                        if (gameState.mode === 'Solo') {
                            finalizeGame();
                            navigate('/results');
                        } else {
                            finalizeGame();
                        }
                    }
                }, RESULT_DELAY);
            } catch (error) {
                console.error("Timeout update failed", error);
                // If it fails, fallback to results
                finalizeGame();
                navigate('/results');
            }
            return;
        }

        // ── NORMAL ANSWER CASE ────────────────────────────────────────────────────
        try {
            const result = await answerQuestion(answerId, time);
            
            // Handle Double Chance "try again"
            if (doubleDipActiveRef.current && !doubleDipFirstAnswerRef.current && result.status === 'try_again') {
                setLastAnswer(result);
                setRevealed(true);
                doubleDipFirstAnswerRef.current = answerId;
                setDoubleDipWrongId(answerId);
                setTimeout(() => {
                    setSelectedAnswer(null);
                    setRevealed(false);
                    setLastAnswer(null); // Clear result for second try
                    setTimerActive(true); 
                }, 800);
                playSFX('wrong');
                return;
            }

            // Normal flow (correct or failed)
            answeredRef.current = true;
            doubleDipActiveRef.current = false;
            setLastAnswer(result);
            setRevealed(true);
            playSFX(result.isCorrect ? 'correct' : 'wrong');

            setTimeout(() => {
                // If we have a next_question, move to it (regardless of correct/wrong in multiplayer)
                if (result.next_question) {
                    nextQuestion();
                    return;
                }

                // If no next question, the game is finished for this player
                if (gameState.mode === 'Solo') {
                    finalizeGame();
                    navigate('/results');
                } else {
                    // Signal to others that we are finished
                    finalizeGame();
                }
            }, RESULT_DELAY);
        } catch (error) {
            console.error(error);
            answeredRef.current = false;
            setSelectedAnswer(null);
            setTimerActive(true);
        }
    }, [gameState, answerQuestion, nextQuestion, finalizeGame, navigate, playSFX]);

    const handleTimerExpire = useCallback(() => { if (!answeredRef.current)
        submitAnswer(null, 0); }, [submitAnswer]);

    const handleLifeline = async (type) => {
        if (!gameState || revealed || selectedAnswer)
            return;
        const lifelineConfigMap = { fifty: sysConfig.enableFiftyFifty, skip: sysConfig.enableSkip, audience: sysConfig.enableAudience, phone: sysConfig.enablePhone, doubleDip: sysConfig.enableDoubleDip };
        if (!lifelineConfigMap[type])
            return;
        playSFX('lifeline');
        const result = await useLifeline(type);
        if (type === 'skip') {
            nextQuestion();
            return;
        }
        if (type === 'doubleDip') {
            doubleDipActiveRef.current = true;
            doubleDipFirstAnswerRef.current = null;
            return;
        }
        if (type === 'audience' && result)
            setLifelineModal({ type: 'audience', data: result });
        if (type === 'phone' && result)
            setLifelineModal({ type: 'phone', data: result });
    };

    if (!gameState || !currentUser)
        return null;
    const question = gameState.currentQuestion;
    if (!question)
        return null;
    const categoryId = question.categoryId || question.category_id;
    const category = categories.find(c => String(c.id) === String(categoryId)) || MOCK_CATEGORIES.find(c => String(c.id) === String(categoryId));

    const labels = ['A', 'B', 'C', 'D'];
    const qNum = Math.min(gameState.session ? gameState.session.current_level : 1, 15);
    const total = 15;
    const progressPct = (qNum / total) * 100;
    const questionDifficulty = (question.difficulty || question.difficulty_level || 'Easy').toLowerCase();
    
    const difficultyStyles = {
        easy: { bg: 'rgba(52,211,153,0.08)', color: '#FACC15', border: 'rgba(52,211,153,0.15)', label: t('difficultyEasy') },
        medium: { bg: 'rgba(251,191,36,0.08)', color: '#d97706', border: 'rgba(251,191,36,0.15)', label: t('difficultyMedium') },
        hard: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'rgba(239,68,68,0.15)', label: t('difficultyHard') },
    };
    
    const ds = difficultyStyles[questionDifficulty] || difficultyStyles.easy;
    const enabledTypes = {
        fifty: sysConfig.enableFiftyFifty,
        skip: sysConfig.enableSkip,
        audience: sysConfig.enableAudience,
        phone: sysConfig.enablePhone,
        doubleDip: sysConfig.enableDoubleDip,
    };
    const enabledLifelines = gameState.lifelines;
    const isKhmer = lang === 'km';

    return (
    <div className="min-h-screen flex flex-col overflow-hidden relative" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
            animate={{ 
                x: [0, 100, 0], 
                y: [0, 50, 0],
                rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-[80px]"
        />
        <motion.div 
            animate={{ 
                x: [0, -100, 0], 
                y: [0, 100, 0],
                rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -right-20 w-80 h-80 bg-[#8B5CF6]/10 rounded-full blur-[80px]"
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-[60px]"
        />
      </div>

      <div className="flex-1 flex flex-col px-4 py-5 max-w-3xl mx-auto w-full relative z-10">
        <AnimatePresence>
            {revealed && lastAnswer && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="fixed inset-0 pointer-events-none z-0" 
                    style={{ background: lastAnswer.isCorrect ? 'radial-gradient(circle at bottom, rgba(52,211,153,0.1), transparent 70%)' : 'radial-gradient(circle at bottom, rgba(239,68,68,0.1), transparent 70%)' }}
                />
            )}
        </AnimatePresence>

        <div className="fixed z-40" style={{ top: 'calc(1rem + var(--safe-area-top))', left: 'calc(1rem + var(--safe-area-left))' }}>
            <ReturnButton context="game"/>
        </div>

        <header className="flex items-start justify-between mb-6 relative z-30 pt-1">
            <div className="flex items-center gap-3 ml-14">
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] uppercase tracking-normal px-3 py-1.5 rounded-xl backdrop-blur-md" 
                    style={{ background: ds.bg, color: ds.color, border: `1.5px solid ${ds.border}`, fontWeight: 800 }}
                >
                    {ds.label}
                </motion.div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                    <span className="text-sm">
                        <CategoryIcon name={category?.icon} className="w-4 h-4" style={{ color: category?.iconColor }} />
                    </span>
                    <span className="hidden sm:inline opacity-70">
                        {category ? ((lang === 'km' && (category.nameKm || category.name_km)) ? (category.nameKm || category.name_km) : (category.name || category.title)) : ''}
                    </span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-2 absolute left-1/2 -translate-x-1/2 top-1">
                <span className="text-slate-400 text-[10px] tracking-normal font-black" style={{ fontFamily: 'inherit' }}>
                    QUESTION {qNum} / {total}
                </span>
                <div className="w-32 sm:w-44 h-1.5 rounded-full overflow-hidden bg-slate-200/50 backdrop-blur-sm border border-white/20">
                    <motion.div 
                        className="h-full rounded-full shadow-[0_0_8px_rgba(250,204,21,0.4)]" 
                        style={{ background: 'var(--grad-primary)' }} 
                        animate={{ width: `${progressPct}%` }} 
                        transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                    />
                </div>
            </div>

            <LiveScorePanel 
                playerScore={gameState.playerScore} 
                playerAvatar={currentUser.avatar} 
                playerName={currentUser.username} 
                opponents={gameState.opponents} 
                mode={gameState.mode}
            />
        </header>

        {(gameState.mode === '1v1' || gameState.mode === 'Room') && gameState.opponents.length > 0 && (
            <div className="mb-6 relative z-20">
                <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="flex items-center gap-2 px-3 py-2 rounded-2xl glass-card border-[#FACC15]/20"
                    >
                        <span className="text-base">{currentUser.avatar}</span>
                        <div className="flex flex-col -gap-1">
                            <span className="text-[9px] uppercase font-bold text-[#FACC15]/60">YOU</span>
                            <motion.span key={gameState.playerScore} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xs font-black tabular-nums">{gameState.playerScore}</motion.span>
                        </div>
                    </motion.div>
                    
                    {gameState.opponents.map(opp => (
                        <motion.div 
                            key={opp.id} 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ delay: 0.1 }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-2xl glass-card transition-colors duration-500 ${opp.answered ? 'bg-emerald-50/50 border-emerald-200/50' : 'border-white/20'}`}
                        >
                            <div className="relative">
                                <span className="text-base">{opp.avatar}</span>
                                {opp.answered && (
                                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                                )}
                            </div>
                            <div className="flex flex-col -gap-1">
                                <span className="text-[9px] uppercase font-bold text-slate-400">{(opp.username || opp.name || '').slice(0, 6)}</span>
                                <motion.span key={opp.score} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xs font-black tabular-nums text-slate-600">{opp.score}</motion.span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

        <AnimatePresence mode="wait">
            <motion.div 
                key={question.id} 
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} 
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} 
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }} 
                transition={{ duration: 0.5, type: 'spring', damping: 25 }} 
                className="relative z-10 flex-1 flex flex-col"
            >
                <div className="glass-card rounded-[2.5rem] p-8 mb-6 relative overflow-hidden group shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full pointer-events-none" />
                    <p className="text-[#1A1A2E] text-xl sm:text-2xl font-semibold leading-snug text-center" style={{ fontFamily: 'inherit' }}>
                        {(isKhmer && question.text_km) ? question.text_km : question.text}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {question.answers.map((answer, i) => {
                        const isDoubleDipWrong = doubleDipWrongId === answer.id;
                        const answeredAndCorrect = revealed && lastAnswer && String(lastAnswer.correctAnswerId) === String(answer.id);
                        const displayText = (isKhmer && answer.text_km) ? answer.text_km : answer.text;
                        return (
                            <AnswerOption 
                                key={answer.id} 
                                id={answer.id} 
                                text={displayText} 
                                label={labels[i]} 
                                isSelected={selectedAnswer === answer.id} 
                                isCorrect={answeredAndCorrect} 
                                isEliminated={gameState.eliminatedAnswers.includes(answer.id) || isDoubleDipWrong} 
                                revealed={revealed} 
                                disabled={revealed || answeredRef.current || !!selectedAnswer || isDoubleDipWrong} 
                                onClick={() => !revealed && !answeredRef.current && !selectedAnswer && !isDoubleDipWrong && submitAnswer(answer.id, timeRemaining)} 
                                index={i}
                            />
                        );
                    })}
                </div>

                <AnimatePresence>
                    {revealed && lastAnswer && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9 }} 
                            className="rounded-3xl p-5 mb-6 glass-card relative overflow-hidden" 
                            style={{ 
                                background: lastAnswer.isCorrect ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', 
                                border: `2px solid ${lastAnswer.isCorrect ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}` 
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${lastAnswer.isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                    {lastAnswer.isCorrect ? <Sparkles className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-base font-black ${lastAnswer.isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {lastAnswer.isCorrect ? t('correct').toUpperCase() : selectedAnswer === null ? t('timeOut').toUpperCase() : t('wrong').toUpperCase()}
                                    </h3>
                                    {((isKhmer && question.explanation_km) || question.explanation) && (
                                        <p className="text-slate-600 text-xs mt-0.5 leading-relaxed font-medium">
                                            {(isKhmer && question.explanation_km) ? question.explanation_km : question.explanation}
                                        </p>
                                    )}
                                </div>
                                {lastAnswer.isCorrect && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-right">
                                        <span className="block text-[10px] text-emerald-600/60 font-black uppercase tracking-tighter">EARNED</span>
                                        <span className="text-2xl font-black text-emerald-700 tabular-nums">+{lastAnswer.pointsEarned}</span>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {gameState.mode !== 'Solo' && gameState.status === 'finished' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-8 rounded-[2.5rem] text-center glass-card relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-[#FACC15]/5 to-transparent pointer-events-none" />
                        <div className="flex flex-col items-center gap-6 relative z-10">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-[#FACC15]/10 border-t-[#FACC15] rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Flag className="w-6 h-6 text-[#FACC15] animate-bounce" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-[#1A1A2E] text-xl font-black tracking-tight" style={{ fontFamily: 'inherit' }}>{t('waitingForOpponents').toUpperCase()}</h2>
                                <p className="text-slate-500 text-xs mt-2 font-medium italic">{t('waitingDesc')}</p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-5 mt-2">
                                {gameState.opponents.map(opp => (
                                    <div key={opp.id} className="flex flex-col items-center gap-2">
                                        <div className="relative p-1 rounded-2xl bg-white/50 border border-white shadow-sm">
                                            <span className={`text-3xl transition-all duration-500 ${opp.answered ? 'grayscale-0' : 'grayscale'}`}>{opp.avatar}</span>
                                            {opp.answered && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-md">
                                                    <Check className="w-2 h-2" strokeWidth={5} />
                                                </motion.div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-normal" style={{ color: opp.answered ? '#10b981' : '#f59e0b' }}>
                                            {opp.answered ? t('finished') : t('playing')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            <ShowForceResultsButton onForce={() => navigate('/results')} />
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>

        <footer className="mt-auto pt-4 pb-4 relative z-20">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                    <LifelineButtons 
                        lifelines={enabledLifelines} 
                        enabledTypes={enabledTypes} 
                        onUse={handleLifeline} 
                        disabled={revealed || !!selectedAnswer}
                    />
                </div>
                
                <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[100px]">
                    <CircularTimer 
                        timeRemaining={timeRemaining} 
                        totalTime={TOTAL_TIME} 
                        onExpire={handleTimerExpire} 
                        isActive={timerActive} 
                        size="md"
                    />
                    {timeRemaining <= 10 && timeRemaining > 0 && timerActive && (
                        <motion.span 
                            animate={{ opacity: [0.4, 1, 0.4], y: [0, -2, 0] }} 
                            transition={{ duration: 1.2, repeat: Infinity }} 
                            className="text-[9px] font-black uppercase tracking-tighter text-rose-500"
                        >
                            {t('hurryUp')}
                        </motion.span>
                    )}
                </div>
            </div>
        </footer>

        <AnimatePresence>
            {lifelineModal && (
                <AudienceModal 
                    type={lifelineModal.type} 
                    answers={question.answers} 
                    audienceData={lifelineModal.type === 'audience' ? lifelineModal.data : undefined} 
                    phoneMessage={lifelineModal.type === 'phone' ? lifelineModal.data : undefined} 
                    onClose={() => setLifelineModal(null)}
                />
            )}
        </AnimatePresence>
      </div>
    </div>
    );
}

