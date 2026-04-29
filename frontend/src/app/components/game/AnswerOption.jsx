import { motion } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';
export function AnswerOption({ id, text, label, isSelected, isCorrect, isEliminated, revealed, onClick, disabled, index }) {
    const getStyles = () => {
        if (isEliminated && !revealed) {
            return {
                bg: 'rgba(0,0,0,0.02)',
                border: 'rgba(0,0,0,0.04)',
                text: 'text-slate-400',
                badge: { background: 'rgba(0,0,0,0.05)', color: '#94a3b8' },
                glow: '',
            };
        }
        if (revealed) {
            if (isCorrect)
                return {
                    bg: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.05) 100%)',
                    border: '#34d399',
                    text: 'text-emerald-700',
                    badge: { background: '#10b981', color: '#fff' },
                    glow: '0 0 25px rgba(52,211,153,0.3)',
                };
            if (isSelected && !isCorrect)
                return {
                    bg: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
                    border: '#f87171',
                    text: 'text-red-600',
                    badge: { background: '#ef4444', color: '#fff' },
                    glow: '0 0 25px rgba(239,68,68,0.3)',
                };
            return {
                bg: 'rgba(0,0,0,0.02)',
                border: 'rgba(0,0,0,0.06)',
                text: 'text-slate-400',
                badge: { background: 'rgba(0,0,0,0.05)', color: '#94a3b8' },
                glow: '',
            };
        }
        if (isSelected)
            return {
                bg: 'linear-gradient(135deg, rgba(250,204,21,0.15) 0%, rgba(250,204,21,0.05) 100%)',
                border: '#FACC15',
                text: 'text-[#1A1A2E]',
                badge: { background: '#FACC15', color: '#fff' },
                glow: '0 8px 20px rgba(250,204,21,0.2)',
            };
        return {
            bg: 'rgba(255,255,255,0.7)',
            border: 'rgba(250,204,21,0.1)',
            text: 'text-[#1A1A2E]',
            badge: { background: 'rgba(250,204,21,0.08)', color: '#FACC15' },
            glow: '0 2px 8px rgba(0,0,0,0.02)',
        };
    };
    const styles = getStyles();
    return (<motion.button 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: index * 0.1, duration: 0.4, type: 'spring', damping: 20 }} 
        whileHover={!disabled && !isEliminated ? { 
            scale: 1.02, 
            borderColor: 'rgba(250,204,21,0.3)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
        } : {}} 
        whileTap={!disabled && !isEliminated ? { scale: 0.98 } : {}} 
        onClick={onClick} 
        disabled={disabled || isEliminated} 
        className={`group relative w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 ${styles.text} ${isEliminated ? 'cursor-not-allowed opacity-30 grayscale' : 'cursor-pointer'}`} 
        style={{
            background: styles.bg,
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${styles.border}`,
            boxShadow: styles.glow,
        }}>
      {/* Selection/Status Indicator Glow */}
      {(isSelected || (revealed && isCorrect)) && (
        <motion.div 
            layoutId={`glow-${id}`}
            className="absolute inset-0 rounded-2xl z-0 opacity-20"
            style={{ background: styles.badge.background, filter: 'blur(15px)' }}
        />
      )}

      <span className="relative z-10 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all duration-300 shadow-sm" 
            style={{ ...styles.badge, fontFamily: 'inherit', fontWeight: 800 }}>
        {label}
      </span>
      
      <span className="relative z-10 flex-1 font-medium tracking-tight" style={{ fontFamily: 'inherit' }}>
        {text}
      </span>

      <div className="relative z-10 flex items-center justify-center w-6 h-6">
          {revealed && isCorrect && (<motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <CheckCircle className="w-6 h-6 text-emerald-500"/>
            </motion.div>)}
          {revealed && isSelected && !isCorrect && (<motion.div initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
              <XCircle className="w-6 h-6 text-red-500"/>
            </motion.div>)}
          {!revealed && isSelected && (
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 rounded-full bg-[#FACC15]" 
            />
          )}
      </div>
    </motion.button>);
}

