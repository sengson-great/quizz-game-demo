import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, CheckCircle, XCircle, Home, RotateCcw, Medal } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { CATEGORIES } from '../data/questions';
import { useTranslation } from '../hooks/useTranslation';

const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

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

    const getRankIcon = (rank) => { if (rank === 1)
        return '🥇'; if (rank === 2)
        return '🥈'; if (rank === 3)
        return '🥉'; return `#${rank}`; };

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

    return (<div className="min-h-screen px-4 py-8 max-w-3xl mx-auto" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      {isWinner && (<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {Array.from({ length: 20 }, (_, i) => (<motion.div key={i} className="absolute w-3 h-3 rounded-sm" style={{ left: `${Math.random() * 100}%`, background: ['#E84C6A', '#F472B6', '#06b6d4', '#34d399'][i % 4], top: '-20px' }} animate={{ y: ['0vh', '110vh'], rotate: [0, 720], opacity: [1, 0] }} transition={{ duration: Math.random() * 2 + 1.5, delay: Math.random() * 1, repeat: Infinity }}/>))}
        </div>)}

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="text-7xl mb-4">
          {isWinner ? '🏆' : gameState.mode === 'Solo' ? '🎯' : getRankIcon(playerRank)}
        </motion.div>
        <h1 className="text-[#1A1A2E] mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '2rem' }}>
          {isWinner ? t('victory') : gameState.mode === 'Solo' ? t('gameComplete') : `${getRankIcon(playerRank)} ${t('rank')}`}
        </h1>
        <p className="text-slate-500">{label}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="rounded-3xl p-6 mb-6 text-center relative z-10" style={{ background: 'rgba(232,76,106,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(232,76,106,0.12)', boxShadow: '0 4px 30px rgba(232,76,106,0.06)' }}>
        <p className="text-slate-500 text-sm mb-2">{t('finalScore')}</p>
        <motion.p className="text-[#1A1A2E] mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '3.5rem' }}>{animScore.toLocaleString()}</motion.p>
        <div className="flex items-center justify-center gap-6">
          <div className="text-center"><p className="text-2xl text-amber-500" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{grade}</p><p className="text-slate-400 text-xs">{t('grade')}</p></div>
          <div className="w-px h-10" style={{ background: 'rgba(0,0,0,0.06)' }}/>
          <div className="text-center"><p className="text-2xl text-emerald-500" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{correctCount}/{totalQuestions}</p><p className="text-slate-400 text-xs">{t('correct')}</p></div>
          <div className="w-px h-10" style={{ background: 'rgba(0,0,0,0.06)' }}/>
          <div className="text-center"><p className="text-2xl text-[#E84C6A]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{accuracy}%</p><p className="text-slate-400 text-xs">{t('accuracy')}</p></div>
        </div>
      </motion.div>

      {gameState.mode !== 'Solo' && allScores.length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5 mb-6 relative z-10" style={CARD}>
          <h3 className="text-[#1A1A2E] mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}><Medal className="w-4 h-4 text-amber-500"/> {t('finalStandings')}</h3>
          <div className="space-y-3">
            {allScores.map((player, i) => (<motion.div key={`${player.name}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: player.isPlayer ? 'rgba(232,76,106,0.06)' : 'rgba(0,0,0,0.02)', border: player.isPlayer ? '1px solid rgba(232,76,106,0.12)' : '1px solid transparent' }}>
                <span className="text-xl w-8 text-center">{getRankIcon(player.rank)}</span>
                <span className="text-xl">{player.avatar}</span>
                <span className={`flex-1 text-sm ${player.isPlayer ? 'text-[#E84C6A]' : 'text-[#1A1A2E]'}`}>{player.name} {player.isPlayer && <span className="text-xs text-[#E84C6A]">({t('you')})</span>}</span>
                <span className="text-[#1A1A2E] text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{player.score.toLocaleString()}</span>
              </motion.div>))}
          </div>
        </motion.div>)}

      {categoryBreakdown.length > 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl p-5 mb-6 relative z-10" style={CARD}>
          <h3 className="text-[#1A1A2E] mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}><Star className="w-4 h-4 text-[#E84C6A]"/> {t('domains')}</h3>
          <div className="space-y-2">
            {categoryBreakdown.map(({ id, icon, name, correct, total }) => {
                const pct = total > 0 ? (correct / total) * 100 : 0;
                return (<div key={id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#1A1A2E]">{icon} {t(`cat${id.charAt(0).toUpperCase() + id.slice(1)}`)}</span>
                    <span className={`${pct === 100 ? 'text-emerald-500' : pct >= 60 ? 'text-amber-500' : 'text-red-500'}`} style={{ fontWeight: 600 }}>{correct}/{total}</span>
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
          <span className="text-[#1A1A2E] text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{t('answerReview')}</span>
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
                        <p className="text-slate-600 text-xs mb-0.5">{cat?.icon} {(isKhmer && q.text_km) ? q.text_km : q.text}</p>
                        {!answer.isCorrect && (
                          <p className="text-emerald-500 text-xs">
                            ✓ {(isKhmer && q.answers.find(a => a.isCorrect)?.text_km) ? q.answers.find(a => a.isCorrect)?.text_km : q.answers.find(a => a.isCorrect)?.text}
                          </p>
                        )}
                      </div>
                      {answer.isCorrect && <span className="text-amber-500 text-xs flex-shrink-0" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>+{answer.pointsEarned}</span>}
                    </div>);
            })}
              </div>
            </motion.div>)}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex gap-3 relative z-10">
        <button onClick={() => { resetGame(); navigate('/dashboard'); }} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-slate-600 hover:bg-white/60 transition-colors text-sm" style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.6)' }}>
          <Home className="w-4 h-4"/> {t('home')}
        </button>
        <button onClick={() => { resetGame(); navigate('/mode-select'); }} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-white text-sm transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 4px 15px rgba(232,76,106,0.3)' }}>
          <RotateCcw className="w-4 h-4"/> {t('playAgain')}
        </button>
        <button onClick={() => { resetGame(); navigate('/leaderboard'); }} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors text-sm" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <Trophy className="w-4 h-4"/> {t('leaderboard')}
        </button>
      </motion.div>
    </div>);
}
