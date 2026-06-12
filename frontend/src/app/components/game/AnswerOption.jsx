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
        whileHover={!disabled && !isEliminated ? { 
            scale: 1.01, 
            borderColor: 'rgba(250,204,21,0.3)',
            boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.04), 0 6px 8px -6px rgba(0, 0, 0, 0.04)'
        } : {}} 
        whileTap={!disabled && !isEliminated ? { scale: 0.99 } : {}} 
        onClick={onClick} 
        disabled={disabled || isEliminated} 
        className={`group relative w-full flex items-center gap-1.5 sm:gap-4 p-2 sm:p-4 rounded-xl sm:rounded-2xl text-left transition-all duration-300 ${styles.text} ${isEliminated ? 'cursor-not-allowed opacity-30 grayscale' : 'cursor-pointer'}`} 
        style={{
            background: styles.bg,
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${styles.border}`,
            boxShadow: styles.glow,
        }}>
      {/* Selection/Status Indicator Glow */}
      {(isSelected || (revealed && isCorrect)) && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className="absolute inset-0 rounded-xl sm:rounded-2xl z-0"
            style={{ background: styles.badge.background, filter: 'blur(15px)' }}
        />
      )}

      <span className="relative z-10 flex-shrink-0 w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-[11px] sm:text-lg transition-all duration-300 shadow-sm" 
            style={{ ...styles.badge, fontFamily: 'inherit', fontWeight: 800 }}>
        {label}
      </span>
      
      <span className="relative z-10 flex-1 text-[11px] sm:text-sm md:text-base font-bold tracking-tight leading-snug" style={{ fontFamily: 'inherit' }}>
        {text}
      </span>

      <div className="relative z-10 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
          {revealed && isCorrect && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500"/>
            </motion.div>)}
          {revealed && isSelected && !isCorrect && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500"/>
            </motion.div>)}
          {!revealed && isSelected && (
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#FACC15]" />
          )}
      </div>
    </motion.button>);
}

