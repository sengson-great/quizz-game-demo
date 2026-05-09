import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CheckCircle, Wifi, Bot, Copy, Check, Sparkles, Swords, Target, Trophy, Search, Loader2 } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { ReturnButton } from '../components/ui/ReturnButton';

const LIGHT_BG = 'var(--grad-surface)';

export default function MatchmakingPage() {
    const { gameState, startBattle } = useGame();
    const { currentUser } = useAuth();
    const { t, lang } = useTranslation();
    const isKhmer = lang === 'km';
    const navigate = useNavigate();
    const [stage, setStage] = useState('searching');
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [joinedPlayers, setJoinedPlayers] = useState(1);
    const [matchType, setMatchType] = useState(null);

    useEffect(() => { 
        if (!gameState) {
            navigate('/mode-select');
            return;
        } 
        if (!currentUser) {
            navigate('/auth');
            return;
        } 
    }, [gameState, currentUser, navigate]);

    useEffect(() => {
        if (gameState?.status === 'active') {
            setStage('found');
            const t = setTimeout(() => { setStage('ready'); setCountdown(3); }, 2000);
            return () => clearTimeout(t);
        }
    }, [gameState?.status]);

    useEffect(() => {
        if (!gameState || gameState.status === 'active' || gameState.status === 'loading') return;

        if (gameState.mode === 'Room' && !gameState.isPrivate) {
            if (stage !== 'filling') {
                setStage('filling');
            }
            const currentPlayers = gameState.lobbyPlayers?.length || 1;
            setJoinedPlayers(currentPlayers);
        } else if (gameState.mode === '1v1') {
            setStage('searching');
        }
    }, [gameState?.mode, gameState?.isPrivate, gameState?.status, gameState?.lobbyPlayers?.length, stage]);

    useEffect(() => {
        if (stage === 'filling' && gameState?.isHost && !gameState?.isPrivate) {
            const currentPlayers = gameState.lobbyPlayers?.length || 1;
            if (currentPlayers >= (gameState.roomSize || 3)) {
                startBattle();
            }
        }
    }, [stage, gameState?.isHost, gameState?.isPrivate, gameState?.lobbyPlayers?.length, gameState?.roomSize, startBattle]);

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

    const copyCode = () => { 
        const code = gameState?.lobbyInviteCode;
        if (code) {
            navigator.clipboard.writeText(code).catch(() => { });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } 
    };

    if (!gameState || !currentUser)
        return null;

    const isRandomRoom = gameState.mode === 'Room' && !gameState.isPrivate;
    const isRanked1v1 = gameState.mode === '1v1' && gameState.is_ranked;
    const totalPlayersInRoom = gameState.roomSize || 5;
    const opponents = gameState.opponents || [];
    const allPlayers = [
        { username: currentUser.username, avatar: currentUser.avatar, isYou: true }, 
        ...opponents.map(o => ({ username: o.username || o.name || 'Opponent', avatar: o.avatar || '👤', isYou: false }))
    ];

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-x-hidden" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
            
            {/* BACK BUTTON - MOVED TO ABSOLUTE TOP LEVEL */}
            <div className="fixed top-4 left-4 sm:top-8 sm:left-8 z-[200]">
                <ReturnButton context="matchmaking" variant="default" />
            </div>

            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-200/40 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/30 blur-[120px] animate-pulse" style={{ animationDelay: '2.5s' }} />
                
                {/* Dynamic Floating Icons */}
                <motion.div animate={{ y: [0, -30, 0], rotate: [12, -12, 12] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-[20%] left-[15%] text-6xl opacity-10">🎮</motion.div>
                <motion.div animate={{ y: [0, 40, 0], rotate: [-10, 10, -10] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-[25%] right-[20%] text-6xl opacity-10">⚔️</motion.div>
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-[40%] right-[10%] text-8xl opacity-5">🏆</motion.div>
            </div>

            <div className="relative z-10 w-full max-w-2xl">
                <AnimatePresence mode="wait">
                    {(stage === 'searching' || stage === 'filling') && (
                        <motion.div 
                            key="searching" 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, y: -50 }}
                            className="text-center"
                        >
                            {/* SEARCHING ICON SPINNER */}
                            <div className="mb-8 sm:mb-16 relative inline-block">
                                <div className="relative w-36 h-36 sm:w-56 sm:h-56 mx-auto">
                                    {[0, 1, 2].map(i => (
                                        <motion.div 
                                            key={i} 
                                            className="absolute inset-0 rounded-full border-[3px] sm:border-4 border-black" 
                                            animate={{ scale: [1, 2.8], opacity: [0.4, 0] }} 
                                            transition={{ duration: 3, delay: i * 1, repeat: Infinity, ease: "easeOut" }}
                                        />
                                    ))}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div 
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                            className="w-24 h-24 sm:w-40 sm:h-40 rounded-full border-4 sm:border-8 border-dashed border-black flex items-center justify-center bg-white shadow-[6px_6px_0px_0px_#000000] sm:shadow-[12px_12px_0px_0px_#000000]"
                                        >
                                            <div className="rotate-[-360deg]">
                                                {gameState.mode === 'Solo' ? <Target className="w-12 h-12 sm:w-20 sm:h-20 text-emerald-500" strokeWidth={3} /> : gameState.mode === '1v1' ? <Swords className="w-12 h-12 sm:w-20 sm:h-20 text-indigo-500" strokeWidth={3} /> : <Trophy className="w-12 h-12 sm:w-20 sm:h-20 text-amber-500" strokeWidth={3} />}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                                <motion.div 
                                    animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                    className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 w-10 h-10 sm:w-16 sm:h-16 bg-[#FACC15] border-3 sm:border-4 border-black rounded-xl sm:rounded-3xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000]"
                                >
                                    <Search className="w-5 h-5 sm:w-8 sm:h-8 text-black" strokeWidth={3} />
                                </motion.div>
                            </div>

                            {/* TEXT STATUS */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 sm:mb-16 px-2">
                                <h1 className="text-3xl sm:text-6xl font-black text-black mb-4 sm:mb-6 uppercase tracking-tight drop-shadow-[2px_2px_0px_rgba(250,204,21,0.5)] sm:drop-shadow-[4px_4px_0px_rgba(250,204,21,0.5)]" style={{ fontFamily: 'var(--font-family-heading)' }}>
                                    {gameState.mode === 'Solo' ? t('preparingGame') : isRanked1v1 ? t('findingOpponent') : isRandomRoom ? t('fillingRoom') : t('settingUpRoom')}
                                </h1>
                                <div className="inline-flex items-center gap-2 sm:gap-4 bg-white/50 px-4 py-2 sm:px-8 sm:py-3 rounded-full border-3 border-black shadow-[4px_4px_0px_0px_#000000]">
                                    <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin text-black" strokeWidth={3} />
                                    <p className="text-sm sm:text-2xl font-black text-slate-800 uppercase tracking-widest">
                                        {isRanked1v1 ? t('humanSearch') : isRandomRoom ? t('autoFilling') : t('loadingQuestions')}
                                    </p>
                                </div>
                            </motion.div>

                            {/* ROOM STATUS CARD */}
                            {isRandomRoom && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-12 border-4 border-black shadow-[6px_6px_0px_0px_#000000] sm:shadow-[12px_12px_0px_0px_#000000] bg-white text-left relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-6 sm:mb-12">
                                        <div className="flex items-center gap-3 sm:gap-5">
                                            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-[#6366F1] border-3 sm:border-4 border-black shadow-[3px_3px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000] flex items-center justify-center">
                                                <Users className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                                            </div>
                                            <h3 className="text-xl sm:text-4xl font-black uppercase tracking-tight">{t('players')}</h3>
                                        </div>
                                        <div className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-black text-[#FACC15] font-black text-xl sm:text-3xl shadow-[3px_3px_0px_0px_#6366F1] sm:shadow-[4px_4px_0px_0px_#6366F1]">
                                            {joinedPlayers} / {totalPlayersInRoom}
                                        </div>
                                    </div>

                                    {/* PLAYER SLOTS VISUAL */}
                                    <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-12">
                                        {Array.from({ length: totalPlayersInRoom }, (_, i) => (
                                            <motion.div 
                                                key={i} 
                                                className={`aspect-square rounded-xl sm:rounded-[1.5rem] border-3 sm:border-4 ${i < joinedPlayers ? 'bg-emerald-400 border-black shadow-[3px_3px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000]' : 'bg-slate-100 border-slate-300'}`} 
                                                animate={i < joinedPlayers ? { y: [0, -8, 0], rotate: [0, 5, 0] } : {}} 
                                                transition={{ duration: 0.6, delay: i * 0.1, repeat: i < joinedPlayers ? Infinity : 0, repeatDelay: 2 }}
                                            />
                                        ))}
                                    </div>

                                    {/* PLAYER LIST */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-12">
                                        {gameState.lobbyPlayers?.slice(0, joinedPlayers).map((player) => (
                                            <motion.div 
                                                key={player.id} 
                                                initial={{ opacity: 0, scale: 0.8 }} 
                                                animate={{ opacity: 1, scale: 1 }} 
                                                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] bg-slate-50 border-3 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
                                            >
                                                <span className="text-3xl sm:text-4xl drop-shadow-md">{player.avatar}</span>
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-base sm:text-xl font-black uppercase tracking-tight truncate max-w-[120px] ${player.id === currentUser.id ? 'text-[#FACC15] drop-shadow-[1px_1px_0px_#000000]' : 'text-black'}`}>
                                                        {player.id === currentUser.id ? t('youUpper') : (player.username || player.name)}
                                                    </span>
                                                    {player.id === currentUser.id && (
                                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600">Lobby Host</span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* ACTION BUTTONS */}
                                    {gameState.isHost && joinedPlayers >= 2 && joinedPlayers < totalPlayersInRoom && (
                                        <motion.button 
                                            whileHover={{ scale: 1.05, rotate: 1, y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={startBattle} 
                                            className="w-full py-4 sm:py-6 rounded-2xl sm:rounded-[2.5rem] border-3 sm:border-4 border-black shadow-[4px_4px_0px_0px_#000000] sm:shadow-[8px_8px_0px_0px_#000000] text-black font-black text-xl sm:text-3xl uppercase tracking-widest transition-all mb-6 sm:mb-10" 
                                            style={{ background: 'var(--grad-primary)' }}
                                        >
                                            {t('startEarly').replace('{count}', joinedPlayers)}
                                        </motion.button>
                                    )}

                                    {/* INVITE CODE BOX */}
                                    {gameState.lobbyInviteCode && (
                                        <div className="p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] bg-indigo-50 border-3 sm:border-4 border-dashed border-black relative">
                                            <div className="absolute -top-3 left-4 bg-black text-white text-[9px] sm:text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-widest">
                                                {t('inviteFriendsCode')}
                                            </div>
                                            <div className="flex items-center gap-4 sm:gap-6 mt-2">
                                                <div className="flex-1 text-2xl sm:text-5xl font-black tracking-[0.2em] sm:tracking-[0.4em] text-black font-mono">
                                                    {gameState.lobbyInviteCode}
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={copyCode}
                                                    className={`p-3 sm:p-5 rounded-xl sm:rounded-[1.5rem] border-3 sm:border-4 border-black shadow-[3px_3px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000] transition-all ${copied ? 'bg-emerald-400' : 'bg-white'}`}
                                                >
                                                    {copied ? <Check className="w-5 h-5 sm:w-10 sm:h-10 text-black" strokeWidth={4} /> : <Copy className="w-5 h-5 sm:w-10 sm:h-10 text-black" strokeWidth={4} />}
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {isRanked1v1 && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="inline-flex items-center gap-3 sm:gap-6 px-6 py-3 sm:px-12 sm:py-6 rounded-2xl sm:rounded-[2.5rem] bg-white border-3 sm:border-4 border-black shadow-[6px_6px_0px_0px_#000000] sm:shadow-[10px_10px_0px_0px_#000000]"
                                >
                                    <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                                        <Wifi className="w-5 h-5 sm:w-10 sm:h-10 text-indigo-500" strokeWidth={4} />
                                    </motion.div>
                                    <span className="text-sm sm:text-3xl font-black uppercase tracking-widest text-black">{t('scanningPool')}</span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {stage === 'found' && (
                        <motion.div 
                            key="found" 
                            initial={{ opacity: 0, y: 100 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 1.5 }}
                            className="text-center"
                        >
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }} 
                                animate={{ scale: 1, rotate: 0 }} 
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }} 
                                className="w-24 h-24 sm:w-40 sm:h-40 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-12 bg-emerald-400 border-4 sm:border-8 border-black shadow-[6px_6px_0px_0px_#000000] sm:shadow-[15px_15px_0px_0px_#000000]"
                            >
                                <CheckCircle className="w-14 h-14 sm:w-24 sm:h-24 text-black" strokeWidth={4}/>
                            </motion.div>

                            <motion.h2 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className={`${isKhmer ? 'text-3xl sm:text-6xl leading-tight' : 'text-4xl sm:text-8xl leading-none'} font-black text-black mb-4 sm:mb-8 tracking-tighter uppercase drop-shadow-[3px_3px_0px_#FACC15] sm:drop-shadow-[6px_6px_0px_#FACC15]`}
                                style={{ fontFamily: 'var(--font-family-heading)' }}
                            >
                                {gameState.mode === 'Solo' ? t('gameReady') : isRandomRoom ? t('roomReady') : isRanked1v1 && matchType === 'system' ? t('systemMatched') : t('matchFound')}
                            </motion.h2>

                            {isRanked1v1 && matchType === 'system' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-16 bg-amber-100 py-2 sm:py-4 px-5 sm:px-10 rounded-xl sm:rounded-[2rem] border-3 sm:border-4 border-black shadow-[3px_3px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000] inline-flex mx-auto"
                                >
                                    <Bot className="w-5 h-5 sm:w-8 sm:h-8 text-black" strokeWidth={3}/>
                                    <p className="text-sm sm:text-2xl font-black uppercase tracking-tight">{t('aiOpponent')}</p>
                                </motion.div>
                            )}

                            <div className="flex items-center justify-center gap-6 sm:gap-20 mt-10 sm:mt-24">
                                {allPlayers.map((p, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: i === 0 ? -100 : 100, rotate: i === 0 ? -15 : 15 }} 
                                        animate={{ opacity: 1, x: 0, rotate: 0 }} 
                                        transition={{ delay: 0.6 + i * 0.3, type: 'spring', bounce: 0.5 }} 
                                        className="flex flex-col items-center gap-4 sm:gap-8 group"
                                    >
                                        <div className="relative">
                                            {p.isYou && (
                                                <motion.div 
                                                    animate={{ scale: [1, 1.3, 1], rotate: 360 }}
                                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                    className="absolute -inset-5 sm:-inset-10 rounded-full border-4 sm:border-6 border-dotted border-[#FACC15]"
                                                />
                                            )}
                                            <div 
                                                className={`w-24 h-24 sm:w-48 sm:h-48 rounded-2xl sm:rounded-[3rem] flex items-center justify-center text-4xl sm:text-[7rem] relative z-10 transition-transform group-hover:scale-110 duration-300 ${p.isYou ? 'bg-white border-4 sm:border-[10px] border-[#FACC15] shadow-[6px_6px_0px_0px_#000000] sm:shadow-[20px_20px_0px_0px_#000000]' : 'bg-white border-3 sm:border-6 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]'}`}
                                            >
                                                {p.avatar}
                                                {p.isYou && (
                                                    <motion.div 
                                                        animate={{ y: [-10, 0, -10] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="absolute -top-4 -right-4 sm:-top-8 sm:-right-8 w-8 h-8 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl bg-[#FACC15] flex items-center justify-center border-3 sm:border-4 border-black shadow-[3px_3px_0px_0px_#000000] sm:shadow-[6px_6px_0px_0px_#000000]"
                                                    >
                                                        <Sparkles className="w-5 h-5 sm:w-10 sm:h-10 text-black fill-black" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-4 py-1.5 sm:px-8 sm:py-3 rounded-full bg-white border-3 sm:border-4 border-black shadow-[3px_3px_0px_0px_#000000] sm:shadow-[4px_4px_0px_0px_#000000]">
                                            <p className={`text-xs sm:text-3xl font-black uppercase tracking-widest ${p.isYou ? 'text-[#FACC15] drop-shadow-[1px_1px_0px_#000000]' : 'text-black'}`}>
                                                {p.isYou ? t('youUpper') : p.username}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {stage === 'ready' && (
                        <motion.div 
                            key="ready" 
                            initial={{ opacity: 0, scale: 0.1 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 5, rotate: 360 }}
                            className="text-center"
                        >
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.25, 1],
                                    rotate: [-8, 8, -8]
                                }} 
                                transition={{ duration: 0.5, repeat: Infinity }} 
                                className="text-[10rem] sm:text-[25rem] font-black leading-none mb-6 sm:mb-12 drop-shadow-[10px_10px_0px_#000000] sm:drop-shadow-[20px_20px_0px_#000000]"
                                style={{ 
                                    fontFamily: 'var(--font-family-heading)',
                                    color: '#FACC15',
                                    WebkitTextStroke: '6px black'
                                }}
                            >
                                {countdown === 0 ? '🚀' : countdown}
                            </motion.div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                                className="inline-block px-6 py-2 sm:px-12 sm:py-4 rounded-full bg-black border-3 sm:border-4 border-[#FACC15] shadow-[4px_4px_0px_0px_rgba(250,204,21,0.5)] sm:shadow-[8px_8px_0px_0px_rgba(250,204,21,0.5)]"
                            >
                                <p className="text-2xl sm:text-6xl font-black text-white uppercase tracking-[0.1em] sm:tracking-[0.3em]" style={{ fontFamily: 'var(--font-family-heading)' }}>
                                    {countdown === 0 ? t('starting') : t('getReady')}
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
