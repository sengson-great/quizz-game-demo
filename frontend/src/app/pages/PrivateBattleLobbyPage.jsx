import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, CheckCircle, Clock, AlertCircle, Play, Swords, Shuffle, Link2, Wifi } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ReturnButton } from '../components/ui/ReturnButton';
import { loadSystemConfig } from '../data/systemConfig';
const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';
const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };
const MODAL_BG = { background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' };
export default function PrivateBattleLobbyPage() {
    const { gameState, resetGame, switchToRandom, startBattle, joinBattle } = useGame();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [copied, setCopied] = useState(false);
    const [joining, setJoining] = useState(!!location.state?.joinCode);
    const [joinError, setJoinError] = useState(null);
    const sysConfig = loadSystemConfig();
    const [countdown, setCountdown] = useState(sysConfig.lobbyTimeout);
    const [gameStarting, setGameStarting] = useState(false);
    const [switchedToRandom, setSwitchedToRandom] = useState(false);
    const [searchingRandom, setSearchingRandom] = useState(false);
    const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
    const searchTimerRef = useRef(null);

    // Handle joining via invite code passed from ModeSelectPage
    useEffect(() => {
        const joinCode = location.state?.joinCode;
        if (!joinCode || (gameState && gameState.lobbyInviteCode === joinCode)) {
            setJoining(false);
            return;
        }
        if (!currentUser) { navigate('/auth'); return; }
        
        setJoining(true);
        joinBattle(joinCode)
            .then(() => setJoining(false))
            .catch((err) => {
                setJoining(false);
                setJoinError(err?.response?.data?.message || 'Invalid or expired battle code.');
                setTimeout(() => navigate('/mode-select'), 2500);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!gameState || gameState.mode !== '1v1') {
            if (joining) return;
            navigate('/mode-select');
            return;
        }
        if (!currentUser) {
            navigate('/auth');
            return;
        }
        if (gameState.is_ranked && !gameState.isPrivate) {
            setSwitchedToRandom(true);
            setSearchingRandom(true);
        }
    }, [gameState?.mode, currentUser, navigate, joining]);

    useEffect(() => {
        if (gameState?.status === 'active') {
            setTimeout(() => navigate('/game'), 1500);
        }
    }, [gameState?.status, navigate]);

    const copyRoomCode = () => {
        const code = gameState?.lobbyInviteCode;
        if (code) {
            navigator.clipboard.writeText(code).catch(() => { });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const copyRoomLink = () => {
        const code = gameState?.lobbyInviteCode;
        if (code) {
            const link = `${window.location.origin}/battle-lobby?code=${code}`;
            navigator.clipboard.writeText(link).catch(() => { });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    const handleSwitchToRandom = () => { setShowSwitchConfirm(true); };
    const confirmSwitchToRandom = () => { setShowSwitchConfirm(false); setSwitchedToRandom(true); setSearchingRandom(true); switchToRandom(); };
    const handleStart = () => { if (!gameState?.isHost || (gameState.lobbyPlayers?.length || 0) < 2) return; startBattle(); };
    const handleCancel = () => { resetGame(); navigate('/mode-select', { state: { preMode: '1v1' } }); };

    if (!gameState || !currentUser) return null;

    const lobbyPlayers = gameState.lobbyPlayers || [];
    const opponent = lobbyPlayers.find(p => p.id !== currentUser.id);
    const opponentJoined = !!opponent;
    const isPrivateMode = gameState.isPrivate && !switchedToRandom;
    const canStart = gameState.isHost && opponentJoined;

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
              <p className="text-[#1A1A2E] font-semibold">Joining Battle...</p>
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
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.2]" style={{ background: 'radial-gradient(circle, #F8BBD0, transparent)', filter: 'blur(100px)' }}/>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(100px)' }}/>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full mb-4" style={{ background: switchedToRandom ? 'rgba(6,182,212,0.06)' : 'rgba(232,76,106,0.06)', border: `1px solid ${switchedToRandom ? 'rgba(6,182,212,0.15)' : 'rgba(232,76,106,0.12)'}` }}>
            <span className={switchedToRandom ? 'text-cyan-600 text-sm' : 'text-[#E84C6A] text-sm'}>
              {switchedToRandom ? '🔄 Random Matchmaking' : '⚔️ Private 1v1 Battle'}
            </span>
          </div>
          <h1 className="text-[#1A1A2E] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '2rem' }}>
            {searchingRandom ? 'Searching for Opponent...' : opponentJoined ? 'Opponent Found!' : 'Waiting for Opponent'}
          </h1>
          <p className="text-slate-500 text-sm">
            {searchingRandom ? 'Looking for an available player...' : opponentJoined ? 'Both players ready! Start the battle.' : isPrivateMode ? 'Share the battle code or link with your friend!' : 'Finding a random opponent...'}
          </p>
        </motion.div>

        {isPrivateMode && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-6 mb-6" style={CARD}>
            <p className="text-slate-500 text-sm mb-3 text-center">Battle Code</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl text-[#E84C6A] tracking-[0.2em] font-mono" style={{ fontFamily: 'monospace', fontWeight: 800 }}>{gameState.lobbyInviteCode || '------'}</span>
              <button onClick={copyRoomCode} className="p-3 rounded-xl transition-all" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
                {copied ? <CheckCircle className="w-5 h-5 text-emerald-500"/> : <Copy className="w-5 h-5 text-slate-400"/>}
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={copyRoomLink} className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all mb-3" style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)', color: '#E84C6A' }}>
              <Link2 className="w-4 h-4"/>Copy Room Link
            </motion.button>
            <p className="text-center text-slate-400 text-xs">Share the code or link with your friend to join the battle</p>
          </motion.div>)}

        {searchingRandom && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-8 mb-6 text-center" style={CARD}>
            <div className="relative w-24 h-24 mx-auto mb-4">
              {[0, 1, 2].map(i => (<motion.div key={i} className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(6,182,212,0.2)' }} animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}/>))}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.08)', border: '2px solid rgba(6,182,212,0.15)' }}>
                  <Wifi className="w-7 h-7 text-cyan-500"/>
                </motion.div>
              </div>
            </div>
            <p className="text-cyan-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Searching for players...</p>
            <p className="text-slate-400 text-xs mt-1">If no human found, you'll be matched with AI opponent</p>
          </motion.div>)}

        <div className="grid grid-cols-1 gap-4 mb-6 text-center">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 text-center" style={CARD}>
            <Users className={`w-6 h-6 mx-auto mb-2 ${opponentJoined ? 'text-emerald-500' : 'text-amber-500'}`}/>
            <div className={`text-3xl mb-1 ${opponentJoined ? 'text-emerald-500' : 'text-amber-500'}`} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>{opponentJoined ? '2' : '1'} / 2</div>
            <p className="text-slate-400 text-xs">Players Joined</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-6 mb-6" style={CARD}>
          <div className="flex items-center justify-between mb-4"><h3 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Battle Arena</h3><Swords className="w-5 h-5 text-[#E84C6A]"/></div>
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)' }}>{currentUser.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="text-[#1A1A2E]">{currentUser.username}</p><span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">You</span></div>
                <p className="text-slate-400 text-xs">Ready to battle</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500"/>
            </motion.div>
            <AnimatePresence mode="wait">
              {opponentJoined ? (<motion.div key="opponent" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)' }}>{opponent.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><p className="text-[#1A1A2E]">{opponent.name || opponent.username}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#E84C6A]/5 text-[#E84C6A] border border-[#E84C6A]/15">Challenger</span>
                    </div>
                    <p className="text-slate-400 text-xs">Ready to battle</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500"/>
                </motion.div>) : (<motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.02)' }}><Users className="w-5 h-5 text-slate-300 animate-pulse"/></div>
                  <p className="text-slate-400 text-sm">{searchingRandom ? 'Searching for opponent...' : 'Waiting for opponent to join...'}</p>
                </motion.div>)}
            </AnimatePresence>
          </div>
        </motion.div>

        {isPrivateMode && !opponentJoined && !gameStarting && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSwitchToRandom} className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-3 transition-all" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 4px 20px rgba(220,38,38,0.25)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              <Shuffle className="w-5 h-5"/>Switch to Random Match
            </motion.button>
            <p className="text-center text-slate-400 text-xs mt-2">Tired of waiting? Convert this lobby to public matchmaking.</p>
          </motion.div>)}

        <AnimatePresence>
          {countdown <= 15 && !opponentJoined && !searchingRandom && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertCircle className="w-5 h-5 text-red-500"/><div className="flex-1"><p className="text-red-600 text-sm">Time is running out! Battle will auto-return to mode selection.</p></div>
            </motion.div>)}
        </AnimatePresence>

        <AnimatePresence>
          {gameStarting && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-6 mb-6 text-center" style={{ background: 'rgba(232,76,106,0.06)', border: '1px solid rgba(232,76,106,0.12)' }}>
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="text-4xl mb-3">⚔️</motion.div>
              <p className="text-[#E84C6A] text-sm" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Battle Starting...</p>
            </motion.div>)}
        </AnimatePresence>

        {!gameStarting && (<div className="flex gap-4">
            <motion.button whileHover={{ scale: canStart ? 1.02 : 1 }} whileTap={{ scale: canStart ? 0.98 : 1 }} onClick={handleStart} disabled={!canStart} className={`flex-1 py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all ${canStart ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`} style={{ background: canStart ? 'linear-gradient(135deg, #E84C6A, #D43B59)' : 'rgba(0,0,0,0.06)', boxShadow: canStart ? '0 4px 20px rgba(232,76,106,0.3)' : 'none', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
              <Play className="w-5 h-5"/>{canStart ? 'Start Battle' : 'Waiting for Opponent'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCancel} className="py-4 rounded-xl text-slate-500 transition-all px-8" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Cancel</motion.button>
          </div>)}
        <p className="text-center text-slate-400 text-sm mt-4">
          {gameStarting ? 'Preparing the arena...' : opponentJoined ? 'Both players ready! Click "Start Battle" to begin.' : searchingRandom ? 'Searching for an available player...' : 'Waiting for your friend to join...'}
        </p>
      </div>

      <AnimatePresence>
        {showSwitchConfirm && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSwitchConfirm(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="rounded-2xl p-6 shadow-2xl" style={MODAL_BG}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.08)' }}><Shuffle className="w-5 h-5 text-red-500"/></div>
                  <h2 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>Switch to Random?</h2>
                </div>
                <p className="text-slate-600 mb-6 text-sm">This will convert your private lobby into a public matchmaking queue. Your room code will no longer be valid for your friend to join.</p>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowSwitchConfirm(false)} className="flex-1 py-3 rounded-xl text-[#1A1A2E] transition-all" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Keep Waiting</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmSwitchToRandom} className="flex-1 py-3 rounded-xl text-white transition-all" style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', boxShadow: '0 2px 15px rgba(220,38,38,0.25)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Switch to Random</motion.button>
                </div>
              </div>
            </motion.div>
          </>)}
      </AnimatePresence>
    </div>);
}
