import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, CheckCircle, Clock, AlertCircle, Play, Swords, Shuffle, Link2, Wifi, Check } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ReturnButton } from '../components/ui/ReturnButton';
import { loadSystemConfig } from '../data/systemConfig';
import { useTranslation } from '../hooks/useTranslation';

const LIGHT_BG = 'var(--grad-surface)';

export default function PrivateBattleLobbyPage() {
    const { gameState, resetGame, switchToRandom, startBattle, joinBattle } = useGame();
    const { currentUser } = useAuth();
    const { t } = useTranslation();
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
        const queryParams = new URLSearchParams(location.search);
        const urlCode = queryParams.get('code');
        const joinCode = location.state?.joinCode || urlCode;
        
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
                setJoinError(err?.response?.data?.message || t('invalidBattleCode'));
                setTimeout(() => navigate('/mode-select'), 2500);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (joining || joinError) return;
        
        const queryParams = new URLSearchParams(location.search);
        const urlCode = queryParams.get('code');
        const joinCode = location.state?.joinCode || urlCode;

        if (!gameState) {
            if (joinCode) return; // Wait for GameContext to propagate
            navigate('/mode-select');
            return;
        }
        
        // Guard against stale state kicking user out immediately after joining
        if (!joinCode || gameState.lobbyInviteCode === joinCode) {
            if (gameState.mode === 'Room') {
                navigate('/lobby', { replace: true, state: { joinCode: gameState.lobbyInviteCode } });
                return;
            }

            if (gameState.mode !== '1v1' && gameState.mode !== 'battle' && gameState.lobbyInviteCode !== joinCode) {
                navigate('/mode-select');
                return;
            }
        }

        if (!currentUser) {
            navigate('/auth');
            return;
        }
        if (gameState.is_ranked && !gameState.isPrivate) {
            setSwitchedToRandom(true);
            setSearchingRandom(true);
        }
    }, [gameState?.mode, gameState?.lobbyInviteCode, currentUser, navigate, joining, joinError, location.state?.joinCode]);

    useEffect(() => {
        if (gameState?.status === 'active') {
            setGameStarting(true);
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

    if (!gameState || !currentUser) {
        if (joining || joinError) {
            return (
                <div className="min-h-screen px-4 py-10" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
                    <AnimatePresence>
                        {joining && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[#1A1A2E] font-semibold">{t('joiningBattle')}</p>
                                </div>
                            </motion.div>
                        )}
                        {joinError && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="fixed top-20 left-1/2 -translate-x-1/2 z-[101] w-full max-w-sm px-4"
                            >
                                <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                    <p className="font-semibold text-sm">{joinError}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        }
        return null;
    }

    const lobbyPlayers = gameState.lobbyPlayers || [];
    const opponent = lobbyPlayers.find(p => p.id !== currentUser.id);
    const opponentJoined = !!opponent;
    const isPrivateMode = gameState.isPrivate && !switchedToRandom;
    const canStart = gameState.isHost && opponentJoined;

    return (<div className="min-h-screen px-4 py-10" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      <div className="fixed z-40" style={{ top: 'calc(1.5rem + var(--safe-area-top))', left: 'calc(1.5rem + var(--safe-area-left))' }}>
          <ReturnButton context="lobby"/>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.2]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.03), transparent)', filter: 'blur(100px)' }}/>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.15]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05), transparent)', filter: 'blur(100px)' }}/>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full mb-4" style={{ background: switchedToRandom ? 'rgba(6,182,212,0.06)' : 'rgba(250,204,21,0.06)', border: `1px solid ${switchedToRandom ? 'rgba(6,182,212,0.15)' : 'rgba(250,204,21,0.12)'}` }}>
            <span className={switchedToRandom ? 'text-cyan-600 text-sm font-black' : 'text-[#FACC15] text-sm font-black'}>
              {switchedToRandom ? `🔄 ${t('randomMatchmaking')}` : `⚔️ ${t('privateBattle')}`}
            </span>
          </div>
          <h1 className="text-[#1A1A2E] mb-2 uppercase" style={{ fontFamily: 'var(--font-family-heading)', fontWeight: 700, fontSize: '2.5rem' }}>
            {searchingRandom ? t('searchingOpponent') : opponentJoined ? t('matchFound') : t('waitingForOpponent')}
          </h1>
          <p className="text-slate-500 font-medium">
            {searchingRandom ? t('lookingForPlayer') : opponentJoined ? t('bothReadyStart') : isPrivateMode ? t('shareCodeWithFriend') : t('findingRandomOpponent')}
          </p>
        </motion.div>

        {isPrivateMode && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[2.5rem] p-8 mb-6 bg-white border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4 text-center">{t('battleCode')}</p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <span className="text-6xl text-black tracking-[0.2em] font-mono" style={{ fontFamily: 'var(--font-family-heading)', fontWeight: 800 }}>{gameState.lobbyInviteCode || '------'}</span>
              <button onClick={copyRoomCode} className="p-4 rounded-2xl transition-all bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {copied ? <Check className="w-6 h-6 text-emerald-500" strokeWidth={3}/> : <Copy className="w-6 h-6 text-black" strokeWidth={3}/>}
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={copyRoomLink} className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all mb-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" style={{ background: '#FACC15', color: 'black' }}>
              <Link2 className="w-5 h-5" strokeWidth={3}/>{t('copyRoomLink')}
            </motion.button>
            <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('shareCodeDesc')}</p>
          </motion.div>)}

        {searchingRandom && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2.5rem] p-10 mb-6 text-center bg-white border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="relative w-24 h-24 mx-auto mb-6">
              {[0, 1, 2].map(i => (<motion.div key={i} className="absolute inset-0 rounded-full" style={{ border: '3px solid black' }} animate={{ scale: [1, 2.5], opacity: [0.3, 0] }} transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}/>))}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 rounded-full flex items-center justify-center bg-[#FACC15] border-3 border-black">
                  <Wifi className="w-8 h-8 text-black" strokeWidth={3}/>
                </motion.div>
              </div>
            </div>
            <p className="text-black text-xl font-black uppercase" style={{ fontFamily: 'inherit' }}>{t('searchingForPlayers')}</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">{t('aiMatchedDesc')}</p>
          </motion.div>)}

        <div className="grid grid-cols-1 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-6 flex items-center justify-between bg-white border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border-2 border-black">
                    <Users className={`w-6 h-6 ${opponentJoined ? 'text-emerald-500' : 'text-amber-500'}`}/>
                </div>
                <div className="text-left">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('playersJoined')}</p>
                    <div className="text-2xl font-black text-black" style={{ fontFamily: 'inherit' }}>{opponentJoined ? '2' : '1'} / 2</div>
                </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[2.5rem] p-8 mb-8 bg-white border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase" style={{ fontFamily: 'var(--font-family-heading)' }}>{t('battleArena')}</h3>
              <Swords className="w-6 h-6 text-[#FACC15]" strokeWidth={3}/>
          </div>
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-5 p-5 rounded-3xl bg-slate-50 border-3 border-black">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">{currentUser.avatar}</div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                    <p className="text-xl font-black uppercase">{currentUser.username}</p>
                    <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-400 text-black font-black border-2 border-black uppercase">{t('you')}</span>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase">{t('readyToBattle')}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-emerald-500" strokeWidth={3}/>
            </motion.div>

            <AnimatePresence mode="wait">
              {opponentJoined ? (<motion.div key="opponent" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-5 p-5 rounded-3xl bg-slate-50 border-3 border-black">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">{opponent.avatar}</div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                        <p className="text-xl font-black uppercase">{opponent.name || opponent.username}</p>
                        <span className="text-[10px] px-3 py-1 rounded-full bg-amber-400 text-black font-black border-2 border-black uppercase">{t('challenger')}</span>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase">{t('readyToBattle')}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-emerald-500" strokeWidth={3}/>
                </motion.div>) : (<motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-5 p-6 rounded-3xl border-4 border-dashed border-slate-200">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50"><Users className="w-8 h-8 text-slate-300 animate-pulse"/></div>
                  <p className="text-slate-400 text-sm font-black uppercase tracking-widest">{searchingRandom ? t('searchingOpponent') : t('waitingForOpponentJoin')}</p>
                </motion.div>)}
            </AnimatePresence>
          </div>
        </motion.div>

        {isPrivateMode && !opponentJoined && !gameStarting && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
            <motion.button whileHover={{ scale: 1.02, rotate: 1 }} whileTap={{ scale: 0.98 }} onClick={handleSwitchToRandom} className="w-full py-5 rounded-[2rem] text-white flex items-center justify-center gap-3 transition-all border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-red-500" style={{ fontFamily: 'inherit', fontWeight: 800 }}>
              <Shuffle className="w-6 h-6" strokeWidth={3}/>{t('switchToRandomMatch')}
            </motion.button>
            <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-4 leading-relaxed">{t('tiredOfWaiting')}</p>
          </motion.div>)}

        <AnimatePresence>
          {countdown <= 15 && !opponentJoined && !searchingRandom && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl p-4 mb-6 flex items-center gap-3 bg-red-50 border-3 border-black">
              <AlertCircle className="w-6 h-6 text-red-500" strokeWidth={3}/><div className="flex-1 text-left"><p className="text-red-600 text-xs font-black uppercase">{t('timeRunningOut')}</p></div>
            </motion.div>)}
        </AnimatePresence>

        <AnimatePresence>
          {gameStarting && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-[2.5rem] p-8 mb-8 text-center bg-white border-4 border-black shadow-[10px_10px_0px_0px_#FACC15]">
              <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }} transition={{ duration: 1, repeat: Infinity }} className="text-6xl mb-4">⚔️</motion.div>
              <p className="text-black text-2xl font-black uppercase tracking-widest">{t('battleStarting')}</p>
            </motion.div>)}
        </AnimatePresence>

        {!gameStarting && (<div className="flex gap-4">
            <motion.button 
                whileHover={{ scale: canStart ? 1.05 : 1, rotate: canStart ? 1 : 0 }} 
                whileTap={{ scale: canStart ? 0.95 : 1 }} 
                onClick={handleStart} 
                disabled={!canStart} 
                className={`flex-1 py-6 rounded-[2rem] text-black font-black text-2xl uppercase tracking-widest transition-all border-4 border-black flex items-center justify-center gap-3 ${canStart ? 'bg-[#FACC15] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer' : 'bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'}`}
            >
              <Play className="w-8 h-8" fill="currentColor"/>{canStart ? t('startBattle') : t('waitingForOpponent')}
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.05, rotate: -1 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleCancel} 
                className="py-6 rounded-[2rem] text-black font-black text-xl uppercase tracking-widest transition-all px-10 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
                {t('cancel')}
            </motion.button>
          </div>)}
        <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-6 leading-relaxed">
          {gameStarting ? t('preparingArena') : opponentJoined ? t('clickStartToBegin') : searchingRandom ? t('lookingForPlayer') : t('waitingFriendToJoin')}
        </p>
      </div>

      <AnimatePresence>
        {showSwitchConfirm && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSwitchConfirm(false)} className="fixed inset-0 bg-black/40 backdrop-blur-md z-[150]"/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[151] w-full max-w-md px-6">
              <div className="rounded-[3rem] p-10 bg-white border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-red-100 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <Shuffle className="w-8 h-8 text-red-500" strokeWidth={3}/>
                  </div>
                  <h2 className="text-2xl font-black uppercase text-left leading-tight" style={{ fontFamily: 'var(--font-family-heading)' }}>{t('switchToRandomTitle')}</h2>
                </div>
                <p className="text-slate-600 mb-10 text-left font-bold leading-relaxed">{t('switchToRandomDesc')}</p>
                <div className="flex flex-col gap-4">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={confirmSwitchToRandom} className="w-full py-4 rounded-[1.5rem] text-white font-black uppercase tracking-widest transition-all bg-red-500 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{t('switchToRandomMatch')}</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowSwitchConfirm(false)} className="w-full py-4 rounded-[1.5rem] text-black font-black uppercase tracking-widest transition-all bg-slate-100 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{t('keepWaiting')}</motion.button>
                </div>
              </div>
            </motion.div>
          </>)}
      </AnimatePresence>
    </div>);
}
