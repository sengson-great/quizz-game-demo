import { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Zap, Target, TrendingUp, ChevronRight, Star, Clock, RefreshCw, Swords, CheckCircle2, AlertCircle, Gamepad2, Brain, Cpu, History, Globe, Palette, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { CATEGORIES } from '../data/questions';
import api from '../../api/axios';

const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

const CARD_STYLE = "glass-card rounded-[2rem] transition-all duration-300 overflow-hidden border-slate-200/60 shadow-xl";

const CategoryBar = memo(({ subject, value, icon, iconColor, index }) => (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.06 }} className="flex items-center gap-3 group">
        <span className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center flex-shrink-0 shadow-sm border border-white group-hover:scale-110 transition-transform">
            <CategoryIcon name={icon} className="w-4 h-4" style={{ color: iconColor }} />
        </span>
        <div className="flex-1">
            <div className="flex justify-between items-end mb-1">
                <span className="text-slate-600 text-[10px] font-bold uppercase tracking-normal truncate" title={subject}>{subject}</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: iconColor }}>{value}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-black/[0.03] border border-white/20">
                <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, type: 'spring', bounce: 0, delay: 0.5 + index * 0.06 }} className="h-full rounded-full shadow-sm" style={{ background: iconColor }}/>
            </div>
        </div>
    </motion.div>
));
CategoryBar.displayName = 'CategoryBar';

function StatSkeleton() {
    return (
        <div className="rounded-[1.5rem] p-6 animate-pulse glass-card border-black/[0.02]">
            <div className="w-8 h-8 rounded-xl bg-slate-200 mb-4"/>
            <div className="w-24 h-8 rounded-lg bg-slate-200 mb-2"/>
            <div className="w-16 h-3 rounded-md bg-slate-100"/>
        </div>
    );
}

const STATUS_ICON = { 
    completed: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, 
    failed: <AlertCircle className="w-4 h-4 text-rose-500" />, 
    timeout: <Clock className="w-4 h-4 text-amber-500" />, 
    active: <Gamepad2 className="w-4 h-4 text-indigo-500" /> 
};

const MODE_ICON = { 
    Solo: <Target className="w-6 h-6 text-emerald-500" />, 
    '1v1': <Swords className="w-6 h-6 text-rose-500" />, 
    Room: <Trophy className="w-6 h-6 text-violet-500" /> 
};
const MODE_STYLE  = {
    Solo:  { background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)' },
    '1v1': { background: 'rgba(244,63,94,0.08)',   color: '#f43f5e', border: '1px solid rgba(244,63,94,0.15)' },
    Room:  { background: 'rgba(139,92,246,0.08)',  color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.15)' },
};

const CategoryIcon = ({ name, className, style }) => {
    const icons = { Brain, Cpu, History, Globe, Zap, Palette, Shield, Target, Swords, Trophy, Sparkles };
    const Icon = (typeof name === 'string' ? icons[name] : name) || Brain;
    return <Icon className={className} style={style} />;
};

export default function DashboardPage() {
    const { currentUser } = useAuth();
    const { t, lang } = useTranslation();
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
        { label: t('totalScore'),  value: loading ? null : (s.total_score ?? 0).toLocaleString(), icon: Star,       color: '#f59e0b', bg: 'rgba(251,191,36,0.04)', border: 'rgba(251,191,36,0.2)' },
        { label: t('statsGames'),  value: loading ? null : s.games_played ?? 0,                   icon: Target,     color: '#FACC15', bg: 'rgba(250, 204, 21, 0.04)', border: 'rgba(250, 204, 21, 0.2)' },
        { label: t('winRate'),     value: loading ? null : `${winRate}%`,                          icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.2)' },
        { label: t('rank'),        value: loading ? null : (s.rank > 0 ? `#${s.rank}` : '—'),     icon: Trophy,     color: '#06b6d4', bg: 'rgba(6,182,212,0.04)', border: 'rgba(6,182,212,0.2)' },
    ];

    const gameModes = [
        { icon: <Target className="w-10 h-10 text-emerald-500" />, title: t('soloPractice'), desc: t('classicDesc'),       badge: t('practiceMode'), color: '#10b981', action: () => navigate('/mode-select', { state: { preMode: 'Solo' } }) },
        { icon: <Swords className="w-10 h-10 text-rose-500" />, title: t('battle1v1'),   desc: t('battleDescShort'),   badge: t('battle1v1'),        color: '#f43f5e', action: () => navigate('/mode-select', { state: { preMode: '1v1'  } }) },
        { icon: <Trophy className="w-10 h-10 text-violet-500" />, title: t('roomMode'),     desc: t('privateRoomDesc'),   badge: t('roomMode'),         color: '#8b5cf6', action: () => navigate('/mode-select', { state: { preMode: 'Room' } }) },
    ];

    const BAR_COLORS = ['#FACC15', '#818CF8', '#06b6d4', '#34d399', '#f59e0b', '#8b5cf6'];
    
    const CATEGORY_DATA = CATEGORIES.map((cat) => {
        const stat = categoryStats.find(s => String(s.id) === String(cat.id) || s.name === cat.name);
        return { 
            id: cat.id,
            subject: (lang === 'km' && cat.nameKm) ? cat.nameKm : cat.name,
            value: stat ? stat.accuracy : 0, 
            icon: cat.icon,
            iconColor: cat.iconColor
        };
    });

    return (
        <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto overflow-hidden relative" style={{ fontFamily: 'inherit' }}>
            
            {/* Background Decorations - Subtler */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#FACC15]/5 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header Section - More Compact */}
            <header className="mb-8 relative">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-5">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-3xl shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/[0.03] to-transparent" />
                            {currentUser.avatar}
                        </motion.div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5">{t('welcomeBack')}</p>
                            <h1 className="text-[#000000] text-2xl font-bold tracking-tight leading-none" style={{ fontFamily: 'inherit' }}>
                                {currentUser.username}
                            </h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                                    <span className="text-emerald-600 text-[9px] font-bold uppercase tracking-normal">{currentUser.role === 'admin' ? t('admin') : t('player')}</span>
                                </span>
                                <span className="text-slate-500 text-[9px] font-bold uppercase tracking-normal opacity-60">Level {Math.floor((stats?.total_score || 0) / 1000) + 1}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.03)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fetchStats(true)}
                            disabled={loading}
                            className="p-3 rounded-xl glass-card border-black/[0.03]"
                        >
                            <RefreshCw className={`w-4.5 h-4.5 text-indigo-500 ${loading ? 'animate-spin' : ''}`}/>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/mode-select')}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-xs font-black tracking-[0.1em] shadow-lg transition-all"
                            style={{ background: 'var(--grad-primary)', boxShadow: '0 4px 15px rgba(250,204,21,0.25)' }}
                        >
                            <Zap className="w-4 h-4 fill-white/20"/> {t('playNow').toUpperCase()}
                        </motion.button>
                    </div>
                </motion.div>
            </header>

            {/* Stat Grid - Compact Padding */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i}/>)
                    : statCards.map(({ label, value, icon: Icon, color, bg, border }, i) => (
                        <motion.div 
                            key={label} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.05 }} 
                            className="glass-card rounded-[1.5rem] p-5 group border-black/[0.03]"
                            style={{ background: bg, borderColor: border }}
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-white shadow-sm border border-black/[0.02]">
                                <Icon className="w-4.5 h-4.5" style={{ color }}/>
                            </div>
                            <h3 className={`text-[#000000] leading-tight font-bold tracking-tighter ${String(value).length > 8 ? 'text-xl' : 'text-2xl'}`} style={{ fontFamily: 'inherit' }}>
                                {value}
                            </h3>
                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-normal mt-1">{label}</p>
                        </motion.div>
                    ))
                }
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Battle Modes - Unified Style */}
                <div className="lg:col-span-2">
                    <h2 className="text-[#000000] text-lg font-bold tracking-tight mb-4" style={{ fontFamily: 'inherit' }}>{t('chooseBattle')}</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {gameModes.map(({ icon, title, desc, badge, color, action }, i) => (
                            <motion.button
                                key={title}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={action}
                                className={`group relative text-left p-5 ${CARD_STYLE} border-black/[0.03]`}
                            >
                                <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110">{icon}</div>
                                <span className="text-[8px] font-bold uppercase tracking-normal px-2 py-1 rounded-md mb-2 inline-block" 
                                      style={{ background: `${color}10`, color, border: `1px solid ${color}15` }}>
                                    {badge}
                                </span>
                                <h3 className="text-[#000000] text-sm font-bold mb-1" style={{ fontFamily: 'inherit' }}>{title}</h3>
                                <p className="text-slate-600 text-[10px] font-medium leading-snug line-clamp-2">{desc}</p>
                                <div className="flex items-center gap-1 text-[9px] font-bold text-[#FACC15] mt-4 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-normal">
                                    {t('start')} <ChevronRight className="w-3 h-3"/>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Performance - Tighter spacing */}
                <div>
                    <h2 className="text-[#000000] text-lg font-bold tracking-tight mb-4" style={{ fontFamily: 'inherit' }}>{t('domains')}</h2>
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.3 }} 
                        className={`p-6 space-y-5 ${CARD_STYLE} border-black/[0.03]`}
                    >
                        {CATEGORY_DATA.map(({ id, subject, value, icon, iconColor }, i) => {
                            const tKey = `cat${id.charAt(0).toUpperCase() + id.slice(1)}`;
                            const translatedSubject = t(tKey);
                            // If translation returns the key itself (meaning it's missing), use the original subject
                            const finalSubject = translatedSubject === tKey ? subject : translatedSubject;
                            return <CategoryBar key={id} subject={finalSubject} value={value} icon={icon} iconColor={iconColor} index={i}/>
                        })}
                    </motion.div>
                </div>
            </div>

            {/* Match History - Cleaner list */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#000000] text-lg font-bold tracking-tight" style={{ fontFamily: 'inherit' }}>{t('recentMatches')}</h2>
                    <button 
                        onClick={() => navigate('/leaderboard')} 
                        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#FACC15] hover:opacity-80 transition-opacity"
                    >
                        {t('leaderboard')} <ChevronRight className="w-3.5 h-3.5"/>
                    </button>
                </div>

                <div className={`${CARD_STYLE} border-black/[0.03]`}>
                    <div className="divide-y divide-black/[0.02]">
                        {/* {loading && <HistorySkeleton/>} */}

                        {!loading && recentGames.length === 0 && (
                            <div className="py-16 text-center">
                                <p className="text-slate-500 font-bold uppercase tracking-normal text-[9px] mb-4">{t('noRecentMatches')}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => navigate('/mode-select')}
                                    className="px-6 py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-normal shadow-md"
                                    style={{ background: 'var(--grad-primary)' }}
                                >
                                    {t('playFirstGame')}
                                </motion.button>
                            </div>
                        )}

                        {!loading && recentGames.map((game, i) => {
                            const isWin = game.status === 'completed';
                            return (
                                <motion.div
                                    key={game.id}
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    transition={{ delay: 0.4 + i * 0.05 }}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-black/[0.01] transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl glass-card flex items-center justify-center text-xl bg-white shadow-sm border border-black/[0.02]">
                                            {MODE_ICON[game.mode] ?? '🎮'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-bold uppercase tracking-normal px-2 py-0.5 rounded bg-black/5 text-slate-600">
                                                    {game.mode}
                                                </span>
                                                {isWin && (
                                                    <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-normal">
                                                        VICTORY
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-500 text-[9px] font-bold mt-1">
                                                {game.date} • Level {game.level}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#000000] text-xl font-bold tabular-nums tracking-tighter">
                                            {(game.score || 0).toLocaleString()}
                                        </p>
                                        <p className="text-slate-500 text-[8px] font-bold uppercase tracking-normal">{t('points')}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}


