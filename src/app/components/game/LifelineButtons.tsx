import { motion } from 'motion/react';
import { Scissors, SkipForward, Users, Phone } from 'lucide-react';
import { LifelineState, LifelineType } from '../../contexts/GameContext';

interface LifelineButtonsProps {
  lifelines: LifelineState;
  onUse: (type: LifelineType) => void;
  disabled: boolean;
}

const LIFELINES = [
  { type: 'fifty' as LifelineType, label: '50:50', icon: Scissors, color: '#d97706', bgColor: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.15)', desc: 'Remove 2 wrong answers' },
  { type: 'skip' as LifelineType, label: 'Skip', icon: SkipForward, color: '#0891b2', bgColor: 'rgba(34,211,238,0.06)', borderColor: 'rgba(34,211,238,0.15)', desc: 'Skip this question' },
  { type: 'audience' as LifelineType, label: 'Audience', icon: Users, color: '#e8364e', bgColor: 'rgba(232,54,78,0.05)', borderColor: 'rgba(232,54,78,0.12)', desc: 'Ask the audience' },
  { type: 'phone' as LifelineType, label: 'Phone', icon: Phone, color: '#059669', bgColor: 'rgba(52,211,153,0.06)', borderColor: 'rgba(52,211,153,0.15)', desc: 'Call a friend' },
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
                background: used ? 'rgba(0,0,0,0.02)' : bgColor,
                border: `1px solid ${used ? 'rgba(0,0,0,0.04)' : borderColor}`,
                opacity: used ? 0.35 : 1,
                cursor: used || disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <Icon className="w-5 h-5" style={{ color: used ? '#cbd5e1' : color }} />
              <span className="text-xs" style={{ color: used ? '#cbd5e1' : color, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                {label}
              </span>
            </motion.button>
            {used && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 rotate-45 absolute" style={{ background: '#cbd5e1' }} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
