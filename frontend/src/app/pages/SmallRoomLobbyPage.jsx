import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, CheckCircle, UserPlus, Play } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ReturnButton } from '../components/ui/ReturnButton';
import { loadSystemConfig } from '../data/systemConfig';
const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';
const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };
export default function SmallRoomLobbyPage() {
    const { gameState, joinSmallRoom, startSmallRoomGame, resetGame } = useGame();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [copied, setCopied] = useState(false);
    const [joining, setJoining] = useState(!!location.state?.joinCode);
    const [joinError, setJoinError] = useState(null);
    const sysConfig = loadSystemConfig();
    const maxPlayers = gameState?.roomSize || sysConfig.maxRoomPlayers;
    const minPlayers = 2;

    // Handle joining via invite code passed from ModeSelectPage
    useEffect(() => {
        const joinCode = location.state?.joinCode;
        if (!joinCode || (gameState && gameState.lobbyInviteCode === joinCode)) {
            setJoining(false);
            return;
        }
        if (!currentUser) { navigate('/auth'); return; }
        
        setJoining(true);
        joinSmallRoom(joinCode)
            .then(() => setJoining(false))
            .catch((err) => {
                setJoining(false);
                setJoinError(err?.response?.data?.message || 'Invalid or expired invite code.');
                setTimeout(() => navigate('/mode-select'), 2500);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { if (!gameState || gameState.mode !== 'Room') {
        if (joining) return; // still joining, don't redirect yet
        navigate('/mode-select');
        return;
    } if (!currentUser) {
        navigate('/auth');
        return;
    } }, [gameState, currentUser, navigate, joining]);
    // No auto-countdown needed — real players join via invite code
    // Navigate when game starts
    useEffect(() => { if (gameState?.status === 'active') {
        setTimeout(() => navigate('/game'), 1500);
    } }, [gameState?.status, navigate]);
    const copyRoomCode = () => { 
        const code = gameState?.lobbyInviteCode;
        if (code) {
            navigator.clipboard.writeText(code).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const handleStart = () => { if (!gameState?.isHost) return; startSmallRoomGame(); };
    const handleLeave = () => { resetGame(); navigate('/mode-select'); };
    if (!gameState || !currentUser) return null;
    const isHost = gameState.isHost;
    const lobbyPlayers = gameState.lobbyPlayers || [];
    const playerCount = lobbyPlayers.length;
    const canStart = isHost && playerCount >= minPlayers;
    const thresholdMet = playerCount >= minPlayers;
    return (<div className="min-h-screen px-4 py-10" style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="fixed z-40" style={{ top: 'calc(1.5rem + var(--safe-area-top))', left: 'calc(1.5rem + var(--safe-area-left))' }}><ReturnButton context="lobby"/></div>
      
      <AnimatePresence>
        {joining && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#E84C6A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#1A1A2E] font-semibold">Joining Room...</p>
            </div>
          </motion.div>
        )}

        {joinError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[101] w-full max-w-sm px-4"
          >
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-medium">{joinError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.2]" style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(100px)' }}/>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, #F8BBD0, transparent)', filter: 'blur(100px)' }}/>
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
            <span className="text-5xl text-[#E84C6A] tracking-[0.2em] font-mono" style={{ fontFamily: 'monospace', fontWeight: 800 }}>{gameState.lobbyInviteCode || '------'}</span>
            <button onClick={copyRoomCode} className="p-3 rounded-xl transition-all" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
              {copied ? <CheckCircle className="w-5 h-5 text-emerald-500"/> : <Copy className="w-5 h-5 text-slate-400"/>}
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center">Friends can join from Mode Select → Room → Join with code</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 text-center" style={CARD}>
            <Users className={`w-6 h-6 mx-auto mb-2 ${thresholdMet ? 'text-emerald-500' : 'text-amber-500'}`}/>
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
              {lobbyPlayers.map((player, index) => (<motion.div key={player.id} initial={{ opacity: 0, x: -20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)' }}>{player.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[#1A1A2E]">{player.id === currentUser.id ? (player.name || player.username) : (player.name || player.username)}</p>
                      {player.id === currentUser.id && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">You</span>}
                      {player.host && <span className="text-xs px-2 py-0.5 rounded-full bg-[#E84C6A]/5 text-[#E84C6A] border border-[#E84C6A]/15">Host</span>}
                    </div>
                    <p className="text-slate-400 text-xs">Ready to play</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500"/>
                </motion.div>))}
            </AnimatePresence>
            {Array.from({ length: maxPlayers - playerCount }).map((_, i) => (<motion.div key={`empty-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (playerCount + i) * 0.1 }} className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.02)' }}><UserPlus className="w-5 h-5 text-slate-300"/></div>
                <p className="text-slate-400 text-sm">Waiting for player...</p>
              </motion.div>))}
          </div>
        </motion.div>



        <div className="flex gap-4 flex-wrap">
          {isHost && (
              <motion.button whileHover={{ scale: canStart ? 1.02 : 1 }} whileTap={{ scale: canStart ? 0.98 : 1 }} onClick={handleStart} disabled={!canStart} className={`flex-1 py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all relative overflow-hidden ${canStart ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`} style={{ background: canStart ? 'linear-gradient(135deg, #E84C6A, #D43B59)' : 'rgba(0,0,0,0.1)', boxShadow: canStart ? '0 4px 20px rgba(232,76,106,0.3)' : 'none', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                {canStart && <motion.div className="absolute inset-0 rounded-xl" animate={{ boxShadow: ['0 0 15px rgba(232,76,106,0.2)', '0 0 30px rgba(232,76,106,0.4)', '0 0 15px rgba(232,76,106,0.2)'] }} transition={{ duration: 1.5, repeat: Infinity }}/>}
                <Play className="w-5 h-5 relative z-10"/>
                <span className="relative z-10">{canStart ? 'Start Game' : `Need ${minPlayers - playerCount} More Player${minPlayers - playerCount === 1 ? '' : 's'}`}</span>
              </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLeave} className="py-4 rounded-xl text-slate-500 transition-all px-8" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
            Leave Lobby
          </motion.button>
        </div>
        {!isHost && <p className="text-center text-slate-400 text-sm mt-4">Waiting for host to start the game...</p>}
      </div>
    </div>);
}
