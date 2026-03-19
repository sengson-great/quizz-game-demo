import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
export function LiveScorePanel({ playerScore, playerAvatar, playerName, opponents, mode }) {
    const prevScores = useRef({});
    const [flashes, setFlashes] = useState({});
    const allScorers = [
        { id: 'player', name: playerName, avatar: playerAvatar, score: playerScore, isPlayer: true },
        ...opponents.map(o => ({ id: o.id, name: o.username, avatar: o.avatar, score: o.score, isPlayer: false })),
    ];
    useEffect(() => {
        const newFlashes = {};
        allScorers.forEach(s => {
            const prev = prevScores.current[s.id] || 0;
            if (s.score > prev) {
                newFlashes[s.id] = s.score - prev;
            }
            prevScores.current[s.id] = s.score;
        });
        if (Object.keys(newFlashes).length > 0) {
            setFlashes(newFlashes);
            const t = setTimeout(() => setFlashes({}), 800);
            return () => clearTimeout(t);
        }
    }, [playerScore, opponents]);
    if (mode === 'Solo') {
        return (<div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span className="text-sm">{playerAvatar}</span>
        <motion.span key={playerScore} initial={{ scale: 1.3, color: '#E84C6A' }} animate={{ scale: 1, color: '#1A1A2E' }} className="text-xs tabular-nums" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
          {playerScore.toLocaleString()}
        </motion.span>
      </div>);
    }
    const sorted = [...allScorers].sort((a, b) => b.score - a.score);
    const maxVisible = 3;
    const visible = sorted.slice(0, maxVisible);
    const overflow = sorted.length - maxVisible;
    return (<div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {visible.map((s, i) => (<div key={s.id} className="flex items-center gap-1 relative">
          {i > 0 && <span className="text-slate-300 text-[10px] mx-0.5">·</span>}
          <span className="text-sm">{s.avatar}</span>
          <motion.span key={`${s.id}-${s.score}`} initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 350, damping: 18 }} className="text-xs tabular-nums" style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: s.isPlayer ? '#E84C6A' : '#64748b',
            }}>
            {s.score}
          </motion.span>
          <AnimatePresence>
            {flashes[s.id] && (<motion.span key={`flash-${s.id}-${s.score}`} initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -14 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute -top-3.5 right-0 text-[9px]" style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 700,
                    color: s.isPlayer ? '#34d399' : '#E84C6A',
                }}>
                +{flashes[s.id]}
              </motion.span>)}
          </AnimatePresence>
        </div>))}
      {overflow > 0 && (<span className="text-slate-400 text-xs ml-0.5" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          +{overflow}
        </span>)}
    </div>);
}
