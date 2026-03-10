import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, CheckCircle, Wifi } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';

export default function MatchmakingPage() {
  const { gameState } = useGame();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<'searching' | 'found' | 'ready'>('searching');
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [joinedPlayers, setJoinedPlayers] = useState(1);

  useEffect(() => {
    if (!gameState) { navigate('/mode-select'); return; }
    if (!currentUser) { navigate('/auth'); return; }
  }, [gameState, currentUser, navigate]);

  useEffect(() => {
    if (!gameState) return;

    if (gameState.mode === 'Solo') {
      setTimeout(() => setStage('found'), 500);
      setTimeout(() => {
        setStage('ready');
        setCountdown(3);
      }, 1500);
    } else if (gameState.mode === '1v1') {
      const t1 = setTimeout(() => setStage('found'), 2500);
      const t2 = setTimeout(() => { setStage('ready'); setCountdown(3); }, 3500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      const interval = setInterval(() => {
        setJoinedPlayers(prev => {
          const max = (gameState.opponents.length || 2) + 1;
          if (prev >= max) { clearInterval(interval); return prev; }
          return prev + 1;
        });
      }, 1500);
      setTimeout(() => {
        setStage('found');
        setTimeout(() => { setStage('ready'); setCountdown(3); }, 1000);
      }, gameState.opponents.length * 1500 + 2000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  useEffect(() => {
    if (stage !== 'ready') return;
    if (countdown <= 0) {
      navigate('/game');
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown, navigate]);

  const copyCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!gameState || !currentUser) return null;

  const allPlayers = [
    { username: currentUser.username, avatar: currentUser.avatar, isYou: true },
    ...gameState.opponents.map(o => ({ username: o.username, avatar: o.avatar, isYou: false })),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(145deg, #fff5f5 0%, #fff0f0 50%, #ffffff 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #fecdd3, transparent)', filter: 'blur(120px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          {stage === 'searching' && (
            <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative w-32 h-32 mx-auto mb-8">
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    className="absolute inset-0 rounded-full"
                    style={{ border: '2px solid rgba(232,54,78,0.15)' }}
                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white"
                    style={{ border: '1px solid rgba(232,54,78,0.15)', boxShadow: '0 4px 15px rgba(232,54,78,0.08)' }}>
                    {gameState.mode === 'Solo' ? <span className="text-3xl">🎯</span>
                      : gameState.mode === '1v1' ? <span className="text-3xl">⚔️</span>
                      : <span className="text-3xl">🏆</span>}
                  </div>
                </div>
              </div>
              <h2 className="text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                {gameState.mode === 'Solo' ? 'Preparing Game...' : gameState.mode === '1v1' ? 'Finding Opponent...' : 'Setting Up Room...'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {gameState.mode === '1v1' ? 'Matching you with a worthy challenger...' : gameState.mode === 'Room' ? 'Waiting for players to join...' : 'Loading your questions...'}
              </p>

              {gameState.mode === 'Room' && (
                <div className="rounded-2xl p-6 mb-4 bg-white"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  <p className="text-gray-500 text-sm mb-2">Room Code</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl text-gray-900" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: '0.2em' }}>
                      {gameState.roomCode}
                    </span>
                    <button onClick={copyCode} className="p-2 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors">
                      {copied ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                    <Users className="w-4 h-4" />
                    {joinedPlayers} / {gameState.opponents.length + 1} players joined
                  </div>
                  <div className="mt-2 flex gap-1 justify-center">
                    {Array.from({ length: gameState.opponents.length + 1 }, (_, i) => (
                      <motion.div key={i}
                        className={`w-3 h-3 rounded-full ${i < joinedPlayers ? 'bg-emerald-400' : 'bg-gray-200'}`}
                        animate={i < joinedPlayers ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {gameState.mode !== 'Room' && (
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Wifi className="w-4 h-4" />
                  </motion.div>
                  Connecting...
                </div>
              )}
            </motion.div>
          )}

          {stage === 'found' && (
            <motion.div key="found" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(52,211,153,0.08)', border: '2px solid rgba(52,211,153,0.3)' }}>
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <h2 className="text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                {gameState.mode === 'Solo' ? 'Game Ready!' : 'Match Found!'}
              </h2>
              <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                {allPlayers.map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-white"
                      style={{
                        border: p.isYou ? '2px solid #e8364e' : '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}>
                      {p.avatar}
                    </div>
                    <p className="text-sm text-gray-800">{p.isYou ? 'YOU' : p.username}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'ready' && (
            <motion.div key="ready" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: countdown > 0 ? Infinity : 0 }}
                className="text-[8rem] mx-auto mb-4 flex items-center justify-center"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  color: countdown > 1 ? '#e8364e' : countdown === 1 ? '#d97706' : '#059669',
                  filter: `drop-shadow(0 0 30px currentColor)`,
                }}>
                {countdown === 0 ? '🚀' : countdown}
              </motion.div>
              <p className="text-gray-500">{countdown === 0 ? 'Starting...' : 'Get Ready!'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
