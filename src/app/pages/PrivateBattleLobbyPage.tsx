import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, CheckCircle, Clock, AlertCircle, Play, Swords, Shuffle, Link2, Wifi } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { SIMULATED_OPPONENTS } from '../data/mockData';
import { ReturnButton } from '../components/ui/ReturnButton';

export default function PrivateBattleLobbyPage() {
  const { gameState, resetGame, switchToRandom, startBattle } = useGame();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [simulatedOpponent, setSimulatedOpponent] = useState<{ username: string; avatar: string; isSystem?: boolean } | null>(null);
  const [gameStarting, setGameStarting] = useState(false);
  const [switchedToRandom, setSwitchedToRandom] = useState(false);
  const [searchingRandom, setSearchingRandom] = useState(false);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!gameState || gameState.mode !== '1v1') {
      navigate('/mode-select');
      return;
    }
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    // If this is already a ranked match (from Random Match), start searching immediately
    if (gameState.is_ranked && !gameState.isPrivate) {
      setSwitchedToRandom(true);
      setSearchingRandom(true);
    }
  }, [gameState?.mode, currentUser, navigate]);

  // Countdown timer (60 minutes for private, shorter for random)
  useEffect(() => {
    if (gameStarting || opponentJoined) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          resetGame();
          navigate('/mode-select', { state: { preMode: '1v1' } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate, resetGame, gameStarting, opponentJoined]);

  // Simulate opponent joining for PRIVATE lobby (60% chance between 5-25s)
  useEffect(() => {
    if (switchedToRandom || searchingRandom) return; // Don't simulate if switched
    if (!gameState?.isPrivate) return;
    
    if (Math.random() > 0.35) {
      const joinTime = 5000 + Math.random() * 20000;
      const timeout = setTimeout(() => {
        const opponent = SIMULATED_OPPONENTS[Math.floor(Math.random() * SIMULATED_OPPONENTS.length)];
        setSimulatedOpponent({ username: opponent.username, avatar: opponent.avatar });
        setOpponentJoined(true);
      }, joinTime);
      return () => clearTimeout(timeout);
    }
  }, [gameState?.isPrivate, switchedToRandom, searchingRandom]);

  // Handle random matchmaking search
  useEffect(() => {
    if (!searchingRandom) return;
    
    // Simulate searching: find human (70%) or AI (30%) within 3-8 seconds
    const searchTime = 3000 + Math.random() * 5000;
    searchTimerRef.current = setTimeout(() => {
      const isHuman = Math.random() > 0.3;
      const opponentPool = [...SIMULATED_OPPONENTS].sort(() => Math.random() - 0.5);
      const opponent = opponentPool[0];
      
      if (isHuman) {
        setSimulatedOpponent({ username: opponent.username, avatar: opponent.avatar });
      } else {
        // System Random (AI opponent)
        setSimulatedOpponent({ username: 'System Random', avatar: '🤖', isSystem: true });
      }
      setOpponentJoined(true);
      setSearchingRandom(false);
    }, searchTime);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchingRandom]);

  const copyRoomCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/battle-lobby?code=${gameState?.roomCode}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchToRandom = () => {
    setShowSwitchConfirm(true);
  };

  const confirmSwitchToRandom = () => {
    setShowSwitchConfirm(false);
    setSwitchedToRandom(true);
    setSearchingRandom(true);
    switchToRandom();
    setCountdown(30); // Reset to short search window
  };

  const handleStart = () => {
    if (!opponentJoined || !gameState) return;
    setGameStarting(true);
    setTimeout(() => navigate('/game'), 1500);
  };

  const handleCancel = () => {
    resetGame();
    navigate('/mode-select', { state: { preMode: '1v1' } });
  };

  if (!gameState || !currentUser) return null;

  const isPrivateMode = gameState.isPrivate && !switchedToRandom;
  const canStart = opponentJoined;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-screen px-4 py-10"
      style={{ background: 'linear-gradient(145deg, #0a0e27 0%, #131842 40%, #1a1145 70%, #0f172a 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      
      {/* Return Button */}
      <div className="fixed top-6 left-6 z-50">
        <ReturnButton context="lobby" />
      </div>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(100px)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto pt-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full mb-4"
            style={{ background: switchedToRandom ? 'rgba(6,182,212,0.12)' : 'rgba(139, 92, 246, 0.12)', border: `1px solid ${switchedToRandom ? 'rgba(6,182,212,0.25)' : 'rgba(139, 92, 246, 0.25)'}` }}>
            <span className={switchedToRandom ? 'text-cyan-400 text-sm' : 'text-violet-400 text-sm'}>
              {switchedToRandom ? '🔄 Random Matchmaking' : '⚔️ Private 1v1 Battle'}
            </span>
          </div>
          <h1 className="text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2rem' }}>
            {searchingRandom ? 'Searching for Opponent...' : opponentJoined ? 'Opponent Found!' : 'Waiting for Opponent'}
          </h1>
          <p className="text-slate-400 text-sm">
            {searchingRandom
              ? 'Looking for an available player...'
              : opponentJoined
                ? 'Both players ready! Start the battle.'
                : isPrivateMode
                  ? 'Share the battle code or link with your friend!'
                  : 'Finding a random opponent...'}
          </p>
        </motion.div>

        {/* Battle Code Card - Only for private mode */}
        {isPrivateMode && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-slate-400 text-sm mb-3 text-center">Battle Code</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl text-white tracking-[0.2em]" 
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
                {gameState.roomCode}
              </span>
              <button onClick={copyRoomCode} 
                className="p-3 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
            
            {/* Copy Link Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyRoomLink}
              className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all mb-3"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
              <Link2 className="w-4 h-4" />
              Copy Room Link
            </motion.button>
            
            <p className="text-center text-slate-500 text-xs">
              Share the code or link with your friend to join the battle
            </p>
          </motion.div>
        )}

        {/* Random Search Animation - for random mode */}
        {searchingRandom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 mb-6 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="relative w-24 h-24 mx-auto mb-4">
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid rgba(6,182,212,0.3)' }}
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(6,182,212,0.15)', border: '2px solid rgba(6,182,212,0.3)' }}>
                  <Wifi className="w-7 h-7 text-cyan-400" />
                </motion.div>
              </div>
            </div>
            <p className="text-cyan-300 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              Searching for players...
            </p>
            <p className="text-slate-500 text-xs mt-1">If no human found, you'll be matched with System Random</p>
          </motion.div>
        )}

        {/* Timer & Status */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Clock className={`w-6 h-6 mx-auto mb-2 ${countdown <= 60 ? 'text-red-400' : 'text-violet-400'}`} />
            <div className={`text-3xl mb-1 ${countdown <= 60 ? 'text-red-400' : 'text-white'}`}
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <p className="text-slate-500 text-xs">Time Remaining</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Users className={`w-6 h-6 mx-auto mb-2 ${opponentJoined ? 'text-emerald-400' : 'text-yellow-400'}`} />
            <div className={`text-3xl mb-1 ${opponentJoined ? 'text-emerald-400' : 'text-yellow-400'}`}
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              {opponentJoined ? '2' : '1'} / 2
            </div>
            <p className="text-slate-500 text-xs">Players Joined</p>
          </motion.div>
        </div>

        {/* Players Display */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              Battle Arena
            </h3>
            <Swords className="w-5 h-5 text-violet-400" />
          </div>
          
          <div className="space-y-3">
            {/* Host (You) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white">{currentUser.username}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    You (Host)
                  </span>
                </div>
                <p className="text-slate-500 text-xs">Ready to battle</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </motion.div>

            {/* Opponent */}
            <AnimatePresence mode="wait">
              {opponentJoined && simulatedOpponent ? (
                <motion.div
                  key="opponent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {simulatedOpponent.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white">{simulatedOpponent.username}</p>
                      {simulatedOpponent.isSystem ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          AI Opponent
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          Challenger
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs">Ready to battle</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <Users className="w-5 h-5 text-slate-600 animate-pulse" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    {searchingRandom ? 'Searching for opponent...' : 'Waiting for opponent to join...'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Switch to Random Button - Prominent, Crimson styled */}
        {isPrivateMode && !opponentJoined && !gameStarting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSwitchToRandom}
              className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-3 transition-all"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                boxShadow: '0 4px 20px rgba(220,38,38,0.35)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
              }}>
              <Shuffle className="w-5 h-5" />
              Switch to Random Match
            </motion.button>
            <p className="text-center text-slate-500 text-xs mt-2">
              Tired of waiting? Convert this lobby to public matchmaking.
            </p>
          </motion.div>
        )}

        {/* Low Timer Warning */}
        <AnimatePresence>
          {countdown <= 60 && !opponentJoined && !searchingRandom && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl p-4 mb-6 flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="flex-1">
                <p className="text-red-400 text-sm">Time is running out! Battle will auto-return to mode selection.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Starting Animation */}
        <AnimatePresence>
          {gameStarting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl p-6 mb-6 text-center"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-4xl mb-3">⚔️</motion.div>
              <p className="text-indigo-300 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                Battle Starting...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {!gameStarting && (
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: canStart ? 1.02 : 1 }}
              whileTap={{ scale: canStart ? 0.98 : 1 }}
              onClick={handleStart}
              disabled={!canStart}
              className={`flex-1 py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all ${
                canStart ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
              style={{
                background: canStart ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.05)',
                boxShadow: canStart ? '0 4px 20px rgba(139,92,246,0.4)' : 'none',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
              }}>
              <Play className="w-5 h-5" />
              {canStart ? 'Start Battle' : 'Waiting for Opponent'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className="py-4 rounded-xl text-slate-400 transition-all px-8"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
              }}>
              Cancel
            </motion.button>
          </div>
        )}

        <p className="text-center text-slate-500 text-sm mt-4">
          {gameStarting
            ? 'Preparing the arena...'
            : opponentJoined 
              ? 'Both players ready! Click "Start Battle" to begin.' 
              : searchingRandom
                ? 'Searching for an available player...'
                : 'Waiting for your friend to join...'}
        </p>
      </div>

      {/* Switch to Random Confirmation Modal */}
      <AnimatePresence>
        {showSwitchConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSwitchConfirm(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="rounded-2xl p-6 shadow-2xl"
                style={{ background: 'linear-gradient(145deg, #131842, #1a1145)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(220,38,38,0.15)' }}>
                    <Shuffle className="w-5 h-5 text-red-400" />
                  </div>
                  <h2 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>
                    Switch to Random?
                  </h2>
                </div>
                <p className="text-slate-300 mb-6 text-sm">
                  This will convert your private lobby into a public matchmaking queue. Your room code will no longer be valid for your friend to join. The system will find the next available player.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSwitchConfirm(false)}
                    className="flex-1 py-3 rounded-xl text-slate-300 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                    }}>
                    Keep Waiting
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmSwitchToRandom}
                    className="flex-1 py-3 rounded-xl text-white transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                      boxShadow: '0 2px 15px rgba(220,38,38,0.3)',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                    }}>
                    Switch to Random
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}