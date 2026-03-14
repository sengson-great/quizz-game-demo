import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Home, AlertTriangle, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

interface ReturnButtonProps {
  context: 'lobby' | 'matchmaking' | 'results' | 'game';
  variant?: 'default' | 'minimal';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function ReturnButton({ context, variant = 'default', onClick, className, style, children }: ReturnButtonProps) {
  const { gameState, resetGame } = useGame();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReturn = () => {
    if (onClick) { onClick(); return; }
    if (context === 'game' && gameState?.status === 'active') {
      setShowConfirmation(true);
      return;
    }
    resetGame();
    navigate('/dashboard');
  };

  const confirmReturn = () => {
    resetGame();
    navigate('/dashboard');
  };

  if (children) {
    return (
      <button onClick={handleReturn} className={className} style={style}>
        {children}
      </button>
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleReturn}
        className={`flex items-center gap-2 transition-all ${
          variant === 'minimal' 
            ? 'text-[#6B7280] hover:text-[#1A1A2E]' 
            : 'px-4 py-2 rounded-xl text-[#1A1A2E]'
        }`}
        style={
          variant === 'default'
            ? {
                background: '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
              }
            : undefined
        }>
        <Home className="w-4 h-4" />
        {variant === 'default' && 'Return Home'}
      </motion.button>

      {/* Forfeit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmation(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="rounded-2xl p-6 shadow-2xl"
                style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.08)' }}>
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-[#1A1A2E]" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>
                      Forfeit Game?
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="p-2 rounded-lg hover:bg-black/[0.03] text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[#6B7280] mb-6">
                  Leaving now will forfeit your score and count as a loss. Are you sure you want to quit this game?
                </p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 py-3 rounded-xl text-[#6B7280] transition-all"
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                    }}>
                    Stay in Game
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmReturn}
                    className="flex-1 py-3 rounded-xl text-white transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      boxShadow: '0 2px 15px rgba(239,68,68,0.3)',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                    }}>
                    Forfeit & Leave
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
