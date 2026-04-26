import { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Zap, Target, TrendingUp, ChevronRight, Star, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { CATEGORIES } from '../data/questions';
import api from '../../api/axios';

const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

const CategoryBar = memo(({ subject, value, icon, color, index }) => (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.06 }} className="flex items-center gap-2">
        <span className="text-base w-5 flex-shrink-0">{icon}</span>
        <span className="text-slate-500 text-xs w-20 flex-shrink-0 truncate" title={subject}>{subject}</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, delay: 0.5 + index * 0.06 }} className="h-full rounded-full" style={{ background: color }}/>
        </div>
        <span className="text-xs w-8 text-right flex-shrink-0" style={{ color }}>{value}%</span>
    </motion.div>
));
CategoryBar.displayName = 'CategoryBar';

function StatSkeleton() {
    return (
        <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="w-5 h-5 rounded bg-slate-200 mb-3"/>
            <div className="w-20 h-7 rounded bg-slate-200 mb-2"/>
            <div className="w-16 h-3 rounded bg-slate-100"/>
        </div>
    );
}

function HistorySkeleton() {
    return Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100"/>
                <div>
                    <div className="w-16 h-3 rounded bg-slate-100 mb-2"/>
                    <div className="w-24 h-3 rounded bg-slate-100"/>
                </div>
            </div>
            <div className="text-right">
                <div className="w-16 h-4 rounded bg-slate-100 mb-1"/>
                <div className="w-12 h-3 rounded bg-slate-100"/>
            </div>
        </div>
    ));
}

const STATUS_ICON = { completed: '✅', failed: '❌', timeout: '⏰', active: '▶️' };
const MODE_ICON   = { Solo: '🎯', '1v1': '⚔️', Room: '🏆' };
const MODE_STYLE  = {
    Solo:  { background: 'rgba(251,191,36,0.1)',  color: '#d97706' },
    '1v1': { background: 'rgba(232,76,106,0.08)', color: '#E84C6A' },
    Room:  { background: 'rgba(52,211,153,0.08)', color: '#059669' },
};

export default function DashboardPage() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [stats, setStats]           = useState(null);
    const [categoryStats, setCategoryStats] = useState([]);
    const [recentGames, setRecentGames] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);

    const fetchStats = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const res = await api.get('/me/stats');
            setStats(res.data.stats);
            setRecentGames(res.data.recent_games || []);
            setCategoryStats(res.data.category_stats || []);
        } catch (err) {
            console.error(err);
            setError('Could not load stats.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    if (!currentUser) return null;

    const s = stats || {};
    const winRate = s.win_rate ?? 0;

    const statCards = [
        { label: t('totalScore'),  value: loading ? null : (s.total_score ?? 0).toLocaleString(), icon: Star,       color: 'text-amber-500',  bgStyle: { background: 'rgba(251,191,36,0.08)',  border: '1px solid rgba(251,191,36,0.15)'  } },
        { label: t('statsGames'),  value: loading ? null : s.games_played ?? 0,                   icon: Target,     color: 'text-[#E84C6A]',  bgStyle: { background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' } },
        { label: t('winRate'),     value: loading ? null : `${winRate}%`,                          icon: TrendingUp, color: 'text-emerald-500', bgStyle: { background: 'rgba(52,211,153,0.06)',  border: '1px solid rgba(52,211,153,0.12)'  } },
        { label: t('rank'),        value: loading ? null : (s.rank > 0 ? `#${s.rank}` : '—'),     icon: Trophy,     color: 'text-cyan-500',    bgStyle: { background: 'rgba(6,182,212,0.06)',   border: '1px solid rgba(6,182,212,0.12)'   } },
    ];

    const gameModes = [
        { icon: '🎯', title: t('soloPractice'), desc: t('classicDesc'),       badge: t('readyForChallenge'), badgeStyle: { background: 'rgba(251,191,36,0.1)',  color: '#d97706' }, action: () => navigate('/mode-select', { state: { preMode: 'Solo' } }) },
        { icon: '⚔️', title: t('battle1v1'),   desc: t('battleDescShort'),   badge: t('battle1v1'),        badgeStyle: { background: 'rgba(232,76,106,0.08)', color: '#E84C6A' }, action: () => navigate('/mode-select', { state: { preMode: '1v1'  } }) },
        { icon: '🏆', title: t('roomMode'),     desc: t('privateRoomDesc'),   badge: t('roomMode'),         badgeStyle: { background: 'rgba(52,211,153,0.08)',  color: '#059669' }, action: () => navigate('/mode-select', { state: { preMode: 'Room' } }) },
    ];

    const BAR_COLORS = ['#E84C6A', '#F472B6', '#06b6d4', '#34d399', '#f59e0b', '#8b5cf6'];
    
    // Map categories and merge with real accuracy data from API
    const CATEGORY_DATA = CATEGORIES.map((cat, i) => {
        const realStat = categoryStats.find(cs => cs.slug === cat.id);
        return {
            id: cat.id,
            subject: t(`cat${cat.id.charAt(0).toUpperCase() + cat.id.slice(1)}`),
            value: realStat ? realStat.accuracy : 0, 
            icon: cat.icon,
        };
    });


    return (
        <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={CARD}>
                        {currentUser.avatar}
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('welcomeBack')}</p>
                        <h1 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{currentUser.username}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
                            <span className="text-emerald-500 text-xs">{currentUser.role === 'admin' ? t('admin') : t('player')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchStats(true)}
                        disabled={loading}
                        className="hidden sm:flex p-2 rounded-xl transition-all hover:bg-black/5"
                        title="Refresh stats"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`}/>
                    </button>
                    <button
                        onClick={() => navigate('/mode-select')}
                        className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm transition-all hover:scale-[1.03]"
                        style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 4px 15px rgba(232,76,106,0.3)' }}
                    >
                        <Zap className="w-4 h-4"/> {t('playNow')}
                    </button>
                </div>
            </motion.div>

            {/* Error */}
            {error && (
                <div className="mb-6 px-4 py-3 rounded-xl text-red-500 text-sm flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <span>{error}</span>
                    <button onClick={() => fetchStats()} className="text-xs underline">Retry</button>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i}/>)
                    : statCards.map(({ label, value, icon: Icon, color, bgStyle }, i) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl p-5" style={{ ...bgStyle, backdropFilter: 'blur(20px)' }}>
                            <Icon className={`w-5 h-5 ${color} mb-3`}/>
                            <p className={`text-[#1A1A2E] leading-tight ${String(value).length > 8 ? 'text-lg' : 'text-2xl'}`} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                                {value}
                            </p>
                            <p className="text-slate-400 text-sm mt-1 truncate">{label}</p>
                        </motion.div>
                    ))
                }
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Game Modes */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-[#1A1A2E] text-lg" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{t('chooseBattle')}</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {gameModes.map(({ icon, title, desc, badge, badgeStyle, action }, i) => (
                            <motion.button
                                key={title}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                                onClick={action}
                                className="group text-left rounded-2xl p-5 cursor-pointer transition-all"
                                style={CARD}
                            >
                                <div className="text-3xl mb-3">{icon}</div>
                                <span className="text-xs px-2.5 py-1 rounded-full mb-2 inline-block" style={badgeStyle}>{badge}</span>
                                <h3 className="text-[#1A1A2E] text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{title}</h3>
                                <p className="text-slate-400 text-xs">{desc}</p>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#E84C6A] mt-3 transition-colors"/>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Category Performance */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5" style={CARD}>
                    <h2 className="text-[#1A1A2E] text-sm mb-5" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{t('domains')}</h2>
                    <div className="space-y-3">
                        {CATEGORY_DATA.map(({ subject, value, icon }, i) => (
                            <CategoryBar key={subject} subject={subject} value={value} icon={icon} color={BAR_COLORS[i]} index={i}/>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Games */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl overflow-hidden" style={CARD}>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <h2 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{t('recentMatches')}</h2>
                    <button onClick={() => navigate('/leaderboard')} className="text-[#E84C6A] hover:text-[#D43B59] text-sm flex items-center gap-1 transition-colors">
                        {t('leaderboard')} <ChevronRight className="w-3 h-3"/>
                    </button>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                    {loading && <HistorySkeleton/>}

                    {!loading && recentGames.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-slate-400 text-sm">{t('noRecentMatches')}</p>
                            <button
                                onClick={() => navigate('/mode-select')}
                                className="mt-3 px-5 py-2 rounded-xl text-white text-sm"
                                style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)' }}
                            >
                                Play your first game!
                            </button>
                        </div>
                    )}

                    {!loading && recentGames.map((game, i) => {
                        const isWin = game.status === 'completed';
                        return (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.04 }}
                                className="flex items-center justify-between px-6 py-4 hover:bg-black/[0.01] transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(0,0,0,0.03)' }}>
                                        {MODE_ICON[game.mode] ?? '🎮'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={MODE_STYLE[game.mode] ?? {}}>
                                                {game.mode}
                                            </span>
                                            <span className="text-xs">
                                                {STATUS_ICON[game.status] ?? ''}
                                            </span>
                                            {isWin && <span className="text-xs text-emerald-500 font-semibold">Win</span>}
                                        </div>
                                        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3"/>
                                            {game.date} · Q{game.level}/15
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                                        {game.score.toLocaleString()}
                                    </p>
                                    <p className="text-slate-400 text-xs">points</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}
