import { motion } from 'motion/react';
import { Scissors, SkipForward, Users, Phone, RefreshCw } from 'lucide-react';
const LIFELINES = [
    { type: 'fifty', label: '50:50', icon: Scissors, color: '#d97706', bgColor: 'rgba(217,119,6,0.08)', borderColor: 'rgba(217,119,6,0.15)', desc: 'Remove 2 wrong answers' },
    { type: 'skip', label: 'Skip', icon: SkipForward, color: '#0891b2', bgColor: 'rgba(8,145,178,0.08)', borderColor: 'rgba(8,145,178,0.15)', desc: 'Skip this question' },
    { type: 'audience', label: 'Audience', icon: Users, color: '#FACC15', bgColor: 'rgba(250,204,21,0.08)', borderColor: 'rgba(250,204,21,0.15)', desc: 'Ask the audience' },
    { type: 'phone', label: 'Phone', icon: Phone, color: '#FACC15', bgColor: 'rgba(250,204,21,0.08)', borderColor: 'rgba(250,204,21,0.15)', desc: 'Call a friend' },
    { type: 'doubleDip', label: '2nd Try', icon: RefreshCw, color: '#c026d3', bgColor: 'rgba(192,38,211,0.08)', borderColor: 'rgba(192,38,211,0.15)', desc: 'Get a second chance if wrong' },
];
export function LifelineButtons({ lifelines, enabledTypes, onUse, disabled }) {
    // If enabledTypes provided, only show lifelines that are enabled by admin config
    const visibleLifelines = enabledTypes
        ? LIFELINES.filter(({ type }) => enabledTypes[type] !== false)
        : LIFELINES;

    return (<div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
      {visibleLifelines.map(({ type, label, icon: Icon, color, bgColor, borderColor, desc }) => {
            const used = lifelines?.[type] === true;
            return (<motion.div key={type} className="relative group">
            <motion.button 
                whileHover={!used && !disabled ? { 
                    y: -3,
                    boxShadow: '0 6px 12px -3px rgba(0, 0, 0, 0.08)',
                    borderColor: color
                } : {}} 
                whileTap={!used && !disabled ? { scale: 0.95 } : {}} 
                onClick={() => !used && !disabled && onUse(type)} 
                disabled={used || disabled} 
                title={desc} 
                className="flex flex-col items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 relative overflow-hidden glass-card" 
                style={{
                    background: used ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.6)',
                    borderWidth: '1.5px',
                    borderColor: used ? 'rgba(0,0,0,0.06)' : borderColor,
                    opacity: used ? 0.4 : 1,
                    cursor: used || disabled ? 'not-allowed' : 'pointer',
                }}>
              
              {!used && !disabled && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: color }} />
              )}

              <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: used ? '#94a3b8' : color }}/>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-normal font-black leading-none" style={{ color: used ? '#94a3b8' : color, fontFamily: 'inherit' }}>
                {label}
              </span>

              {used && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="absolute top-1/2 left-0 h-0.5 bg-slate-400 rotate-12 origin-left"
                  />
              )}
            </motion.button>
          </motion.div>);
        })}
    </div>);
}

