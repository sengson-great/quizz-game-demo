import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CheckCircle, Wifi, Bot } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ReturnButton } from '../components/ui/ReturnButton';
const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';
const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };
export default function MatchmakingPage() {
    const { gameState } = useGame();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [stage, setStage] = useState('searching');
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [joinedPlayers, setJoinedPlayers] = useState(1);
    const [matchType, setMatchType] = useState(null);
    useEffect(() => { if (!gameState) {
        navigate('/mode-select');
        return;
    } if (!currentUser) {
        navigate('/auth');
        return;
    } }, [gameState, currentUser, navigate]);
    useEffect(() => {
        if (!gameState)
            return;
        if (gameState.mode === 'Solo') {
            setTimeout(() => setStage('found'), 500);
            setTimeout(() => { setStage('ready'); setCountdown(3); }, 1500);
        }
        else if (gameState.mode === '1v1') {
            const isHumanMatch = Math.random() > 0.3;
            const searchTime = 2000 + Math.random() * 3000;
            const t1 = setTimeout(() => { setMatchType(isHumanMatch ? 'human' : 'system'); setStage('found'); }, searchTime);
            const t2 = setTimeout(() => { setStage('ready'); setCountdown(3); }, searchTime + 1500);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
        else if (gameState.mode === 'Room' && !gameState.isPrivate) {
            const totalPlayers = gameState.lobbyPlayers?.length || 3;
            setStage('filling');
            const fillIntervals = [];
            for (let i = 1; i < totalPlayers; i++) {
                const t = setTimeout(() => { setJoinedPlayers(i + 1); }, 1000 + i * 1200);
                fillIntervals.push(t);
            }
            const foundTime = 1000 + totalPlayers * 1200 + 500;
            const t1 = setTimeout(() => setStage('found'), foundTime);
            const t2 = setTimeout(() => { setStage('ready'); setCountdown(3); }, foundTime + 1000);
            return () => { fillIntervals.forEach(clearTimeout); clearTimeout(t1); clearTimeout(t2); };
        }
        else {
            const interval = setInterval(() => {
                setJoinedPlayers(prev => { const max = (gameState.opponents.length || 2) + 1; if (prev >= max) {
                    clearInterval(interval);
                    return prev;
                } return prev + 1; });
            }, 1500);
            setTimeout(() => { setStage('found'); setTimeout(() => { setStage('ready'); setCountdown(3); }, 1000); }, gameState.opponents.length * 1500 + 2000);
            return () => clearInterval(interval);
        }
    }, [gameState]);
    useEffect(() => {
        if (stage !== 'ready')
            return;
        if (countdown <= 0) {
            navigate('/game');
            return;
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [stage, countdown, navigate]);
    const copyCode = () => { if (gameState?.roomCode) {
        navigator.clipboard.writeText(gameState.roomCode).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } };
    if (!gameState || !currentUser)
        return null;
    const isRandomRoom = gameState.mode === 'Room' && !gameState.isPrivate;
    const isRanked1v1 = gameState.mode === '1v1' && gameState.is_ranked;
    const totalPlayersInRoom = gameState.lobbyPlayers?.length || 3;
    const allPlayers = [{ username: currentUser.username, avatar: currentUser.avatar, isYou: true }, ...gameState.opponents.map(o => ({ username: o.username, avatar: o.avatar, isYou: false }))];
    return (<div className="min-h-screen flex items-center justify-center px-4" style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="fixed top-6 left-6 z-50"><ReturnButton context="matchmaking"/></div>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.25]" style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(120px)' }}/>
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          {(stage === 'searching' || stage === 'filling') && (<motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative w-32 h-32 mx-auto mb-8">
                {[0, 1, 2].map(i => (<motion.div key={i} className="absolute inset-0 rounded-full" style={{ border: `2px solid ${isRanked1v1 ? 'rgba(6,182,212,0.2)' : 'rgba(232,76,106,0.2)'}` }} animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}/>))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: `1px solid ${isRanked1v1 ? 'rgba(6,182,212,0.15)' : 'rgba(232,76,106,0.15)'}`, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                    {gameState.mode === 'Solo' ? <span className="text-3xl">🎯</span> : gameState.mode === '1v1' ? <span className="text-3xl">⚔️</span> : <span className="text-3xl">🏆</span>}
                  </div>
                </div>
              </div>
              <h2 className="text-[#1A1A2E] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {gameState.mode === 'Solo' ? 'Preparing Game...' : isRanked1v1 ? 'Finding Opponent...' : isRandomRoom ? 'Filling Room...' : 'Setting Up Room...'}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                {isRanked1v1 ? 'Searching for a human player... AI backup ready' : isRandomRoom ? 'Auto-filling with available players...' : 'Loading your questions...'}
              </p>

              {isRandomRoom && (<div className="rounded-2xl p-6 mb-4" style={CARD}>
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-3"><Users className="w-4 h-4"/>{joinedPlayers} / {totalPlayersInRoom} players joined</div>
                  <div className="flex gap-2 justify-center">
                    {Array.from({ length: totalPlayersInRoom }, (_, i) => (<motion.div key={i} className={`w-4 h-4 rounded-full ${i < joinedPlayers ? 'bg-emerald-400' : 'bg-slate-200'}`} animate={i < joinedPlayers ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}/>))}
                  </div>
                  <div className="mt-3 space-y-2">
                    {gameState.lobbyPlayers?.slice(0, joinedPlayers).map((player) => (<motion.div key={player.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="flex items-center gap-2 justify-center text-sm">
                        <span className="text-lg">{player.avatar}</span>
                        <span className={player.id === currentUser.id ? 'text-[#E84C6A]' : 'text-[#1A1A2E]'}>{player.id === currentUser.id ? 'You' : player.username}</span>
                      </motion.div>))}
                  </div>
                </div>)}

              {isRanked1v1 && (<div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}><Wifi className="w-4 h-4"/></motion.div>
                  Scanning matchmaking pool...
                </div>)}
            </motion.div>)}

          {stage === 'found' && (<motion.div key="found" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(52,211,153,0.08)', border: '2px solid rgba(52,211,153,0.2)' }}>
                <CheckCircle className="w-10 h-10 text-emerald-500"/>
              </motion.div>
              <h2 className="text-[#1A1A2E] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                {gameState.mode === 'Solo' ? 'Game Ready!' : isRandomRoom ? 'Room Ready!' : isRanked1v1 && matchType === 'system' ? 'System Random Matched!' : 'Match Found!'}
              </h2>
              {isRanked1v1 && matchType === 'system' && (<div className="flex items-center justify-center gap-2 mb-4"><Bot className="w-4 h-4 text-amber-500"/><p className="text-amber-500 text-xs">No human found - matched with AI opponent</p></div>)}
              <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                {allPlayers.map((p, i) => (<motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: p.isYou ? '2px solid #E84C6A' : '1px solid rgba(0,0,0,0.06)', boxShadow: p.isYou ? '0 0 20px rgba(232,76,106,0.15)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                      {p.avatar}
                    </div>
                    <p className="text-sm text-[#1A1A2E]">{p.isYou ? 'YOU' : p.username}</p>
                  </motion.div>))}
              </div>
            </motion.div>)}

          {stage === 'ready' && (<motion.div key="ready" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.5, repeat: countdown > 0 ? Infinity : 0 }} className="text-[8rem] mx-auto mb-4 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: countdown > 1 ? '#E84C6A' : countdown === 1 ? '#d97706' : '#059669', filter: `drop-shadow(0 0 30px currentColor)` }}>
                {countdown === 0 ? '🚀' : countdown}
              </motion.div>
              <p className="text-slate-500">{countdown === 0 ? 'Starting...' : 'Get Ready!'}</p>
            </motion.div>)}
        </AnimatePresence>
      </div>
    </div>);
}
