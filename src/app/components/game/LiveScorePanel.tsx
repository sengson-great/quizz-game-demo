import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { SimulatedOpponent } from '../../contexts/GameContext';

interface LiveScorePanelProps {
  playerScore: number;
  playerAvatar: string;
  playerName: string;
  opponents: SimulatedOpponent[];
  mode: string;
}

export function LiveScorePanel({ playerScore, playerAvatar, playerName, opponents, mode }: LiveScorePanelProps) {
  if (mode === 'Solo') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-lg">{playerAvatar}</span>
        <motion.span
          key={playerScore}
          initial={{ scale: 1.3, color: '#818cf8' }}
          animate={{ scale: 1, color: '#a5b4fc' }}
          className="text-sm"
          style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
          {playerScore.toLocaleString()}
        </motion.span>
      </div>
    );
  }

  // 1v1 Mode - Compact head-to-head display
  if (mode === '1v1' && opponents.length === 1) {
    const opp = opponents[0];
    const isLeading = playerScore > opp.score;
    const isLosing = playerScore < opp.score;

    return (
      <div className="relative">
        {/* Momentum glow indicator */}
        <motion.div
          className="absolute -inset-1 rounded-2xl"
          animate={{
            boxShadow: isLeading
              ? ['0 0 8px rgba(99,102,241,0.3)', '0 0 20px rgba(99,102,241,0.5)', '0 0 8px rgba(99,102,241,0.3)']
              : isLosing
                ? ['0 0 8px rgba(239,68,68,0.2)', '0 0 16px rgba(239,68,68,0.4)', '0 0 8px rgba(239,68,68,0.2)']
                : ['0 0 6px rgba(251,191,36,0.2)', '0 0 12px rgba(251,191,36,0.3)', '0 0 6px rgba(251,191,36,0.2)'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="relative flex flex-col gap-1 px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${isLeading ? 'rgba(99,102,241,0.3)' : isLosing ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)'}`,
          }}>
          {/* YOU: score - Electric Indigo */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>YOU</span>
            <motion.span
              key={playerScore}
              initial={{ scale: 1.3, color: '#6366f1' }}
              animate={{ scale: 1, color: '#818cf8' }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-sm tabular-nums"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              {playerScore.toLocaleString()} pts
            </motion.span>
            {isLeading && (
              <motion.div animate={{ y: [0, -1, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                <Flame className="w-3 h-3 text-indigo-400" />
              </motion.div>
            )}
          </div>
          {/* OPPONENT: score - Dimmed Silver */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>OPP</span>
            <motion.span
              key={opp.score}
              initial={{ scale: 1.3, color: '#ec4899' }}
              animate={{ scale: 1, color: isLosing ? '#cbd5e1' : '#64748b' }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-sm tabular-nums"
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              {opp.score.toLocaleString()} pts
            </motion.span>
            {isLosing && (
              <motion.div animate={{ y: [0, -1, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                <Flame className="w-3 h-3 text-red-400" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Room mode - compact multi-player
  const allScorers = [
    { id: 'player', name: playerName, avatar: playerAvatar, score: playerScore, isPlayer: true },
    ...opponents.map(o => ({ id: o.id, name: o.username, avatar: o.avatar, score: o.score, isPlayer: false })),
  ].sort((a, b) => b.score - a.score);

  const leading = allScorers[0];

  return (
    <div className="relative">
      {/* Momentum glow for room leader */}
      {leading.isPlayer && playerScore > 0 && (
        <motion.div
          className="absolute -inset-1 rounded-2xl"
          animate={{
            boxShadow: ['0 0 6px rgba(99,102,241,0.2)', '0 0 14px rgba(99,102,241,0.4)', '0 0 6px rgba(99,102,241,0.2)'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {allScorers.slice(0, 3).map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-600 text-xs mx-0.5">·</span>}
            <span className="text-sm">{s.avatar}</span>
            <motion.span
              key={s.score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-xs tabular-nums"
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                color: s.isPlayer ? '#a5b4fc' : '#94a3b8',
              }}>
              {s.score.toLocaleString()}
            </motion.span>
          </div>
        ))}
        {allScorers.length > 3 && (
          <span className="text-slate-500 text-xs">+{allScorers.length - 3}</span>
        )}
      </div>
    </div>
  );
}