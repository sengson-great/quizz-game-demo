import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, AlertTriangle, X, Flag } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../../api/axios';

export function ReturnButton({ context, variant = 'default', onClick, className, style, children }) {
    const { gameState, resetGame, cancelMatchmake, leaveBattle, surrenderGame } = useGame();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    const isSurrenderMode = context === 'game' && gameState?.mode !== 'Solo' && gameState?.status === 'active';

    const leaveAndReset = async () => {
        console.log('[DEBUG] leaveAndReset called. isSurrenderMode:', isSurrenderMode, 'matchId:', gameState?.matchId);
        if (gameState?.matchId) {
            console.log('[DEBUG] Sending player_left API request...');
            try {
                // Await so the Pusher event is dispatched before we wipe state and navigate away.
                // Sending non-empty payload to satisfy any strict validation rules.
                const res = await api.post('/multiplayer/action', {
                    match_id: gameState.matchId,
                    action_type: 'player_left',
                    payload: { left: true }
                });
                console.log('[DEBUG] player_left API request completed successfully! Response:', res.data);
            } catch (err) {
                console.error('[DEBUG] player_left API request failed:', err);
            }
        }

        if (isSurrenderMode) {
            console.log('[DEBUG] Triggering surrenderGame state action and navigating to /results.');
            surrenderGame();
            navigate('/results');
        } else {
            console.log('[DEBUG] Triggering resetGame state action and navigating to /dashboard.');
            resetGame();
            navigate('/dashboard');
        }
    };

    const handleReturn = () => {
        if (onClick) {
            onClick();
            return;
        }
        if (context === 'game' && gameState?.status === 'active') {
            setShowConfirmation(true);
            return;
        }
        leaveAndReset();
    };
    
    const confirmReturn = () => {
        leaveAndReset();
    };

    if (children) {
        return (<button onClick={handleReturn} className={className} style={style}>
        {children}
      </button>);
    }
    return (<>
      <motion.button 
        whileHover={{ scale: 1.05, x: 2 }} 
        whileTap={{ scale: 0.95 }} 
        onClick={handleReturn} 
        className={className || `flex items-center justify-center transition-all ${
            isSurrenderMode
                ? 'p-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black shadow-lg shadow-red-500/25 border border-red-400/20'
                : variant === 'minimal'
                    ? 'text-slate-400 hover:text-[#FACC15]'
                    : 'p-2.5 sm:p-3 rounded-xl sm:rounded-2xl glass-card border-white/20'
        }`} 
        style={style || (variant === 'default' && !isSurrenderMode
            ? {
                boxShadow: '0 8px 20px -5px rgba(0,0,0,0.05)',
            }
            : undefined)}>
        {isSurrenderMode ? (
            <Flag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white fill-white sm:mr-2 animate-pulse" />
        ) : (
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600"/>
        )}
        {isSurrenderMode ? (
            <span className="text-xs font-black uppercase tracking-normal text-white hidden sm:inline">
                {t('surrenderButton')}
            </span>
        ) : (
            variant === 'default' && (
                <span className="ml-2 text-xs font-black tracking-normal text-slate-600 uppercase hidden sm:inline">
                    {t('returnHome')}
                </span>
            )
        )}
      </motion.button>

      {/* Forfeit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmation(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="rounded-2xl p-6 shadow-2xl" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                      <AlertTriangle className="w-5 h-5 text-red-500"/>
                    </div>
                    <h2 className="text-[#1A1A2E]" style={{ fontFamily: 'inherit', fontWeight: 700, fontSize: '1.25rem' }}>
                      {isSurrenderMode ? t('surrenderMatch') : t('forfeitTitle')}
                    </h2>
                  </div>
                  <button onClick={() => setShowConfirmation(false)} className="p-2 rounded-lg hover:bg-black/5 text-slate-400 hover:text-[#1A1A2E] transition-colors">
                    <X className="w-5 h-5"/>
                  </button>
                </div>

                <p className="text-slate-600 mb-6">
                  {isSurrenderMode 
                    ? t('surrenderDesc')
                    : t('forfeitDesc')}
                </p>

                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowConfirmation(false)} className="flex-1 py-3 rounded-xl text-[#1A1A2E] transition-all" style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                fontFamily: 'inherit',
                fontWeight: 600,
            }}>
                    {isSurrenderMode ? t('keepPlaying') : t('stayInGame')}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmReturn} className="flex-1 py-3 rounded-xl text-white transition-all" style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 2px 15px rgba(239,68,68,0.3)',
                fontFamily: 'inherit',
                fontWeight: 600,
            }}>
                    {isSurrenderMode ? t('surrender') : t('forfeitAndLeave')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>)}
      </AnimatePresence>
    </>);
}
