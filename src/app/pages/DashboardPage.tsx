import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Trophy, Zap, Target, TrendingUp, ChevronRight, Star, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_GAME_HISTORY } from '../data/mockData';

const CATEGORY_DATA = [
  { subject: 'Science', value: 78, icon: '🔬' },
  { subject: 'History', value: 62, icon: '📜' },
  { subject: 'Tech', value: 85, icon: '💻' },
  { subject: 'Geography', value: 55, icon: '🌍' },
  { subject: 'Sports', value: 70, icon: '⚽' },
  { subject: 'Arts', value: 48, icon: '🎨' },
];

const BAR_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#34d399', '#f472b6', '#fbbf24'];

function CategoryBar({ subject, value, icon, color, index }: { subject: string; value: number; icon: string; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.06 }}
      className="flex items-center gap-2"
    >
      <span className="text-base w-5 flex-shrink-0">{icon}</span>
      <span className="text-slate-400 text-xs w-16 flex-shrink-0">{subject}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.5 + index * 0.06 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs w-8 text-right flex-shrink-0" style={{ color }}>{value}%</span>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) navigate('/auth');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const winRate = currentUser.gamesPlayed > 0
    ? Math.round((currentUser.wins / currentUser.gamesPlayed) * 100)
    : 0;

  const stats = [
    { label: 'Total Score', value: currentUser.totalScore.toLocaleString(), icon: Star, color: 'text-amber-400', bgStyle: { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' } },
    { label: 'Games Played', value: currentUser.gamesPlayed, icon: Target, color: 'text-indigo-400', bgStyle: { background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' } },
    { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'text-emerald-400', bgStyle: { background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' } },
    { label: 'Global Rank', value: currentUser.rank > 0 ? `#${currentUser.rank}` : 'Unranked', icon: Trophy, color: 'text-cyan-400', bgStyle: { background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)' } },
  ];

  const gameModes = [
    {
      icon: '🎯', title: 'Solo Practice', desc: '15 questions, no pressure.',
      badge: 'Best for Practice', badgeStyle: { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
      action: () => navigate('/mode-select', { state: { preMode: 'Solo' } }),
    },
    {
      icon: '⚔️', title: '1v1 Battle', desc: 'Duel a live opponent.',
      badge: 'Recommended', badgeStyle: { background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' },
      action: () => navigate('/mode-select', { state: { preMode: '1v1' } }),
    },
    {
      icon: '🏆', title: 'Room Battle', desc: '3-5 players, live scoreboard.',
      badge: 'Most Fun', badgeStyle: { background: 'rgba(52,211,153,0.12)', color: '#34d399' },
      action: () => navigate('/mode-select', { state: { preMode: 'Room' } }),
    },
  ];

  const modeStyle: Record<string, { background: string; color: string }> = {
    Solo: { background: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    '1v1': { background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' },
    Room: { background: 'rgba(52,211,153,0.12)', color: '#34d399' },
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {currentUser.avatar}
          </div>
          <div>
            <p className="text-slate-500 text-sm">Welcome back,</p>
            <h1 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              {currentUser.username}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs">{currentUser.role === 'admin' ? 'Administrator' : 'Player'}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/mode-select')}
          className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm transition-all hover:scale-[1.03]"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 15px rgba(99,102,241,0.35)' }}>
          <Zap className="w-4 h-4" />
          Play Now
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bgStyle }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-5"
            style={{ ...bgStyle, backdropFilter: 'blur(20px)' }}>
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className="text-2xl text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>{value}</p>
            <p className="text-slate-500 text-sm mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Game Modes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Quick Play</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {gameModes.map(({ icon, title, desc, badge, badgeStyle, action }, i) => (
              <motion.button key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={action}
                className="group text-left rounded-2xl p-5 cursor-pointer transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-3xl mb-3">{icon}</div>
                <span className="text-xs px-2.5 py-1 rounded-full mb-2 inline-block" style={badgeStyle}>{badge}</span>
                <h3 className="text-white text-sm mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{title}</h3>
                <p className="text-slate-500 text-xs">{desc}</p>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 mt-3 transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-white text-sm mb-5" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Category Performance</h2>
          <div className="space-y-3">
            {CATEGORY_DATA.map(({ subject, value, icon }, i) => (
              <CategoryBar
                key={subject}
                subject={subject}
                value={value}
                icon={icon}
                color={BAR_COLORS[i]}
                index={i}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Games */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Recent Games</h2>
          <button onClick={() => navigate('/leaderboard')}
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {MOCK_GAME_HISTORY.map((game, i) => (
            <motion.div key={game.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {game.mode === 'Solo' ? '🎯' : game.mode === '1v1' ? '⚔️' : '🏆'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={modeStyle[game.mode]}>{game.mode}</span>
                    {game.rank && <span className="text-xs text-amber-400">#{game.rank} Place</span>}
                  </div>
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{game.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{game.score.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">{game.correctAnswers}/{game.totalQuestions} correct</p>
              </div>
            </motion.div>
          ))}
          {MOCK_GAME_HISTORY.length === 0 && (
            <div className="py-12 text-center text-slate-500">No games yet. Start playing!</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}