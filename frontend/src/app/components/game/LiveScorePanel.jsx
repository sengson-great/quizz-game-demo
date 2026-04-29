import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
export function LiveScorePanel({ playerScore, playerAvatar, playerName, opponents, mode }) {
    const prevScores = useRef({});
    const [flashes, setFlashes] = useState({});
    const allScorers = [
        { id: 'player', name: playerName, avatar: playerAvatar, score: playerScore, isPlayer: true },
        ...opponents.map(o => ({ id: o.id, name: o.username || o.name, avatar: o.avatar, score: o.score, isPlayer: false })),
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
        return (<div className="flex items-center gap-3 px-4 py-2 rounded-2xl glass-card border-white/20 shadow-lg">
        <span className="text-xl shadow-sm filter drop-shadow-sm">{playerAvatar}</span>
        <div className="flex flex-col -gap-1">
            <span className="text-[9px] font-black text-[#FACC15]/60 tracking-normal">SCORE</span>
            <motion.span key={playerScore} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xs tabular-nums font-black" style={{ fontFamily: 'inherit' }}>
                {playerScore.toLocaleString()}
            </motion.span>
        </div>
      </div>);
    }
    const sorted = [...allScorers].sort((a, b) => b.score - a.score);
    const maxVisible = 3;
    const visible = sorted.slice(0, maxVisible);
    const overflow = sorted.length - maxVisible;
    return (<div className="flex items-center gap-3 px-4 py-2 rounded-2xl glass-card border-white/20 shadow-lg">
      {visible.map((s, i) => (<div key={s.id} className="flex items-center gap-2 relative">
          {i > 0 && <div className="w-px h-6 bg-slate-200/50 mx-1"/>}
          <div className="relative group">
            <span className="text-lg relative z-10">{s.avatar}</span>
            {s.isPlayer && <div className="absolute inset-0 bg-[#FACC15]/20 rounded-full blur-md -z-0"/>}
          </div>
          <div className="flex flex-col -gap-1">
              <span className={`text-[8px] font-black tracking-normal uppercase ${s.isPlayer ? 'text-[#FACC15]' : 'text-slate-400'}`}>
                {s.isPlayer ? 'YOU' : s.name.slice(0, 4)}
              </span>
              <motion.span key={`${s.id}-${s.score}`} initial={{ scale: 1.2, y: -2 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="text-[11px] tabular-nums font-black" style={{
                fontFamily: 'inherit',
                color: s.isPlayer ? '#FACC15' : '#475569',
            }}>
                {s.score}
              </motion.span>
          </div>
          <AnimatePresence>
            {flashes[s.id] && (<motion.span key={`flash-${s.id}-${s.score}`} initial={{ opacity: 1, y: 0, scale: 0.5 }} animate={{ opacity: 0, y: -25, scale: 1.5 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute -top-4 right-0 text-[10px] font-black z-50" style={{
                    fontFamily: 'inherit',
                    color: s.isPlayer ? '#10b981' : '#FACC15',
                    textShadow: '0 0 10px rgba(255,255,255,0.8)'
                }}>
                +{flashes[s.id]}
              </motion.span>)}
          </AnimatePresence>
        </div>))}
      {overflow > 0 && (<div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100/50 border border-white/50">
          <span className="text-slate-500 text-[9px] font-black">
            +{overflow}
          </span>
        </div>)}
    </div>);
}

