import { motion } from 'motion/react';
import { Scissors, SkipForward, Users, Phone, RefreshCw } from 'lucide-react';
const LIFELINES = [
    { type: 'fifty', label: '50:50', icon: Scissors, color: '#d97706', bgColor: 'rgba(217,119,6,0.08)', borderColor: 'rgba(217,119,6,0.15)', desc: 'Remove 2 wrong answers' },
    { type: 'skip', label: 'Skip', icon: SkipForward, color: '#0891b2', bgColor: 'rgba(8,145,178,0.08)', borderColor: 'rgba(8,145,178,0.15)', desc: 'Skip this question' },
    { type: 'audience', label: 'Audience', icon: Users, color: '#E84C6A', bgColor: 'rgba(232,76,106,0.08)', borderColor: 'rgba(232,76,106,0.15)', desc: 'Ask the audience' },
    { type: 'phone', label: 'Phone', icon: Phone, color: '#059669', bgColor: 'rgba(5,150,105,0.08)', borderColor: 'rgba(5,150,105,0.15)', desc: 'Call a friend' },
    { type: 'doubleDip', label: '2nd Try', icon: RefreshCw, color: '#c026d3', bgColor: 'rgba(192,38,211,0.08)', borderColor: 'rgba(192,38,211,0.15)', desc: 'Get a second chance if wrong' },
];
export function LifelineButtons({ lifelines, onUse, disabled }) {
    return (<div className="flex items-center justify-center gap-2 flex-wrap">
      {LIFELINES.map(({ type, label, icon: Icon, color, bgColor, borderColor, desc }) => {
            const used = lifelines[type];
            return (<motion.div key={type} className="relative group">
            <motion.button whileHover={!used && !disabled ? { scale: 1.05 } : {}} whileTap={!used && !disabled ? { scale: 0.95 } : {}} onClick={() => !used && !disabled && onUse(type)} disabled={used || disabled} title={desc} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200" style={{
                    background: used ? 'rgba(0,0,0,0.02)' : bgColor,
                    border: `1px solid ${used ? 'rgba(0,0,0,0.04)' : borderColor}`,
                    opacity: used ? 0.35 : 1,
                    cursor: used || disabled ? 'not-allowed' : 'pointer',
                }}>
              <Icon className="w-5 h-5" style={{ color: used ? '#94a3b8' : color }}/>
              <span className="text-xs" style={{ color: used ? '#94a3b8' : color, fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
                {label}
              </span>
            </motion.button>
            {used && (<div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 rotate-45 absolute" style={{ background: '#94a3b8' }}/>
              </div>)}
          </motion.div>);
        })}
    </div>);
}
