import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Search, TrendingUp, RefreshCw, Medal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { getFixedAvatar } from '../utils/avatar';
import api from '../../api/axios';

const CARD = {
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const SORT_OPTIONS = [
    { key: 'total_score', label: 'Total Score' },
    { key: 'high_score',  label: 'Best Score'  },
    { key: 'wins',        label: 'Wins'        },
    { key: 'win_rate',    label: 'Win Rate'    },
];

function SkeletonRow({ i }) {
    return (
        <div
            className="grid grid-cols-12 items-center px-4 sm:px-6 py-4"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', animationDelay: `${i * 60}ms` }}
        >
            <div className="col-span-1"><div className="w-6 h-4 rounded bg-slate-100 animate-pulse"/></div>
            <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 animate-pulse flex-shrink-0"/>
                <div className="w-24 h-4 rounded bg-slate-100 animate-pulse"/>
            </div>
            <div className="col-span-3 flex justify-end"><div className="w-14 h-4 rounded bg-slate-100 animate-pulse"/></div>
            <div className="hidden sm:flex sm:col-span-2 justify-end"><div className="w-10 h-4 rounded bg-slate-100 animate-pulse"/></div>
            <div className="col-span-2 flex justify-end"><div className="w-10 h-4 rounded bg-slate-100 animate-pulse"/></div>
        </div>
    );
}

function PodiumCard({ entry, place }) {
    const heights   = { 1: 'h-28 sm:h-32', 2: 'h-16 sm:h-20', 3: 'h-10 sm:h-14' };
    const sizes     = { 1: 'text-3xl sm:text-4xl', 2: 'text-2xl sm:text-3xl', 3: 'text-2xl sm:text-3xl' };
    const medals    = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const gradients = {
        1: 'linear-gradient(to top, rgba(251,191,36,0.10), rgba(251,191,36,0.02))',
        2: 'linear-gradient(to top, rgba(148,163,184,0.08), rgba(148,163,184,0.02))',
        3: 'linear-gradient(to top, rgba(180,83,9,0.07), rgba(180,83,9,0.02))',
    };
    const scoreColors = { 1: 'text-amber-500', 2: 'text-slate-400', 3: 'text-amber-600' };
    const nameStyle   = place === 1 ? { fontWeight: 700 } : { fontWeight: 500 };

    const avatar = getFixedAvatar(entry.user_id || entry.name, entry.avatar);

    return (
        <div className="flex flex-col items-center gap-1 sm:gap-2" style={place === 1 ? { marginTop: '-1.5rem' } : {}}>
            {place === 1
                ? <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }}>
                    <span className={sizes[place]}>{avatar}</span>
                  </motion.div>
                : <span className={sizes[place]}>{avatar}</span>
            }
            <p className="text-[#1A1A2E] text-[10px] sm:text-sm text-center truncate max-w-[4rem] sm:max-w-[5rem]" style={nameStyle}>
                {entry.name}
            </p>
            <p className={`text-[10px] sm:text-xs ${scoreColors[place]}`}>
                {entry.total_score.toLocaleString()} pts
            </p>
            <div
                className={`w-16 sm:w-20 ${heights[place]} rounded-t-xl flex items-center justify-center text-2xl sm:text-3xl`}
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
        <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 mx-auto mb-3"/>
                <h1 className="text-[#1A1A2E] mb-2 leading-tight" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.75rem' }}>
                    Global Leaderboard
                </h1>
                <p className="text-slate-500 text-sm">Top quiz champions worldwide</p>
            </motion.div>

            {/* Podium — top 3 */}
            {!loading && !error && top3.length >= 3 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="flex items-end justify-center gap-2 sm:gap-4 mb-10 py-6 px-2"
                >
                    <PodiumCard entry={top3[1]} place={2}/>
                    <PodiumCard entry={top3[0]} place={1}/>
                    <PodiumCard entry={top3[2]} place={3}/>
                </motion.div>
            )}

            {/* My rank banner */}
            {myEntry && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="rounded-2xl p-4 mb-6 flex items-center gap-4"
                    style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.18)' }}
                >
                    <Medal className="w-5 h-5 text-[#E84C6A] flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                        <p className="text-[#E84C6A] text-xs mb-0.5" style={{ fontWeight: 600 }}>Your Ranking</p>
                        <p className="text-[#1A1A2E] text-sm truncate" style={{ fontWeight: 600 }}>
                            #{myEntry.rank} · {myEntry.total_score.toLocaleString()} pts · {myEntry.wins} wins · {myEntry.win_rate}% win rate
                        </p>
                    </div>
                    <button
                        onClick={() => fetchLeaderboard(sortBy, true)}
                        disabled={refreshing}
                        className="p-2 rounded-xl transition-all hover:bg-[#E84C6A]/10"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#E84C6A] ${refreshing ? 'animate-spin' : ''}`}/>
                    </button>
                </motion.div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                    <input
                        type="text"
                        placeholder="Search player…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-[#1A1A2E] placeholder-slate-400 focus:outline-none text-sm"
                        style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)' }}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                    {SORT_OPTIONS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleSort(key)}
                            className="px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
                            style={{
                                background: sortBy === key ? 'rgba(232,76,106,0.08)' : 'transparent',
                                border:     sortBy === key ? '1px solid rgba(232,76,106,0.15)' : '1px solid rgba(0,0,0,0.08)',
                                color:      sortBy === key ? '#E84C6A' : '#64748b',
                            }}
                        >
                            <TrendingUp className="w-3.5 h-3.5"/>{label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="text-center py-10 text-red-400">
                    <p className="mb-3">{error}</p>
                    <button onClick={() => fetchLeaderboard(sortBy)} className="px-5 py-2 rounded-xl text-white text-sm" style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)' }}>
                        Retry
                    </button>
                </div>
            )}

            {/* Table */}
            {!error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl overflow-hidden" style={CARD}>
                    {/* Table header */}
                    <div className="grid grid-cols-12 px-4 sm:px-6 py-3 text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <span className="col-span-1">Rank</span>
                        <span className="col-span-6 sm:col-span-4">Player</span>
                        <span className="col-span-3 text-right">Score</span>
                        <span className="hidden sm:block sm:col-span-2 text-right">Games</span>
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
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="grid grid-cols-12 items-center px-4 sm:px-6 py-4 hover:bg-black/[0.01] transition-colors"
                                            style={isMe
                                                ? { background: 'rgba(232,76,106,0.04)', borderLeft: '3px solid #E84C6A' }
                                                : {}
                                            }
                                        >
                                            {/* Rank */}
                                            <div className={`col-span-1 text-xs sm:text-sm ${rs.color}`} style={{ fontWeight: 700 }}>
                                                {rs.icon}
                                            </div>

                                            {/* Player */}
                                            <div className="col-span-6 sm:col-span-4 flex items-center gap-2 sm:gap-3">
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                                                    {avatar}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs sm:text-sm truncate ${isMe ? 'text-[#E84C6A]' : 'text-[#1A1A2E]'}`} style={{ fontWeight: isMe ? 700 : 500 }}>
                                                        {entry.name}{isMe ? ' (you)' : ''}
                                                    </p>
                                                    <p className="text-slate-400 text-[10px] sm:hidden">{entry.games_played} games</p>
                                                </div>
                                            </div>

                                            {/* Score */}
                                            <div className="col-span-3 text-right">
                                                <p className="text-[#1A1A2E] text-xs sm:text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                                                    {entry.total_score.toLocaleString()}
                                                </p>
                                                <p className="text-slate-400 text-[10px] hidden sm:block">Best: {entry.high_score.toLocaleString()}</p>
                                            </div>

                                            {/* Games */}
                                            <div className="hidden sm:block sm:col-span-2 text-right">
                                                <p className="text-slate-600 text-sm">{entry.wins}</p>
                                                <p className="text-slate-400 text-xs">/ {entry.games_played} games</p>
                                            </div>

                                            {/* Win rate */}
                                            <div className="col-span-2 text-right">
                                                <p
                                                    className="text-[10px] sm:text-sm"
                                                    style={{
                                                        fontWeight: 600,
                                                        color: entry.win_rate >= 70 ? '#059669' : entry.win_rate >= 50 ? '#d97706' : '#94a3b8'
                                                    }}
                                                >
                                                    {entry.win_rate.toFixed(1)}%
                                                </p>
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
