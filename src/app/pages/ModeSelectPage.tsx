import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Check, Plus, LogIn, X, Users, Zap, Shuffle, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame, GameMode } from '../contexts/GameContext';
import { CATEGORIES } from '../data/questions';

const CARD = { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };
const MODAL_BG = { background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' };

export default function ModeSelectPage() {
  const { currentUser } = useAuth();
  const { initGame, createSmallRoom, createRandomSmallRoom, createPrivate1v1, startRanked1v1 } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const preMode = (location.state as any)?.preMode as GameMode | undefined;

  const [selectedMode, setSelectedMode] = useState<GameMode | null>(preMode || null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentUser?.preferredCategories || CATEGORIES.map(c => c.id)
  );
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [show1v1Options, setShow1v1Options] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinCode1v1, setJoinCode1v1] = useState('');

  useEffect(() => { if (!currentUser) navigate('/auth'); }, [currentUser, navigate]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(c => c !== id) : prev) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (!selectedMode || selectedCategories.length === 0) return;
    if (selectedMode === 'Room') { setShowRoomOptions(true); return; }
    if (selectedMode === '1v1') { setShow1v1Options(true); return; }
    initGame(selectedMode, selectedCategories);
    navigate('/matchmaking');
  };

  const handleCreateInviteRoom = () => { if (selectedCategories.length === 0) return; createSmallRoom(selectedCategories); navigate('/lobby'); };
  const handleCreateRandomRoom = () => { if (selectedCategories.length === 0) return; createRandomSmallRoom(selectedCategories); navigate('/matchmaking'); };
  const handleJoinRoom = () => { if (!joinCode.trim() || joinCode.length !== 6) return; navigate('/lobby', { state: { joinCode } }); };
  const handleInviteFriend1v1 = () => { if (selectedCategories.length === 0) return; createPrivate1v1(selectedCategories); navigate('/battle-lobby'); };
  const handleRandomMatch1v1 = () => { if (selectedCategories.length === 0) return; startRanked1v1(selectedCategories); navigate('/matchmaking'); };
  const handleJoin1v1 = () => { if (!joinCode1v1.trim() || joinCode1v1.length !== 6) return; navigate('/battle-lobby', { state: { joinCode: joinCode1v1 } }); };

  const modes = [
    { mode: 'Solo' as GameMode, icon: '🎯', title: 'Solo Practice', desc: 'Play alone, save to leaderboard', badge: 'Practice Mode', badgeColor: '#d97706', activeColor: '#d97706', activeBorder: 'rgba(217,119,6,0.35)' },
    { mode: '1v1' as GameMode, icon: '⚔️', title: '1v1 Battle', desc: 'Random match or invite a friend', badge: 'Recommended', badgeColor: '#E84C6A', activeColor: '#E84C6A', activeBorder: 'rgba(232,76,106,0.35)' },
    { mode: 'Room' as GameMode, icon: '🏆', title: 'Room Battle', desc: '3-5 players, random or invite', badge: 'Most Fun', badgeColor: '#059669', activeColor: '#059669', activeBorder: 'rgba(5,150,105,0.35)' },
  ];

  return (
    <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto" style={{ fontFamily: 'Poppins, Inter, sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-[#1A1A2E] text-center mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.8rem' }}>
          Select Your Mode
        </h1>
        <p className="text-slate-500 text-center text-sm">Choose how you want to compete</p>
      </motion.div>

      {/* Mode Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {modes.map(({ mode, icon, title, desc, badge, badgeColor, activeColor, activeBorder }, i) => {
          const isActive = selectedMode === mode;
          return (
            <motion.button key={mode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedMode(mode)}
              className="relative text-left rounded-2xl p-6 transition-all duration-200"
              style={{
                background: isActive ? `${activeColor}08` : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${isActive ? activeBorder : 'rgba(0,0,0,0.06)'}`,
                boxShadow: isActive ? '0 4px 20px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
              }}>
              {isActive && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: activeColor }}>
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
              <div className="text-4xl mb-4">{icon}</div>
              <span className="text-xs px-2.5 py-1 rounded-full mb-3 inline-block" style={{ background: `${badgeColor}15`, color: badgeColor }}>{badge}</span>
              <h3 className="text-[#1A1A2E] mb-2" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>{title}</h3>
              <p className="text-slate-500 text-sm">{desc}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Category Selection */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 mb-8" style={CARD}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Knowledge Categories</h2>
          <div className="flex gap-2">
            <button onClick={() => setSelectedCategories(CATEGORIES.map(c => c.id))} className="text-xs text-[#E84C6A] hover:text-[#D43B59] transition-colors">All</button>
            <span className="text-slate-300">·</span>
            <button onClick={() => setSelectedCategories([CATEGORIES[0].id])} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">None</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(({ id, name, icon, color }) => {
            const isSelected = selectedCategories.includes(id);
            return (
              <motion.button key={id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => toggleCategory(id)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                style={{
                  background: isSelected ? 'rgba(232,76,106,0.06)' : 'rgba(0,0,0,0.02)',
                  border: isSelected ? '1px solid rgba(232,76,106,0.2)' : '1px solid rgba(0,0,0,0.06)',
                }}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-sm ${isSelected ? '' : 'opacity-40'}`}>{icon}</div>
                <span className={`text-sm transition-colors ${isSelected ? 'text-[#1A1A2E]' : 'text-slate-400'}`}>{name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#E84C6A] ml-auto" />}
              </motion.button>
            );
          })}
        </div>
        <p className="text-slate-400 text-xs mt-3">{selectedCategories.length} of {CATEGORIES.length} selected</p>
      </motion.div>

      {/* Difficulty Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-3 mb-8 text-sm">
        {[
          { label: '5 Easy', bg: 'rgba(52,211,153,0.08)', color: '#059669', border: 'rgba(52,211,153,0.15)' },
          { label: '5 Medium', bg: 'rgba(251,191,36,0.08)', color: '#d97706', border: 'rgba(251,191,36,0.15)' },
          { label: '5 Hard', bg: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'rgba(239,68,68,0.15)' },
        ].map(({ label, bg, color, border }) => (
          <span key={label} className="px-3.5 py-1.5 rounded-full" style={{ background: bg, color, border: `1px solid ${border}` }}>{label}</span>
        ))}
      </motion.div>

      {/* Start Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
        <motion.button whileHover={selectedMode ? { scale: 1.03 } : {}} whileTap={selectedMode ? { scale: 0.97 } : {}}
          onClick={handleStart} disabled={!selectedMode}
          className={`px-10 py-4 rounded-2xl text-white text-lg flex items-center gap-3 mx-auto transition-all ${selectedMode ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
          style={{
            background: selectedMode ? 'linear-gradient(135deg, #E84C6A, #D43B59)' : 'rgba(0,0,0,0.1)',
            boxShadow: selectedMode ? '0 4px 25px rgba(232,76,106,0.3)' : 'none',
            fontFamily: 'Poppins, sans-serif', fontWeight: 600,
          }}>
          {selectedMode === 'Room' ? 'Choose Room Option' : selectedMode === '1v1' ? 'Choose Battle Option' : selectedMode ? `Start ${selectedMode} Game` : 'Select a Mode'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Room Battle Options Modal */}
      <AnimatePresence>
        {showRoomOptions && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRoomOptions(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="rounded-2xl p-6 shadow-2xl" style={MODAL_BG}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>Room Battle Options</h2>
                  <button onClick={() => setShowRoomOptions(false)} className="p-2 rounded-lg hover:bg-black/5 text-slate-400 hover:text-[#1A1A2E] transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3 mb-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreateRandomRoom}
                    className="w-full p-5 rounded-xl text-left transition-all" style={{ background: 'rgba(6,182,212,0.06)', border: '2px solid rgba(6,182,212,0.15)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600"><Shuffle className="w-5 h-5 text-white" /></div>
                      <div className="flex-1"><h3 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Random Room</h3><p className="text-slate-400 text-xs">Auto-fill 3-5 players, starts immediately</p></div>
                      <ChevronRight className="w-5 h-5 text-cyan-500" />
                    </div>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreateInviteRoom}
                    className="w-full p-5 rounded-xl text-left transition-all" style={{ background: 'rgba(232,76,106,0.06)', border: '2px solid rgba(232,76,106,0.15)' }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#E84C6A] to-pink-500"><UserPlus className="w-5 h-5 text-white" /></div>
                      <div className="flex-1"><h3 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Invite Room</h3><p className="text-slate-400 text-xs">Create room, invite friends (start at 3+ players)</p></div>
                      <ChevronRight className="w-5 h-5 text-[#E84C6A]" />
                    </div>
                  </motion.button>
                </div>
                <div className="p-5 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)' }}><LogIn className="w-5 h-5 text-emerald-500" /></div>
                    <div className="flex-1"><h3 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Join Existing Room</h3><p className="text-slate-400 text-xs">Enter a room code to join instantly</p></div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter code (e.g., ABC123)" maxLength={6}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm text-[#1A1A2E] placeholder-slate-400"
                      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }} />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleJoinRoom} disabled={joinCode.length !== 6}
                      className={`px-5 py-2.5 rounded-xl text-white text-sm transition-all ${joinCode.length === 6 ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                      style={{ background: joinCode.length === 6 ? 'linear-gradient(135deg, #34d399, #059669)' : 'rgba(0,0,0,0.1)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Join</motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1v1 Battle Options Modal */}
      <AnimatePresence>
        {show1v1Options && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShow1v1Options(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="rounded-2xl p-6 shadow-2xl" style={MODAL_BG}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.5rem' }}>1v1 Battle Options</h2>
                  <button onClick={() => setShow1v1Options(false)} className="p-2 rounded-lg hover:bg-black/5 text-slate-400 hover:text-[#1A1A2E] transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3 mb-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRandomMatch1v1}
                    className="w-full p-4 rounded-xl flex items-center gap-4 transition-all text-left"
                    style={{ background: 'rgba(6,182,212,0.06)', border: '2px solid rgba(6,182,212,0.15)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}><Zap className="w-6 h-6 text-white" /></div>
                    <div className="flex-1"><h3 className="text-[#1A1A2E] mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1rem' }}>Random Match</h3><p className="text-slate-400 text-sm">Find a human opponent or get matched with AI</p></div>
                    <ChevronRight className="w-5 h-5 text-cyan-500" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleInviteFriend1v1}
                    className="w-full p-4 rounded-xl flex items-center gap-4 transition-all text-left"
                    style={{ background: 'rgba(139,92,246,0.06)', border: '2px solid rgba(139,92,246,0.15)' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}><UserPlus className="w-6 h-6 text-white" /></div>
                    <div className="flex-1"><h3 className="text-[#1A1A2E] mb-1" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1rem' }}>Invite Friend</h3><p className="text-slate-400 text-sm">60-min lobby with room code, or switch to random</p></div>
                    <ChevronRight className="w-5 h-5 text-violet-400" />
                  </motion.button>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.1)' }}><LogIn className="w-5 h-5 text-emerald-500" /></div>
                    <div className="flex-1"><h3 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Join a Battle</h3><p className="text-slate-400 text-xs">Enter a battle code from a friend</p></div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={joinCode1v1} onChange={(e) => setJoinCode1v1(e.target.value.toUpperCase())} placeholder="Enter battle code" maxLength={6}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm text-[#1A1A2E] placeholder-slate-400"
                      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }} />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleJoin1v1} disabled={joinCode1v1.length !== 6}
                      className={`px-5 py-2.5 rounded-xl text-white text-sm transition-all ${joinCode1v1.length === 6 ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                      style={{ background: joinCode1v1.length === 6 ? 'linear-gradient(135deg, #34d399, #059669)' : 'rgba(0,0,0,0.1)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>Join</motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}