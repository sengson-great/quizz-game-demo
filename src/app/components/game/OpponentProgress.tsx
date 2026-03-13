import { motion } from 'motion/react';
import { CheckCircle, Clock } from 'lucide-react';
import { SimulatedOpponent } from '../../contexts/GameContext';

interface OpponentProgressProps {
  opponents: SimulatedOpponent[];
  playerScore: number;
  playerAvatar: string;
  playerName: string;
}

export function OpponentProgress({ opponents, playerScore, playerAvatar, playerName }: OpponentProgressProps) {
  const maxScore = Math.max(playerScore, ...opponents.map(o => o.score), 1);

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.15)' }}>
      <div className="px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs text-slate-400 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
          Live Battle
        </p>
      </div>
      <div className="p-4 space-y-3">
        {/* Player */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{playerAvatar}</span>
              <span className="text-sm text-white" style={{ fontWeight: 500 }}>{playerName}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>YOU</span>
            </div>
            <span className="text-sm text-indigo-400" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              {playerScore.toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(playerScore / maxScore) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Opponents */}
        {opponents.map(opp => (
          <div key={opp.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{opp.avatar}</span>
                <span className="text-sm text-slate-300">{opp.username}</span>
                {opp.answered ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </motion.div>
                )}
              </div>
              <span className="text-sm text-slate-400" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                {opp.score.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #f472b6, #ec4899)' }}
                initial={{ width: 0 }}
                animate={{ width: `${(opp.score / maxScore) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
