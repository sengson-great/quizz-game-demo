import { motion } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerOptionProps {
  id: string;
  text: string;
  label: string;
  isSelected: boolean;
  isCorrect: boolean;
  isEliminated: boolean;
  revealed: boolean;
  onClick: () => void;
  disabled: boolean;
  index: number;
}

export function AnswerOption({ id, text, label, isSelected, isCorrect, isEliminated, revealed, onClick, disabled, index }: AnswerOptionProps) {
  const getStyles = () => {
    if (isEliminated && !revealed) {
      return {
        bg: 'rgba(0,0,0,0.02)',
        border: 'rgba(0,0,0,0.04)',
        text: 'text-gray-300',
        badge: { background: 'rgba(0,0,0,0.04)', color: '#cbd5e1' },
        glow: '',
      };
    }
    if (revealed) {
      if (isCorrect) return {
        bg: 'rgba(52,211,153,0.06)',
        border: 'rgba(52,211,153,0.3)',
        text: 'text-emerald-700',
        badge: { background: '#059669', color: '#fff' },
        glow: '0 0 15px rgba(52,211,153,0.15)',
      };
      if (isSelected && !isCorrect) return {
        bg: 'rgba(244,63,94,0.06)',
        border: 'rgba(244,63,94,0.3)',
        text: 'text-rose-600',
        badge: { background: '#e11d48', color: '#fff' },
        glow: '0 0 15px rgba(244,63,94,0.15)',
      };
      return {
        bg: 'rgba(0,0,0,0.01)',
        border: 'rgba(0,0,0,0.06)',
        text: 'text-gray-400',
        badge: { background: 'rgba(0,0,0,0.04)', color: '#94a3b8' },
        glow: '',
      };
    }
    if (isSelected) return {
      bg: 'rgba(232,54,78,0.04)',
      border: 'rgba(232,54,78,0.4)',
      text: 'text-gray-800',
      badge: { background: '#e8364e', color: '#fff' },
      glow: '0 0 15px rgba(232,54,78,0.1)',
    };
    return {
      bg: 'white',
      border: 'rgba(0,0,0,0.08)',
      text: 'text-gray-700',
      badge: { background: 'rgba(0,0,0,0.04)', color: '#64748b' },
      glow: '',
    };
  };

  const styles = getStyles();

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      whileHover={!disabled && !isEliminated ? { scale: 1.01, borderColor: 'rgba(232,54,78,0.3)' } : {}}
      whileTap={!disabled && !isEliminated ? { scale: 0.99 } : {}}
      onClick={onClick}
      disabled={disabled || isEliminated}
      className={`group w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 ${styles.text} ${isEliminated ? 'cursor-not-allowed opacity-40 line-through' : 'cursor-pointer'}`}
      style={{
        background: styles.bg,
        border: `2px solid ${styles.border}`,
        boxShadow: styles.glow || '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <span className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
        style={{ ...styles.badge, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
        {label}
      </span>
      <span className="flex-1">
        {text}
      </span>
      {revealed && isCorrect && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        </motion.div>
      )}
      {revealed && isSelected && !isCorrect && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
        </motion.div>
      )}
    </motion.button>
  );
}
