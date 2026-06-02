import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, CheckCircle, UserPlus, Play, Loader2, Check } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ReturnButton } from '../components/ui/ReturnButton';
import { loadSystemConfig } from '../data/systemConfig';
import { useTranslation } from '../hooks/useTranslation';

const LIGHT_BG = 'var(--grad-surface)';

export default function SmallRoomLobbyPage() {
    const { gameState, joinSmallRoom, startSmallRoomGame, resetGame } = useGame();
    const { currentUser } = useAuth();
    const { t } = useTranslation();
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
                setJoinError(err?.response?.data?.message || t('invalidInviteCode'));
                setTimeout(() => navigate('/mode-select'), 2500);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { if (!gameState || (gameState.mode !== 'Room' && gameState.mode !== 'battle')) {
        if (joining) return; // still joining, don't redirect yet
        navigate('/mode-select');
        return;
    } if (!currentUser) {
        navigate('/auth');
        return;
    } }, [gameState, currentUser, navigate, joining]);

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

    return (<div className="min-h-screen px-4 py-10" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      <div className="fixed z-40" style={{ top: 'calc(1.5rem + var(--safe-area-top))', left: 'calc(1.5rem + var(--safe-area-left))' }}>
          <ReturnButton context="lobby"/>
      </div>
      
      <AnimatePresence>
        {joining && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-[#FACC15] animate-spin mx-auto mb-4" strokeWidth={3} />
              <p className="text-[#1A1A2E] font-black uppercase tracking-widest">{t('joiningRoom')}</p>
            </div>
          </motion.div>
        )}

        {joinError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[101] w-full max-w-sm px-4"
          >
            <div className="bg-red-50 border-3 border-black text-red-600 px-6 py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="font-black uppercase tracking-tight">{joinError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.1]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.2), transparent)', filter: 'blur(100px)' }}/>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.1]" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent)', filter: 'blur(100px)' }}/>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-block px-6 py-2 rounded-full mb-4 border-3 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-black font-black uppercase tracking-widest text-sm">🏆 {t('inviteRoomLobby')}</span>
          </div>
          <h1 className="text-black mb-2 uppercase" style={{ fontFamily: 'var(--font-family-heading)', fontWeight: 700, fontSize: '3rem' }}>
            {thresholdMet ? t('readyToStart') : t('waitingForOpponent')}
          </h1>
          <p className="text-slate-600 font-bold uppercase tracking-tight">
            {isHost 
                ? thresholdMet 
                    ? t('readyToPlay')
                    : t('needMorePlayers').replace('{min}', minPlayers).replace('{count}', minPlayers - playerCount)
                : t('waitingForHostStart')}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[2.5rem] p-8 mb-8 bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 text-center">{t('shareCodeWithFriends')}</p>
          <div className="flex items-center justify-center gap-6 mb-6">
            <span className="text-6xl text-black tracking-[0.2em] font-mono" style={{ fontFamily: 'var(--font-family-heading)', fontWeight: 800 }}>{gameState.lobbyInviteCode || '------'}</span>
            <button onClick={copyRoomCode} className="p-4 rounded-2xl transition-all border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              {copied ? <Check className="w-8 h-8 text-emerald-500" strokeWidth={4}/> : <Copy className="w-8 h-8 text-black" strokeWidth={4}/>}
            </button>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase text-center tracking-tight">{t('friendsJoinDesc')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-[2rem] p-6 flex items-center justify-between bg-white border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#6366F1] flex items-center justify-center border-3 border-black">
                        <Users className="w-8 h-8 text-white" strokeWidth={3}/>
                    </div>
                    <div className="text-left">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{t('playersJoined')}</p>
                        <div className="text-3xl font-black text-black" style={{ fontFamily: 'inherit' }}>{playerCount} / {maxPlayers}</div>
                    </div>
                </div>
            </motion.div>
            
            {!thresholdMet && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-[2rem] p-6 flex items-center justify-between bg-amber-50 border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center border-3 border-black">
                            <UserPlus className="w-8 h-8 text-black" strokeWidth={3}/>
                        </div>
                        <div className="text-left">
                            <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest">{t('readyToStart')}</p>
                            <div className="text-2xl font-black text-black" style={{ fontFamily: 'inherit' }}>{minPlayers - playerCount} MORE</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[3rem] p-10 mb-10 bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-family-heading)' }}>{t('playersInLobby')}</h3>
            <div className="px-5 py-2 rounded-full bg-black text-[#FACC15] font-black text-xl">
                {playerCount} / {maxPlayers}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {lobbyPlayers.map((player, index) => (<motion.div key={player.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1, type: 'spring' }} className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-50 border-3 border-black">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">{player.avatar}</div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black uppercase truncate max-w-[120px]">{player.username || player.name}</p>
                    </div>
                    <div className="flex gap-2">
                        {player.id === currentUser.id && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-black font-black border-2 border-black uppercase">{t('you')}</span>}
                        {player.host && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-black border-2 border-black uppercase">{t('host')}</span>}
                    </div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-emerald-500" strokeWidth={3}/>
                </motion.div>))}
            </AnimatePresence>
            {Array.from({ length: maxPlayers - playerCount }).map((_, i) => (<motion.div key={`empty-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (playerCount + i) * 0.1 }} className="flex items-center gap-5 p-5 rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50/50">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white border-3 border-black opacity-20"><UserPlus className="w-8 h-8 text-black"/></div>
                <p className="text-slate-300 font-black uppercase tracking-widest text-sm">{t('waitingForPlayer')}</p>
              </motion.div>))}
          </div>
        </motion.div>

        <div className="flex gap-4">
          {isHost && (
              <motion.button 
                whileHover={{ scale: canStart ? 1.05 : 1, rotate: canStart ? 1 : 0 }} 
                whileTap={{ scale: canStart ? 0.95 : 1 }} 
                onClick={handleStart} 
                disabled={!canStart} 
                className={`flex-[2] py-6 rounded-[2.5rem] font-black text-3xl uppercase tracking-widest transition-all border-4 border-black flex items-center justify-center gap-4 ${canStart ? 'bg-[#FACC15] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black' : 'bg-slate-100 text-slate-400 opacity-50'}`}
              >
                <Play className="w-10 h-10" fill="currentColor"/>
                <span>{canStart ? t('startGame') : (minPlayers - playerCount === 1 ? t('needMorePlayerBtn').replace('{count}', 1) : t('needMorePlayersBtn').replace('{count}', minPlayers - playerCount))}</span>
              </motion.button>
          )}
          <motion.button 
            whileHover={{ scale: 1.05, rotate: -1 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={handleLeave} 
            className="flex-1 py-6 rounded-[2.5rem] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black font-black text-xl uppercase tracking-widest transition-all px-8"
          >
            {t('leaveLobby')}
          </motion.button>
        </div>
        {!isHost && <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-sm mt-6">{t('waitingForHostStart')}</p>}
      </div>
    </div>);
}
