import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, CheckCircle, Clock, Send, UserPlus, AlertCircle, Play, Bot } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { SIMULATED_OPPONENTS } from '../data/mockData';
import { ReturnButton } from '../components/ui/ReturnButton';
import { loadSystemConfig } from '../data/systemConfig';

const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';
const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

export default function SmallRoomLobbyPage() {
  const { gameState, joinSmallRoom, startSmallRoomGame, extendLobbyTimer, resetGame, addAIPlayers } = useGame();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const sysConfig = loadSystemConfig();
  const [countdown, setCountdown] = useState(sysConfig.lobbyTimeout);
  const minPlayers = sysConfig.minRoomPlayers;
  const maxPlayers = sysConfig.maxRoomPlayers;

  useEffect(() => { if (!gameState || gameState.mode !== 'Room') { navigate('/mode-select'); return; } if (!currentUser) { navigate('/auth'); return; } }, [gameState, currentUser, navigate]);

  useEffect(() => {
    if (!gameState || gameState.lobbyStatus !== 'waiting') return;
    const interval = setInterval(() => { setCountdown(prev => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; }); }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (!gameState || !gameState.isHost) return;
    const currentCount = gameState.lobbyPlayers?.length || 0;
    if (currentCount >= maxPlayers) return;
    const joinTimes = [4000, 10000, 18000, 28000];
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    joinTimes.forEach((time, index) => {
      if (index >= (maxPlayers - currentCount)) return;
      if (Math.random() > 0.35) { const t = setTimeout(() => { addAIPlayers(1); }, time); timeouts.push(t); }
    });
    return () => timeouts.forEach(clearTimeout);
  }, [gameState?.isHost]);

  useEffect(() => { if (gameState?.lobbyStatus === 'ready' && gameState?.status === 'active') { setTimeout(() => navigate('/game'), 1500); } }, [gameState, navigate]);

  const copyRoomCode = () => { if (gameState?.roomCode) { navigator.clipboard.writeText(gameState.roomCode).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const sendInvite = () => { setInviteSent(true); setTimeout(() => setInviteSent(false), 2000); };
  const handleStart = () => { if (!gameState?.isHost) return; if ((gameState.lobbyPlayers?.length || 0) < minPlayers) return; startSmallRoomGame(); };
  const handleExtendTimer = () => { extendLobbyTimer(); setCountdown(sysConfig.lobbyTimeout); };
  const handleLeave = () => { resetGame(); navigate('/mode-select'); };
  const handleFillWithAI = () => { const currentCount = gameState?.lobbyPlayers?.length || 0; const spotsRemaining = maxPlayers - currentCount; if (spotsRemaining <= 0) return; const needed = Math.max(minPlayers - currentCount, 0); addAIPlayers(Math.max(needed, 1)); };

  if (!gameState || !currentUser) return null;

  const isHost = gameState.isHost;
  const playerCount = gameState.lobbyPlayers?.length || 0;
  const canStart = isHost && playerCount >= minPlayers;
  const thresholdMet = playerCount >= minPlayers;
  const isExpired = countdown === 0 && playerCount < minPlayers;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="fixed top-6 left-6 z-50"><ReturnButton context="lobby" /></div>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.2]" style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, #F8BBD0, transparent)', filter: 'blur(100px)' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' }}>
            <span className="text-[#E84C6A] text-sm">🏆 Invite Room Lobby</span>
          </div>
          <h1 className="text-[#1A1A2E] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '2rem' }}>
            {thresholdMet ? 'Ready to Start!' : 'Waiting for Players'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isHost ? thresholdMet ? `${playerCount} players joined. You can start now or wait for more!` : `Need at least ${minPlayers} players to start (${minPlayers - playerCount} more needed)` : 'Waiting for the host to start...'}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6 mb-6" style={CARD}>
          <p className="text-slate-500 text-sm mb-3 text-center">Share this code with friends</p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl text-[#1A1A2E] tracking-[0.2em]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800 }}>{gameState.roomCode}</span>
            <button onClick={copyRoomCode} className="p-3 rounded-xl transition-all" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
              {copied ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={sendInvite}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
            style={{ background: inviteSent ? 'rgba(52,211,153,0.08)' : 'rgba(232,76,106,0.06)', border: `1px solid ${inviteSent ? 'rgba(52,211,153,0.15)' : 'rgba(232,76,106,0.12)'}`, color: inviteSent ? '#059669' : '#E84C6A' }}>
            {inviteSent ? <><CheckCircle className="w-4 h-4" />Invite Sent!</> : <><Send className="w-4 h-4" />Invite Friends</>}
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 text-center" style={CARD}>
            <Clock className={`w-6 h-6 mx-auto mb-2 ${countdown <= 15 ? 'text-red-500' : 'text-[#E84C6A]'}`} />
            <div className={`text-3xl mb-1 ${countdown <= 15 ? 'text-red-500' : 'text-[#1A1A2E]'}`} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{minutes}:{seconds.toString().padStart(2, '0')}</div>
            <p className="text-slate-400 text-xs">Time Remaining</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 text-center" style={CARD}>
            <Users className={`w-6 h-6 mx-auto mb-2 ${thresholdMet ? 'text-emerald-500' : 'text-amber-500'}`} />
            <div className={`text-3xl mb-1 ${thresholdMet ? 'text-emerald-500' : 'text-amber-500'}`} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{playerCount} / {maxPlayers}</div>
            <p className="text-slate-400 text-xs">{thresholdMet ? 'Ready to start!' : `Need ${minPlayers - playerCount} more`}</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-6 mb-6" style={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Players in Lobby</h3>
            <span className="text-slate-400 text-sm">{playerCount} / {maxPlayers}</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {gameState.lobbyPlayers?.map((player, index) => (
                <motion.div key={player.id} initial={{ opacity: 0, x: -20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
                  className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)' }}>{player.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[#1A1A2E]">{player.username}</p>
                      {player.id === currentUser.id && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">You</span>}
                      {isHost && player.id === currentUser.id && <span className="text-xs px-2 py-0.5 rounded-full bg-[#E84C6A]/5 text-[#E84C6A] border border-[#E84C6A]/15">Host</span>}
                      {player.isBot && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">Bot</span>}
                    </div>
                    <p className="text-slate-400 text-xs">{player.joinType === 'Code' ? 'Joined via code' : player.joinType === 'Link' ? 'Joined via link' : 'Ready to play'}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </motion.div>
              ))}
            </AnimatePresence>
            {Array.from({ length: maxPlayers - playerCount }).map((_, i) => (
              <motion.div key={`empty-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (playerCount + i) * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.02)' }}><UserPlus className="w-5 h-5 text-slate-300" /></div>
                <p className="text-slate-400 text-sm">Waiting for player...</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpired && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle className="w-5 h-5 text-red-500" /><div className="flex-1"><p className="text-red-600 text-sm">Timer expired! Not enough players to start.</p></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 flex-wrap">
          {isHost && !isExpired && (
            <>
              <motion.button whileHover={{ scale: canStart ? 1.02 : 1 }} whileTap={{ scale: canStart ? 0.98 : 1 }} onClick={handleStart} disabled={!canStart}
                className={`flex-1 py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all relative overflow-hidden ${canStart ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                style={{ background: canStart ? 'linear-gradient(135deg, #E84C6A, #D43B59)' : 'rgba(0,0,0,0.1)', boxShadow: canStart ? '0 4px 20px rgba(232,76,106,0.3)' : 'none', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                {canStart && <motion.div className="absolute inset-0 rounded-xl" animate={{ boxShadow: ['0 0 15px rgba(232,76,106,0.2)', '0 0 30px rgba(232,76,106,0.4)', '0 0 15px rgba(232,76,106,0.2)'] }} transition={{ duration: 1.5, repeat: Infinity }} />}
                <Play className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{canStart ? 'Start Game' : `Need ${minPlayers - playerCount} More Player${minPlayers - playerCount === 1 ? '' : 's'}`}</span>
              </motion.button>
              {playerCount < minPlayers && (
                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFillWithAI}
                  className="px-6 py-4 rounded-xl transition-all flex items-center gap-2"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#d97706' }}>
                  <Bot className="w-4 h-4" />Fill with AI
                </motion.button>
              )}
              {countdown <= 120 && countdown > 0 && (
                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExtendTimer}
                  className="px-6 py-4 rounded-xl transition-all"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#d97706' }}>+60 sec</motion.button>
              )}
            </>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLeave}
            className="py-4 rounded-xl text-slate-500 transition-all px-8"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            {isExpired ? 'Return to Menu' : 'Leave Lobby'}
          </motion.button>
        </div>
        {!isHost && <p className="text-center text-slate-400 text-sm mt-4">Waiting for host to start the game...</p>}
      </div>
    </div>
  );
}