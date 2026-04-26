import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CheckCircle, Wifi, Bot, Copy, Check } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { ReturnButton } from '../components/ui/ReturnButton';

const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';
const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };

export default function MatchmakingPage() {
    const { gameState, startBattle } = useGame();
    const { currentUser } = useAuth();
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
            const t = setTimeout(() => { setStage('ready'); setCountdown(3); }, 1500);
            return () => clearTimeout(t);
        }
    }, [gameState?.status]);

    useEffect(() => {
        if (!gameState || gameState.status === 'active') return;

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
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
            <div className="fixed z-40" style={{ top: 'calc(1.5rem + var(--safe-area-top))', left: 'calc(1.5rem + var(--safe-area-left))' }}>
                <ReturnButton context="matchmaking"/>
            </div>
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.25]" style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(120px)' }}/>
            </div>

            <div className="relative z-10 w-full max-w-md text-center">
                <AnimatePresence mode="wait">
                    {(stage === 'searching' || stage === 'filling') && (
                        <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="relative w-32 h-32 mx-auto mb-8">
                                {[0, 1, 2].map(i => (
                                    <motion.div key={i} className="absolute inset-0 rounded-full" style={{ border: `2px solid ${isRanked1v1 ? 'rgba(6,182,212,0.2)' : 'rgba(232,76,106,0.2)'}` }} animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}/>
                                ))}
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

                            {isRandomRoom && (
                                <div className="rounded-2xl p-6 mb-4" style={CARD}>
                                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-3">
                                        <Users className="w-4 h-4"/>{joinedPlayers} / {totalPlayersInRoom} players joined
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                        {Array.from({ length: totalPlayersInRoom }, (_, i) => (
                                            <motion.div key={i} className={`w-4 h-4 rounded-full ${i < joinedPlayers ? 'bg-emerald-400' : 'bg-slate-200'}`} animate={i < joinedPlayers ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}/>
                                        ))}
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {gameState.lobbyPlayers?.slice(0, joinedPlayers).map((player) => (
                                            <motion.div key={player.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="flex items-center gap-2 justify-center text-sm">
                                                <span className="text-lg">{player.avatar}</span>
                                                <span className={player.id === currentUser.id ? 'text-[#E84C6A]' : 'text-[#1A1A2E]'}>
                                                    {player.id === currentUser.id ? 'You' : (player.username || player.name)}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {gameState.isHost && joinedPlayers >= 2 && joinedPlayers < totalPlayersInRoom && (
                                        <motion.button 
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            onClick={startBattle} 
                                            className="mt-4 w-full py-2.5 rounded-xl text-white text-sm transition-all" 
                                            style={{ background: 'linear-gradient(135deg, #E84C6A, #D43B59)', boxShadow: '0 4px 15px rgba(232,76,106,0.25)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
                                        >
                                            Start Early ({joinedPlayers} Players)
                                        </motion.button>
                                    )}

                                    {/* Invite Code Card */}
                                    {gameState.lobbyInviteCode && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="mt-4 rounded-xl p-3"
                                            style={{ background: 'rgba(232,76,106,0.06)', border: '1px dashed rgba(232,76,106,0.3)' }}
                                        >
                                            <p className="text-xs text-slate-400 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>Invite friends with code</p>
                                            <div className="flex items-center justify-center gap-3">
                                                <span
                                                    className="tracking-[0.3em] text-[#E84C6A] font-mono"
                                                    style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.3em' }}
                                                >
                                                    {gameState.lobbyInviteCode}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.88 }}
                                                    onClick={copyCode}
                                                    className="p-2 rounded-lg transition-all"
                                                    style={{
                                                        background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(232,76,106,0.10)',
                                                        border: copied ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(232,76,106,0.2)',
                                                        color: copied ? '#34d399' : '#E84C6A',
                                                    }}
                                                    title="Copy code"
                                                >
                                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </motion.button>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>Friends can join from Mode Select → Room → Join</p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {isRanked1v1 && (
                                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                        <Wifi className="w-4 h-4"/>
                                    </motion.div>
                                    Scanning matchmaking pool...
                                </div>
                            )}
                        </motion.div>
                    )}

                    {stage === 'found' && (
                        <motion.div key="found" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(52,211,153,0.08)', border: '2px solid rgba(52,211,153,0.2)' }}>
                                <CheckCircle className="w-10 h-10 text-emerald-500"/>
                            </motion.div>
                            <h2 className="text-[#1A1A2E] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
                                {gameState.mode === 'Solo' ? 'Game Ready!' : isRandomRoom ? 'Room Ready!' : isRanked1v1 && matchType === 'system' ? 'System Random Matched!' : 'Match Found!'}
                            </h2>
                            {isRanked1v1 && matchType === 'system' && (
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <Bot className="w-4 h-4 text-amber-500"/>
                                    <p className="text-amber-500 text-xs">No human found - matched with AI opponent</p>
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                                {allPlayers.map((p, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center gap-2">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: p.isYou ? '2px solid #E84C6A' : '1px solid rgba(0,0,0,0.06)', boxShadow: p.isYou ? '0 0 20px rgba(232,76,106,0.15)' : '0 2px 8px rgba(0,0,0,0.04)' }}>
                                            {p.avatar}
                                        </div>
                                        <p className="text-sm text-[#1A1A2E]">{p.isYou ? 'YOU' : p.username}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {stage === 'ready' && (
                        <motion.div key="ready" initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.5, repeat: countdown > 0 ? Infinity : 0 }} className="text-[8rem] mx-auto mb-4 flex items-center justify-center" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, color: countdown > 1 ? '#E84C6A' : countdown === 1 ? '#d97706' : '#059669', filter: `drop-shadow(0 0 30px currentColor)` }}>
                                {countdown === 0 ? '🚀' : countdown}
                            </motion.div>
                            <p className="text-slate-500">{countdown === 0 ? 'Starting...' : 'Get Ready!'}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
