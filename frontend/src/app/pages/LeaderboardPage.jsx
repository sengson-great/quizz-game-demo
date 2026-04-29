import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Search, TrendingUp, RefreshCw, Medal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { getFixedAvatar } from '../utils/avatar';
import api from '../../api/axios';

const CARD_STYLE = "glass-card rounded-[2rem] transition-all duration-300 overflow-hidden border-slate-200/60 shadow-xl";
const STAT_CARD_STYLE = "glass-card rounded-[1.5rem] p-5 border-black/[0.03]";

const SORT_OPTIONS = [
    { key: 'total_score', label: 'Total Score' },
    { key: 'high_score',  label: 'Best Score'  },
    { key: 'wins',        label: 'Wins'        },
    { key: 'win_rate',    label: 'Win Rate'    },
];

function SkeletonRow({ i }) {
    return (
        <div className="grid grid-cols-12 items-center px-6 py-5 animate-pulse" style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
            <div className="col-span-1"><div className="w-5 h-5 rounded bg-slate-100"/></div>
            <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0"/>
                <div className="w-24 h-4 rounded bg-slate-100"/>
            </div>
            <div className="col-span-3 flex justify-end"><div className="w-14 h-4 rounded bg-slate-100"/></div>
            <div className="hidden sm:flex sm:col-span-2 justify-end"><div className="w-10 h-4 rounded bg-slate-100"/></div>
            <div className="col-span-2 flex justify-end"><div className="w-8 h-8 rounded-lg bg-slate-100"/></div>
        </div>
    );
}

function PodiumCard({ entry, place }) {
    const heights   = { 1: 'h-32 sm:h-40', 2: 'h-20 sm:h-24', 3: 'h-14 sm:h-18' };
    const sizes     = { 1: 'text-4xl sm:text-5xl', 2: 'text-3xl sm:text-4xl', 3: 'text-2xl sm:text-3xl' };
    const medals    = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const gradients = {
        1: 'linear-gradient(to top, rgba(251,191,36,0.15), rgba(251,191,36,0.02))',
        2: 'linear-gradient(to top, rgba(148,163,184,0.12), rgba(148,163,184,0.02))',
        3: 'linear-gradient(to top, rgba(180,83,9,0.10), rgba(180,83,9,0.02))',
    };
    const scoreColors = { 1: 'text-amber-500', 2: 'text-slate-500', 3: 'text-amber-700' };

    const avatar = getFixedAvatar(entry.user_id || entry.name, entry.avatar);

    return (
        <div className="flex flex-col items-center gap-2" style={place === 1 ? { marginTop: '-2rem' } : {}}>
            <motion.div 
                animate={place === 1 ? { y: [-4, 4, -4] } : {}} 
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative group"
            >
                <span className={`${sizes[place]} drop-shadow-xl group-hover:scale-110 transition-transform`}>{avatar}</span>
                {place === 1 && <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">👑</div>}
            </motion.div>
            <p className={`text-[#000000] text-[10px] sm:text-sm text-center truncate max-w-[5rem] sm:max-w-[7rem] ${place === 1 ? 'font-bold' : 'font-medium'}`}>
                {entry?.name || '---'}
            </p>
            <p className={`text-[10px] sm:text-xs font-bold ${scoreColors[place]}`}>
                {(entry?.total_score || 0).toLocaleString()}
            </p>
            <div
                className={`w-20 sm:w-24 ${heights[place]} rounded-t-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-sm border-x border-t border-white/20`}
                style={{ background: gradients[place] }}
            >
                {medals[place]}
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    const { currentUser } = useAuth();
    const { t } = useTranslation();

    const [entries, setEntries]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [search, setSearch]       = useState('');
    const [sortBy, setSortBy]       = useState('total_score');
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderboard = useCallback(async (sort = sortBy, silent = false) => {
        if (!silent) setLoading(true);
        else         setRefreshing(true);
        setError(null);
        try {
            const res = await api.get(`/leaderboard?sort=${sort}&limit=50`);
            setEntries(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load leaderboard. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [sortBy]);

    useEffect(() => {
        fetchLeaderboard(sortBy);
    }, [sortBy]);  // re-fetch when sort changes

    const handleSort = (key) => {
        if (key === sortBy) return;
        setSortBy(key);
    };

    const filtered = entries.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    const top3 = entries.slice(0, 3);

    // Find current user's rank in the full (unfiltered) list
    const myEntry = currentUser
        ? entries.find(e => e.user_id === currentUser.id)
        : null;

    const getRankDisplay = (rank) => {
        if (rank === 1) return { icon: '🥇', color: 'text-amber-500' };
        if (rank === 2) return { icon: '🥈', color: 'text-slate-400' };
        if (rank === 3) return { icon: '🥉', color: 'text-amber-600' };
        return { icon: `#${rank}`, color: 'text-slate-400' };
    };

    return (
        <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto overflow-hidden relative" style={{ fontFamily: 'inherit' }}>
            
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-amber-100/20 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#FACC15]/5 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-3xl shadow-lg mx-auto mb-4 border-black/[0.03]">
                    <Trophy className="w-8 h-8 text-amber-500"/>
                </div>
                <h1 className="text-[#000000] text-3xl font-bold tracking-tight mb-2" style={{ fontFamily: 'inherit' }}>
                    {t('leaderboard')}
                </h1>
                <p className="text-slate-500 text-sm font-medium opacity-80">Top quiz champions worldwide</p>
            </motion.div>

            {/* Podium */}
            {!loading && !error && top3.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-end justify-center gap-2 sm:gap-4 mb-10 py-6 px-2"
                >
                    {top3[1] && <PodiumCard entry={top3[1]} place={2}/>}
                    {top3[0] && <PodiumCard entry={top3[0]} place={1}/>}
                    {top3[2] && <PodiumCard entry={top3[2]} place={3}/>}
                </motion.div>
            )}

            {/* My rank banner */}
            {myEntry && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="rounded-[1.5rem] p-5 mb-8 flex items-center gap-4 glass-card"
                    style={{ background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.15)' }}
                >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-[#FACC15]/10">
                        <Medal className="w-5 h-5 text-[#FACC15]"/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[#FACC15] text-[10px] font-bold uppercase tracking-normal mb-0.5">Your Current Ranking</p>
                        <p className="text-[#000000] text-sm font-bold truncate">
                            #{myEntry.rank} • {(myEntry.total_score || 0).toLocaleString()} pts • {myEntry.wins || 0} wins
                        </p>
                    </div>
                    <button
                        onClick={() => fetchLeaderboard(sortBy, true)}
                        disabled={refreshing}
                        className="p-3 rounded-xl transition-all glass-card border-black/[0.03] hover:bg-black/[0.02]"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`}/>
                    </button>
                </motion.div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#FACC15] transition-colors"/>
                    <input
                        type="text"
                        placeholder="Search player…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-[#000000] placeholder-slate-400 focus:outline-none text-sm glass-card border-black/[0.03] transition-all focus:border-[#FACC15]/20"
                    />
                </div>
                <div className="flex gap-2 p-1.5 rounded-2xl glass-card border-black/[0.03] overflow-x-auto no-scrollbar">
                    {SORT_OPTIONS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleSort(key)}
                            className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-normal transition-all flex items-center gap-2 whitespace-nowrap ${sortBy === key ? 'bg-white shadow-sm text-[#FACC15] border border-black/[0.02]' : 'text-slate-500 hover:text-[#000000]'}`}
                        >
                            <TrendingUp className={`w-3.5 h-3.5 ${sortBy === key ? 'text-[#FACC15]' : 'opacity-40'}`}/>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="text-center py-10 text-red-400">
                    <p className="mb-3">{error}</p>
                    <button onClick={() => fetchLeaderboard(sortBy)} className="px-5 py-2 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #FACC15, #8B5CF6)' }}>
                        Retry
                    </button>
                </div>
            )}

            {/* Table */}
            {!error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className={CARD_STYLE}>
                    {/* Table header */}
                    <div className="grid grid-cols-12 px-6 py-4 text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <span className="col-span-1">Rank</span>
                        <span className="col-span-6 sm:col-span-4">Player</span>
                        <span className="col-span-3 text-right">Score</span>
                        <span className="hidden sm:block sm:col-span-2 text-right">Wins / Games</span>
                        <span className="col-span-2 text-right">Win %</span>
                    </div>

                    {/* Skeleton */}
                    {loading && (
                        <div>
                            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i}/>)}
                        </div>
                    )}

                    {/* Rows */}
                    {!loading && (
                        <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
                            <AnimatePresence mode="popLayout">
                                {filtered.map((entry, i) => {
                                    const rs = getRankDisplay(entry.rank);
                                    const isMe = currentUser && entry.user_id === currentUser.id;
                                    const avatar = getFixedAvatar(entry.user_id || entry.name, entry.avatar);

                                    return (
                                        <motion.div
                                            key={entry.user_id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="grid grid-cols-12 items-center px-6 py-4 hover:bg-black/[0.01] transition-colors group"
                                            style={isMe ? { background: 'rgba(250,204,21,0.02)' } : {}}
                                        >
                                            {/* Rank */}
                                            <div className={`col-span-1 text-xs sm:text-sm font-bold ${rs.color}`}>
                                                {rs.icon}
                                            </div>

                                            {/* Player */}
                                            <div className="col-span-6 sm:col-span-4 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-xl bg-white shadow-sm border border-black/[0.02] group-hover:scale-105 transition-transform">
                                                    {avatar}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs sm:text-sm truncate font-bold ${isMe ? 'text-[#FACC15]' : 'text-[#000000]'}`}>
                                                        {entry.name}
                                                    </p>
                                                    <p className="text-slate-500 text-[10px] font-medium opacity-60">
                                                        Level {Math.floor(entry.total_score / 1000) + 1}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="col-span-3 text-right">
                                                <p className="text-[#000000] text-sm sm:text-lg font-bold tabular-nums tracking-tight">
                                                    {(entry.total_score || 0).toLocaleString()}
                                                </p>
                                                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-normal opacity-60">pts</p>
                                            </div>

                                            {/* Games */}
                                            <div className="hidden sm:block sm:col-span-2 text-right">
                                                <p className="text-[#000000] text-sm font-bold">{entry.wins}</p>
                                                <p className="text-slate-500 text-[10px] font-medium opacity-60">of {entry.games_played} games</p>
                                            </div>

                                            {/* Win rate */}
                                            <div className="col-span-2 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span
                                                        className="text-xs sm:text-sm font-bold tabular-nums"
                                                        style={{
                                                            color: entry.win_rate >= 70 ? '#10b981' : entry.win_rate >= 50 ? '#f59e0b' : '#94a3b8'
                                                        }}
                                                    >
                                                        {entry.win_rate.toFixed(1)}%
                                                    </span>
                                                    <div className="w-12 h-1 rounded-full bg-black/[0.03] mt-1 overflow-hidden">
                                                        <div 
                                                            className="h-full rounded-full" 
                                                            style={{ 
                                                                width: `${entry.win_rate}%`, 
                                                                backgroundColor: entry.win_rate >= 70 ? '#10b981' : entry.win_rate >= 50 ? '#f59e0b' : '#94a3b8' 
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && filtered.length === 0 && !error && (
                        <div className="text-center py-12 text-slate-400">
                            {search ? `No players found matching "${search}"` : 'No data yet — play some games!'}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Footer count */}
            {!loading && !error && filtered.length > 0 && (
                <p className="text-center text-slate-400 text-xs mt-4">
                    Showing {filtered.length} player{filtered.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
