import { motion } from 'motion/react';
import { Scissors, SkipForward, Users, Phone, RefreshCw } from 'lucide-react';
import { LifelineState, LifelineType } from '../../contexts/GameContext';

interface LifelineButtonsProps {
  lifelines: LifelineState;
  onUse: (type: LifelineType) => void;
  disabled: boolean;
}

const LIFELINES = [
  { type: 'fifty' as LifelineType, label: '50:50', icon: Scissors, color: '#fbbf24', bgColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.2)', desc: 'Remove 2 wrong answers' },
  { type: 'skip' as LifelineType, label: 'Skip', icon: SkipForward, color: '#06b6d4', bgColor: 'rgba(6,182,212,0.1)', borderColor: 'rgba(6,182,212,0.2)', desc: 'Skip this question' },
  { type: 'audience' as LifelineType, label: 'Audience', icon: Users, color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)', desc: 'Ask the audience' },
  { type: 'phone' as LifelineType, label: 'Phone', icon: Phone, color: '#34d399', bgColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.2)', desc: 'Call a friend' },
  { type: 'doubleDip' as LifelineType, label: '2nd Try', icon: RefreshCw, color: '#f472b6', bgColor: 'rgba(244,114,182,0.1)', borderColor: 'rgba(244,114,182,0.2)', desc: 'Get a second chance if wrong' },
];

export function LifelineButtons({ lifelines, onUse, disabled }: LifelineButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {LIFELINES.map(({ type, label, icon: Icon, color, bgColor, borderColor, desc }) => {
        const used = lifelines[type];
        return (
          <motion.div key={type} className="relative group">
            <motion.button
              whileHover={!used && !disabled ? { scale: 1.05 } : {}}
              whileTap={!used && !disabled ? { scale: 0.95 } : {}}
              onClick={() => !used && !disabled && onUse(type)}
              disabled={used || disabled}
              title={desc}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
              style={{
                background: used ? 'rgba(255,255,255,0.02)' : bgColor,
                border: `1px solid ${used ? 'rgba(255,255,255,0.04)' : borderColor}`,
                opacity: used ? 0.35 : 1,
                cursor: used || disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <Icon className="w-5 h-5" style={{ color: used ? '#475569' : color }} />
              <span className="text-xs" style={{ color: used ? '#475569' : color, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                {label}
              </span>
            </motion.button>
            {used && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 rotate-45 absolute" style={{ background: '#475569' }} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}