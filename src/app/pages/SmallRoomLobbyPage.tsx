import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, CheckCircle, Clock, Send, UserPlus, AlertCircle, Play, Bot } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { SIMULATED_OPPONENTS } from '../data/mockData';
import { ReturnButton } from '../components/ui/ReturnButton';

export default function SmallRoomLobbyPage() {
  const { gameState, joinSmallRoom, startSmallRoomGame, extendLobbyTimer, resetGame, addAIPlayers } = useGame();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds for invite rooms

  useEffect(() => {
    if (!gameState || gameState.mode !== 'Room') {
      navigate('/mode-select');
      return;
    }
    if (!currentUser) {
      navigate('/auth');
      return;
    }
  }, [gameState, currentUser, navigate]);

  // Countdown timer
  useEffect(() => {
    if (!gameState || gameState.lobbyStatus !== 'waiting') return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Simulate players joining over time
  useEffect(() => {
    if (!gameState || !gameState.isHost) return;
    const currentCount = gameState.lobbyPlayers?.length || 0;
    if (currentCount >= 5) return;
    
    const joinTimes = [4000, 10000, 18000, 28000]; // Simulated join times (within 60s window)
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    joinTimes.forEach((time, index) => {
      if (index >= (5 - currentCount)) return; // Don't exceed max
      if (Math.random() > 0.35) { // 65% chance each player joins
        const t = setTimeout(() => {
          addAIPlayers(1); // Use addAIPlayers to add one simulated player at a time
        }, time);
        timeouts.push(t);
      }
    });

    return () => timeouts.forEach(clearTimeout);
  }, [gameState?.isHost]);

  // Navigate to game when started
  useEffect(() => {
    if (gameState?.lobbyStatus === 'ready' && gameState?.status === 'active') {
      setTimeout(() => navigate('/game'), 1500);
    }
  }, [gameState, navigate]);

  const copyRoomCode = () => {
    if (gameState?.roomCode) {
      navigator.clipboard.writeText(gameState.roomCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sendInvite = () => {
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
  };

  const handleStart = () => {
    if (!gameState?.isHost) return;
    if ((gameState.lobbyPlayers?.length || 0) < 3) return; // Need at least 3 players
    startSmallRoomGame();
  };

  const handleExtendTimer = () => {
    extendLobbyTimer();
    setCountdown(60);
  };

  const handleLeave = () => {
    resetGame();
    navigate('/mode-select');
  };

  const handleFillWithAI = () => {
    const currentCount = gameState?.lobbyPlayers?.length || 0;
    const spotsRemaining = 5 - currentCount;
    if (spotsRemaining <= 0) return;
    // Fill enough to reach at least 3
    const needed = Math.max(3 - currentCount, 0);
    addAIPlayers(Math.max(needed, 1));
  };

  if (!gameState || !currentUser) return null;

  const isHost = gameState.isHost;
  const playerCount = gameState.lobbyPlayers?.length || 0;
  const maxPlayers = 5;
  const minPlayers = 3;
  const canStart = isHost && playerCount >= minPlayers;
  const thresholdMet = playerCount >= minPlayers;
  const isExpired = countdown === 0 && playerCount < minPlayers;
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="min-h-screen px-4 py-10"
      style={{ background: 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)', fontFamily: 'Poppins, Inter, sans-serif' }}>
      
      {/* Return Button */}
      <div className="fixed top-6 left-6 z-50">
        <ReturnButton context="lobby" />
      </div>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(100px)' }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto pt-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-block px-4 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <span className="text-purple-400 text-sm">🏆 Invite Room Lobby</span>
          </div>
          <h1 className="text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2rem' }}>
            {thresholdMet ? 'Ready to Start!' : 'Waiting for Players'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isHost
              ? thresholdMet
                ? `${playerCount} players joined. You can start now or wait for more!`
                : `Need at least ${minPlayers} players to start (${minPlayers - playerCount} more needed)`
              : 'Waiting for the host to start...'}
          </p>
        </motion.div>

        {/* Room Code Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-gray-400 text-sm mb-3 text-center">Share this code with friends</p>
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
                <Copy className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Invite Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={sendInvite}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
            style={{ 
              background: inviteSent ? 'rgba(52,211,153,0.15)' : 'rgba(139,92,246,0.15)', 
              border: `1px solid ${inviteSent ? 'rgba(52,211,153,0.3)' : 'rgba(139,92,246,0.3)'}`,
              color: inviteSent ? '#34d399' : '#a78bfa'
            }}>
            {inviteSent ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Invite Sent!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Invite Friends
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Timer & Player Count */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Clock className={`w-6 h-6 mx-auto mb-2 ${countdown <= 60 ? 'text-red-400' : 'text-indigo-400'}`} />
            <div className={`text-3xl mb-1 ${countdown <= 60 ? 'text-red-400' : 'text-white'}`}
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <p className="text-gray-400 text-xs">Time Remaining</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Users className={`w-6 h-6 mx-auto mb-2 ${thresholdMet ? 'text-emerald-400' : 'text-yellow-400'}`} />
            <div className={`text-3xl mb-1 ${thresholdMet ? 'text-emerald-400' : 'text-yellow-400'}`}
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              {playerCount} / {maxPlayers}
            </div>
            <p className="text-gray-400 text-xs">
              {thresholdMet ? 'Ready to start!' : `Need ${minPlayers - playerCount} more`}
            </p>
          </motion.div>
        </div>

        {/* Player List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
              Players in Lobby
            </h3>
            <span className="text-gray-400 text-sm">{playerCount} / {maxPlayers}</span>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence>
              {gameState.lobbyPlayers?.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {player.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white">{player.username}</p>
                      {player.id === currentUser.id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          You
                        </span>
                      )}
                      {isHost && player.id === currentUser.id && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Host
                        </span>
                      )}
                      {player.isBot && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          Bot
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs">
                      {player.joinType === 'Code' ? 'Joined via code' : player.joinType === 'Link' ? 'Joined via link' : 'Ready to play'}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty slots (dynamic up to 5) */}
            {Array.from({ length: maxPlayers - playerCount }).map((_, i) => (
              <motion.div
                key={`empty-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (playerCount + i) * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-700/50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800/30">
                  <UserPlus className="w-5 h-5 text-gray-600" />
                </div>
                <p className="text-gray-600 text-sm">Waiting for player...</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Expired Warning */}
        <AnimatePresence>
          {isExpired && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl p-4 mb-6 flex items-center gap-3"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="flex-1">
                <p className="text-red-400 text-sm">Timer expired! Not enough players to start.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          {isHost && !isExpired && (
            <>
              {/* Start Game Button - with glow when threshold met */}
              <motion.button
                whileHover={{ scale: canStart ? 1.02 : 1 }}
                whileTap={{ scale: canStart ? 0.98 : 1 }}
                onClick={handleStart}
                disabled={!canStart}
                className={`flex-1 py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all relative overflow-hidden ${
                  canStart ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
                }`}
                style={{
                  background: canStart ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(100,100,100,0.3)',
                  boxShadow: canStart ? '0 4px 20px rgba(139,92,246,0.4)' : 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                }}>
                {/* Pulsing glow when threshold met */}
                {canStart && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{
                      boxShadow: [
                        '0 0 15px rgba(99,102,241,0.3)',
                        '0 0 30px rgba(99,102,241,0.6)',
                        '0 0 15px rgba(99,102,241,0.3)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <Play className="w-5 h-5 relative z-10" />
                <span className="relative z-10">
                  {canStart ? 'Start Game' : `Need ${minPlayers - playerCount} More Player${minPlayers - playerCount === 1 ? '' : 's'}`}
                </span>
              </motion.button>

              {/* Fill with AI button */}
              {playerCount < minPlayers && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFillWithAI}
                  className="px-6 py-4 rounded-xl text-white transition-all flex items-center gap-2"
                  style={{
                    background: 'rgba(251,191,36,0.15)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: '#fbbf24',
                  }}>
                  <Bot className="w-4 h-4" />
                  Fill with AI
                </motion.button>
              )}

              {/* Extend timer */}
              {countdown <= 120 && countdown > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExtendTimer}
                  className="px-6 py-4 rounded-xl transition-all"
                  style={{
                    background: 'rgba(251,191,36,0.15)',
                    border: '1px solid rgba(251,191,36,0.3)',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: '#fbbf24',
                  }}>
                  +60 sec
                </motion.button>
              )}
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLeave}
            className="py-4 rounded-xl text-gray-400 transition-all px-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
            }}>
            {isExpired ? 'Return to Menu' : 'Leave Lobby'}
          </motion.button>
        </div>

        {!isHost && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Waiting for host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}