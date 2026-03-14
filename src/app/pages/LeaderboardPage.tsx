import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Search, TrendingUp } from 'lucide-react';
import { INITIAL_LEADERBOARD } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

export default function LeaderboardPage() {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'totalScore' | 'wins' | 'winRate'>('totalScore');

  const leaderboard = [...INITIAL_LEADERBOARD].sort((a, b) => {
    if (sortBy === 'totalScore') return b.totalScore - a.totalScore;
    if (sortBy === 'wins') return b.wins - a.wins;
    return b.winRate - a.winRate;
  });
  const filtered = leaderboard.filter(e => e.username.toLowerCase().includes(search.toLowerCase()));

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-amber-400' };
    if (rank === 2) return { icon: '🥈', color: 'text-slate-300' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600' };
    return { icon: `#${rank}`, color: 'text-slate-500' };
  };

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h1 className="text-[#1A1A2E] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '2rem' }}>
          Global Leaderboard
        </h1>
        <p className="text-[#6B7280] text-sm">Top quiz champions worldwide</p>
      </motion.div>

      {/* Top 3 Podium */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-end justify-center gap-4 mb-10">
        {top3[1] && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">{top3[1].avatar}</span>
            <p className="text-[#1A1A2E] text-sm text-center">{top3[1].username}</p>
            <p className="text-[#9CA3AF] text-xs">{top3[1].totalScore.toLocaleString()}</p>
            <div className="w-20 h-20 rounded-t-xl flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(to top, rgba(148,163,184,0.08), rgba(148,163,184,0.02))' }}>
              🥈
            </div>
          </div>
        )}
        {top3[0] && (
          <div className="flex flex-col items-center gap-2 -mt-6">
            <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }}>
              <span className="text-4xl">{top3[0].avatar}</span>
            </motion.div>
            <p className="text-white text-sm text-center" style={{ fontWeight: 600 }}>{top3[0].username}</p>
            <p className="text-amber-500 text-xs">{top3[0].totalScore.toLocaleString()}</p>
            <div className="w-24 h-28 rounded-t-xl flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(to top, rgba(251,191,36,0.08), rgba(251,191,36,0.02))', boxShadow: '0 0 30px rgba(251,191,36,0.06)' }}>
              🥇
            </div>
          </div>
        )}
        {top3[2] && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">{top3[2].avatar}</span>
            <p className="text-[#1A1A2E] text-sm text-center">{top3[2].username}</p>
            <p className="text-[#9CA3AF] text-xs">{top3[2].totalScore.toLocaleString()}</p>
            <div className="w-20 h-14 rounded-t-xl flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(to top, rgba(180,83,9,0.06), rgba(180,83,9,0.02))' }}>
              🥉
            </div>
          </div>
        )}
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none text-sm"
            style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
          />
        </div>
        <div className="flex gap-2">
          {([['totalScore', 'Score'], ['wins', 'Wins'], ['winRate', 'Win Rate']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)}
              className="px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-1.5"
              style={{
                background: sortBy === key ? 'rgba(232,76,106,0.08)' : 'transparent',
                border: sortBy === key ? '1px solid rgba(232,76,106,0.15)' : '1px solid rgba(0,0,0,0.06)',
                color: sortBy === key ? '#E84C6A' : '#6B7280',
              }}>
              <TrendingUp className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="grid grid-cols-12 px-6 py-3 text-[#9CA3AF] text-xs uppercase tracking-wider"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <span className="col-span-1">Rank</span>
          <span className="col-span-4">Player</span>
          <span className="col-span-3 text-right">Score</span>
          <span className="col-span-2 text-right">Games</span>
          <span className="col-span-2 text-right">Win %</span>
        </div>

        <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,0.04)' }}>
          {filtered.map((entry, i) => {
            const rank = i + 1;
            const rs = getRankStyle(rank);
            const isCurrentUser = currentUser && entry.userId === currentUser.id;

            return (
              <motion.div key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-[#FFF5F5]/50 transition-colors"
                style={isCurrentUser ? { background: 'rgba(232,76,106,0.04)', borderLeft: '2px solid #E84C6A' } : {}}>
                <div className={`col-span-1 text-sm ${rs.color}`} style={{ fontWeight: 700 }}>
                  {rs.icon}
                </div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {entry.avatar}
                  </div>
                  <div>
                    <p className={`text-sm ${isCurrentUser ? 'text-[#E84C6A]' : 'text-[#1A1A2E]'}`}>
                      {entry.username}
                      {isCurrentUser && <span className="ml-1 text-xs text-[#E84C6A]">(you)</span>}
                    </p>
                    <p className="text-[#9CA3AF] text-xs">{entry.gamesPlayed} games</p>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <p className="text-[#1A1A2E] text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                    {entry.totalScore.toLocaleString()}
                  </p>
                  <p className="text-[#9CA3AF] text-xs">Best: {entry.bestScore.toLocaleString()}</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-[#1A1A2E] text-sm">{entry.wins}</p>
                  <p className="text-[#9CA3AF] text-xs">wins</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className={`text-sm ${entry.winRate >= 70 ? 'text-emerald-400' : entry.winRate >= 50 ? 'text-amber-400' : 'text-slate-400'}`} style={{ fontWeight: 600 }}>
                    {entry.winRate.toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">No players found matching "{search}"</div>
      )}
    </div>
  );
}