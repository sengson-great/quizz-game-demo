import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, CheckCircle, XCircle, Home, RotateCcw, Medal, Sparkles, Brain, Cpu, History, Globe, Zap, Palette, Target, Flag, Award, Crown } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { CATEGORIES } from '../data/questions';
import { useTranslation } from '../hooks/useTranslation';

const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

const CategoryIcon = ({ name, className, style }) => {
    const icons = { Brain, Cpu, History, Globe, Zap, Palette, Target, Trophy, Medal, Flag };
    const Icon = icons[name] || Zap;
    return <Icon className={className} style={style} />;
};

export default function ResultsPage() {
    const { gameState, resetGame } = useGame();
    const { currentUser } = useAuth();
    const { playSFX } = useAudio();
    const { t, lang } = useTranslation();
    const isKhmer = lang === 'km';
    const navigate = useNavigate();
    const [showReview, setShowReview] = useState(false);
    const [animScore, setAnimScore] = useState(0);

    useEffect(() => { 
        if (!gameState || !currentUser) {
            navigate('/dashboard');
            return;
        } 
        
        // Play result sound
        const correctCount = (gameState?.answers || []).filter(a => a.isCorrect).length;
        const totalQuestions = (gameState?.questions || []).length || 1;
        const accuracy = (correctCount / totalQuestions) * 100;
        const pScore = gameState?.playerScore || 0;
        const allScoresRaw = [
            pScore, 
            ...(gameState?.opponents || []).map(o => o.score || 0)
        ].sort((a, b) => b - a);
        const playerRank = allScoresRaw.indexOf(pScore) + 1;

        if (playerRank === 1 || accuracy >= 70) {
            playSFX('victory');
        } else {
            playSFX('loss');
        }
    }, []);

    useEffect(() => {
        if (!gameState)
            return;
        const target = gameState.playerScore;
        let current = 0;
        const step = Math.max(1, Math.floor(target / 60));
        const interval = setInterval(() => { current = Math.min(current + step, target); setAnimScore(current); if (current >= target)
            clearInterval(interval); }, 20);
        return () => clearInterval(interval);
    }, [gameState?.playerScore]);

    if (!gameState || !currentUser)
        return null;

    const correctCount = (gameState?.answers || []).filter(a => a.isCorrect).length;
    const totalQuestions = (gameState?.questions || []).length || 1;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const allScores = [
        { name: currentUser.username, avatar: currentUser.avatar, score: gameState?.playerScore || 0, isPlayer: true }, 
        ...(gameState?.opponents || []).map(o => ({ 
            name: o.username || o.name, 
            avatar: o.avatar || '🦊', 
            score: o.score || 0, 
            isPlayer: false 
        }))
    ].sort((a, b) => (b.score || 0) - (a.score || 0));

    const scoreList = allScores.map(s => s.score);
    allScores.forEach(s => {
        s.rank = scoreList.indexOf(s.score) + 1;
    });

    const playerRank = allScores.find(s => s.isPlayer)?.rank || 1;
    const isWinner = playerRank === 1;

    const getRankIcon = (rank) => { 
        if (rank === 1) return <Crown className="w-6 h-6 text-amber-500" />; 
        if (rank === 2) return <Trophy className="w-6 h-6 text-slate-400" />; 
        if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />; 
        return <span className="text-sm font-bold text-slate-400">#{rank}</span>; 
    };

    const getGrade = () => { if (accuracy >= 90)
        return { grade: 'S', label: t('gradePerfect') }; if (accuracy >= 80)
        return { grade: 'A', label: t('gradeExcellent') }; if (accuracy >= 70)
        return { grade: 'B', label: t('gradeGreat') }; if (accuracy >= 60)
        return { grade: 'C', label: t('gradeGood') }; return { grade: 'D', label: t('gradeKeepPracticing') }; };
    const { grade, label } = getGrade();

    const categoryBreakdown = CATEGORIES.map(cat => { 
        const catAnswers = (gameState?.answers || []).filter((a, i) => gameState?.questions?.[i]?.categoryId === cat.id); 
        const correct = catAnswers.filter(a => a.isCorrect).length; 
        return { ...cat, correct, total: catAnswers.length }; 
    }).filter(c => c.total > 0);

    return (<div className="min-h-screen px-4 py-8 max-w-3xl mx-auto" style={{ fontFamily: 'inherit' }}>
      {isWinner && (<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 20 }, (_, i) => (<motion.div key={i} className="absolute w-3 h-3 rounded-sm" style={{ left: `${Math.random() * 100}%`, background: ['#FACC15', '#818CF8', '#06b6d4', '#34d399'][i % 4], top: '-20px' }} animate={{ y: ['0vh', '110vh'], rotate: [0, 720], opacity: [1, 0] }} transition={{ duration: Math.random() * 2 + 1.5, delay: Math.random() * 1, repeat: Infinity }}/>))}
        </div>)}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-3xl bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000000] flex items-center justify-center">
            {isWinner ? (
                <Crown className="w-10 h-10 text-[#FACC15] animate-bounce" />
            ) : gameState.mode === 'Solo' ? (
                <Target className="w-10 h-10 text-emerald-500" />
            ) : gameState.mode === '1v1' ? (
                <Swords className="w-10 h-10 text-rose-500" />
            ) : (
                <Trophy className="w-10 h-10 text-violet-500" />
            )}
          </div>
        </motion.div>
        <h1 className="text-[#1A1A2E] mb-1" style={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '2rem' }}>
          {isWinner ? t('victory') : gameState.mode === 'Solo' ? t('gameComplete') : `${getRankIcon(playerRank)} ${t('rank')}`}
        </h1>
        <p className="text-slate-500">{label}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="rounded-3xl p-6 mb-6 text-center relative z-10" style={{ background: 'rgba(99,102,241,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 4px 30px rgba(99,102,241,0.06)' }}>
        <p className="text-slate-500 text-sm mb-2">{t('finalScore')}</p>
        <motion.p className="text-[#1A1A2E] mb-4" style={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '3.5rem' }}>{animScore.toLocaleString()}</motion.p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center"><p className="text-2xl text-amber-500" style={{ fontFamily: 'inherit', fontWeight: 700 }}>{grade}</p><p className="text-slate-400 text-xs">{t('grade')}</p></div>
          <div className="w-px h-10" style={{ background: 'rgba(0,0,0,0.06)' }}/>
          <div className="text-center"><p className="text-2xl text-emerald-500" style={{ fontFamily: 'inherit', fontWeight: 700 }}>{correctCount}/{totalQuestions}</p><p className="text-slate-400 text-xs">{t('correct')}</p></div>
          <div className="w-px h-10" style={{ background: 'rgba(0,0,0,0.06)' }}/>
          <div className="text-center"><p className="text-2xl text-[#FACC15]" style={{ fontFamily: 'inherit', fontWeight: 700 }}>{accuracy}%</p><p className="text-slate-400 text-xs">{t('accuracy')}</p></div>
        </div>
      </motion.div>

      {gameState.mode !== 'Solo' && allScores.length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5 mb-6 relative z-10" style={CARD}>
          <h3 className="text-[#1A1A2E] mb-4 flex items-center gap-2" style={{ fontFamily: 'inherit', fontWeight: 600 }}><Medal className="w-4 h-4 text-amber-500"/> {t('finalStandings')}</h3>
          <div className="space-y-3">
            {allScores.map((player, i) => (<motion.div key={`${player.name}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: player.isPlayer ? 'rgba(99,102,241,0.06)' : 'rgba(0,0,0,0.02)', border: player.isPlayer ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent' }}>
                <span className="w-8 flex justify-center">{getRankIcon(player.rank)}</span>
                <span className="text-xl">{player.avatar}</span>
                <span className={`flex-1 text-sm ${player.isPlayer ? 'text-[#FACC15]' : 'text-[#1A1A2E]'}`}>{player.name} {player.isPlayer && <span className="text-xs text-[#FACC15]">({t('you')})</span>}</span>
                <span className="text-[#1A1A2E] text-sm" style={{ fontFamily: 'inherit', fontWeight: 600 }}>{player.score.toLocaleString()}</span>
              </motion.div>))}
          </div>
        </motion.div>)}

      {categoryBreakdown.length > 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl p-5 mb-6 relative z-10" style={CARD}>
          <h3 className="text-[#1A1A2E] mb-4 flex items-center gap-2" style={{ fontFamily: 'inherit', fontWeight: 600 }}><Star className="w-4 h-4 text-[#FACC15]"/> {t('domains')}</h3>
          <div className="space-y-2">
            {categoryBreakdown.map(({ id, icon, name, correct, total, iconColor }) => {
                const pct = total > 0 ? (correct / total) * 100 : 0;
                return (<div key={id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2 text-[#1A1A2E]">
                      <CategoryIcon name={icon} className="w-3.5 h-3.5" style={{ color: iconColor }} />
                      {t(`cat${id.charAt(0).toUpperCase() + id.slice(1)}`)}
                    </div>
                    <span className={`${pct === 100 ? 'text-emerald-500' : pct >= 60 ? 'text-amber-500' : 'text-red-500'}`} style={{ fontWeight: 600 }}>{Math.round(pct)}% ({correct}/{total})</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.6 }} className="h-full rounded-full" style={{ background: pct === 100 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#f87171' }}/>
                  </div>
                </div>);
            })}
          </div>
        </motion.div>)}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-2xl overflow-hidden mb-6 relative z-10" style={CARD}>
        <button onClick={() => setShowReview(!showReview)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/[0.01] transition-colors">
          <span className="text-[#1A1A2E] text-sm" style={{ fontFamily: 'inherit', fontWeight: 600 }}>{t('answerReview')}</span>
          <motion.span animate={{ rotate: showReview ? 180 : 0 }} className="text-slate-400">▼</motion.span>
        </button>
        <AnimatePresence>
          {showReview && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <div className="px-5 pb-4 space-y-2 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                {(gameState?.answers || []).map((answer, i) => {
                const q = gameState.questions?.[i];
                if (!q)
                    return null;
                const cat = CATEGORIES.find(c => c.id === q.categoryId);
                return (<div key={`${answer.questionId}-${i}`} className="flex items-start gap-3 p-3 rounded-xl text-sm" style={{ background: answer.isCorrect ? 'rgba(52,211,153,0.04)' : 'rgba(239,68,68,0.04)' }}>
                      {answer.isCorrect ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5"/> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"/>}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-0.5">
                          <CategoryIcon name={cat?.icon} className="w-3 h-3" style={{ color: cat?.iconColor }} />
                          <span>{(isKhmer && q.text_km) ? q.text_km : q.text}</span>
                        </div>
                        {!answer.isCorrect && (
                          <p className="text-emerald-500 text-xs">
                            ✓ {(() => {
                              const correctAns = q.answers.find(a => String(a.id) === String(answer.correctAnswerId));
                              return (isKhmer && correctAns?.text_km) ? correctAns.text_km : correctAns?.text;
                            })()}
                          </p>
                        )}
                      </div>
                      {answer.isCorrect && <span className="text-amber-500 text-xs flex-shrink-0" style={{ fontFamily: 'inherit', fontWeight: 700 }}>+{answer.pointsEarned}</span>}
                    </div>);
            })}
              </div>
            </motion.div>)}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex gap-3 relative z-10">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetGame(); navigate('/dashboard'); }} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold shadow-sm transition-all bg-white border border-black/[0.06] text-slate-600">
          <Home className="w-4 h-4 text-indigo-500"/> {t('home')}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetGame(); navigate('/mode-select'); }} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all border-none" style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }}>
          <RotateCcw className="w-4 h-4 text-white"/> {t('playAgain')}
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetGame(); navigate('/leaderboard'); }} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold shadow-sm transition-all bg-white border border-black/[0.06] text-slate-600">
          <Trophy className="w-4 h-4 text-amber-500"/> {t('leaderboard')}
        </motion.button>
      </motion.div>
    </div>);
}
