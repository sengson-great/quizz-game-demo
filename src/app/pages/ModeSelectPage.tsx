import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame, GameMode } from '../contexts/GameContext';
import { CATEGORIES } from '../data/questions';

export default function ModeSelectPage() {
  const { currentUser } = useAuth();
  const { initGame } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const preMode = (location.state as any)?.preMode as GameMode | undefined;

  const [selectedMode, setSelectedMode] = useState<GameMode | null>(preMode || null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentUser?.preferredCategories || CATEGORIES.map(c => c.id)
  );

  useEffect(() => {
    if (!currentUser) navigate('/auth');
  }, [currentUser, navigate]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(c => c !== id) : prev) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (!selectedMode || selectedCategories.length === 0) return;
    initGame(selectedMode, selectedCategories);
    navigate('/matchmaking');
  };

  const modes = [
    {
      mode: 'Solo' as GameMode, icon: '🎯', title: 'Solo Practice',
      desc: 'Play alone, save to leaderboard',
      badge: 'Practice Mode',
      badgeStyle: { background: 'rgba(251,191,36,0.1)', color: '#d97706' },
      activeColor: '#d97706',
    },
    {
      mode: '1v1' as GameMode, icon: '⚔️', title: '1v1 Battle',
      desc: 'Matched vs a single opponent',
      badge: 'Recommended',
      badgeStyle: { background: 'rgba(232,54,78,0.08)', color: '#e8364e' },
      activeColor: '#e8364e',
    },
    {
      mode: 'Room' as GameMode, icon: '🏆', title: 'Room Battle',
      desc: '3-5 players with live scoreboard',
      badge: 'Most Fun',
      badgeStyle: { background: 'rgba(52,211,153,0.1)', color: '#059669' },
      activeColor: '#059669',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-10 max-w-4xl mx-auto" style={{ fontFamily: 'Outfit, Inter, sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-gray-900 text-center mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.8rem' }}>
          Select Your Mode
        </h1>
        <p className="text-gray-500 text-center text-sm">Choose how you want to compete</p>
      </motion.div>

      {/* Mode Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {modes.map(({ mode, icon, title, desc, badge, badgeStyle, activeColor }, i) => {
          const isActive = selectedMode === mode;
          return (
            <motion.button
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode(mode)}
              className="relative text-left rounded-2xl p-6 transition-all duration-200 bg-white"
              style={{
                border: `2px solid ${isActive ? activeColor : 'rgba(0,0,0,0.06)'}`,
                boxShadow: isActive ? `0 4px 20px rgba(232,54,78,0.1)` : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {isActive && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: activeColor }}>
                  <Check className="w-3.5 h-3.5 text-white" />
                </motion.div>
              )}
              <div className="text-4xl mb-4">{icon}</div>
              <span className="text-xs px-2.5 py-1 rounded-full mb-3 inline-block" style={badgeStyle}>{badge}</span>
              <h3 className="text-gray-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Category Selection */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="rounded-2xl p-6 mb-8 bg-white"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Knowledge Categories</h2>
          <div className="flex gap-2">
            <button onClick={() => setSelectedCategories(CATEGORIES.map(c => c.id))}
              className="text-xs text-rose-500 hover:text-rose-600 transition-colors">All</button>
            <span className="text-gray-300">·</span>
            <button onClick={() => setSelectedCategories([CATEGORIES[0].id])}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors">None</button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(({ id, name, icon, color }) => {
            const isSelected = selectedCategories.includes(id);
            return (
              <motion.button key={id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCategory(id)}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                style={{
                  background: isSelected ? 'rgba(232,54,78,0.04)' : 'rgba(0,0,0,0.01)',
                  border: isSelected ? '1px solid rgba(232,54,78,0.2)' : '1px solid rgba(0,0,0,0.06)',
                }}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-sm ${isSelected ? '' : 'opacity-40'}`}>
                  {icon}
                </div>
                <span className={`text-sm transition-colors ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>
                  {name}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-rose-500 ml-auto" />}
              </motion.button>
            );
          })}
        </div>
        <p className="text-gray-400 text-xs mt-3">{selectedCategories.length} of {CATEGORIES.length} selected</p>
      </motion.div>

      {/* Difficulty Info */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-3 mb-8 text-sm">
        {[
          { label: '5 Easy', bg: 'rgba(52,211,153,0.08)', color: '#059669', border: 'rgba(52,211,153,0.15)' },
          { label: '5 Medium', bg: 'rgba(251,191,36,0.08)', color: '#d97706', border: 'rgba(251,191,36,0.15)' },
          { label: '5 Hard', bg: 'rgba(244,63,94,0.08)', color: '#e11d48', border: 'rgba(244,63,94,0.15)' },
        ].map(({ label, bg, color, border }) => (
          <span key={label} className="px-3.5 py-1.5 rounded-full" style={{ background: bg, color, border: `1px solid ${border}` }}>{label}</span>
        ))}
      </motion.div>

      {/* Start Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
        <motion.button
          whileHover={selectedMode ? { scale: 1.03 } : {}}
          whileTap={selectedMode ? { scale: 0.97 } : {}}
          onClick={handleStart}
          disabled={!selectedMode}
          className={`px-10 py-4 rounded-2xl text-white text-lg flex items-center gap-3 mx-auto transition-all ${
            selectedMode ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}
          style={{
            background: selectedMode ? 'linear-gradient(135deg, #e8364e, #dc2626)' : '#e5e7eb',
            boxShadow: selectedMode ? '0 4px 25px rgba(232,54,78,0.3)' : 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
          }}>
          {selectedMode ? `Start ${selectedMode} Game` : 'Select a Mode'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
