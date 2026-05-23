import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
export function CircularTimer({ timeRemaining, totalTime, onExpire, isActive, size = 'md' }) {
    const hasExpired = useRef(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (timeRemaining <= 0 && !hasExpired.current && isActive) {
            hasExpired.current = true;
            onExpire();
        }
        if (timeRemaining > 0) {
            hasExpired.current = false;
        }
    }, [timeRemaining, onExpire, isActive]);

    const activeSize = (size === 'md' && isMobile) ? 'sm' : size;

    const dims = activeSize === 'sm' ? { w: 50, r: 20, sw: 3.5, fs: 'text-[11px]' }
        : activeSize === 'lg' ? { w: 120, r: 50, sw: 7, fs: 'text-3xl' }
            : { w: 86, r: 36, sw: 5, fs: 'text-xl' };
    const circumference = 2 * Math.PI * dims.r;
    const progress = timeRemaining / totalTime;
    const strokeDashoffset = circumference * (1 - progress);
    
    const getColor = () => {
        if (timeRemaining > totalTime * 0.66) return '#10b981'; // Emerald 500
        if (timeRemaining > totalTime * 0.33) return '#f59e0b'; // Amber 500
        return '#f43f5e'; // Rose 500
    };

    const color = getColor();
    const isLowTime = timeRemaining <= 10 && timeRemaining > 0 && isActive;

    return (<div className="relative flex items-center justify-center">
      <motion.div 
        animate={isLowTime ? { 
            scale: [1, 1.08, 1],
            filter: [`drop-shadow(0 0 8px ${color}44)`, `drop-shadow(0 0 20px ${color}88)`, `drop-shadow(0 0 8px ${color}44)`]
        } : { 
            scale: 1,
            filter: `drop-shadow(0 0 10px ${color}33)`
        }} 
        transition={{ duration: 0.6, repeat: isLowTime ? Infinity : 0, ease: "easeInOut" }} 
        className="relative"
      >
        <svg width={dims.w} height={dims.w} viewBox={`0 0 ${dims.w} ${dims.w}`} className="transform -rotate-90">
          {/* Background Track */}
          <circle 
            cx={dims.w / 2} 
            cy={dims.w / 2} 
            r={dims.r} 
            fill="none" 
            stroke="rgba(0,0,0,0.04)" 
            strokeWidth={dims.sw}
          />
          
          {/* Outer Glow Ring (Subtle) */}
          <circle 
            cx={dims.w / 2} 
            cy={dims.w / 2} 
            r={dims.r} 
            fill="none" 
            stroke={color} 
            strokeWidth={dims.sw} 
            strokeLinecap="round" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            className="transition-all duration-1000 ease-linear opacity-20"
            style={{ filter: 'blur(4px)' }}
          />

          {/* Main Progress Ring */}
          <motion.circle 
            cx={dims.w / 2} 
            cy={dims.w / 2} 
            r={dims.r} 
            fill="none" 
            stroke={color} 
            strokeWidth={dims.sw} 
            strokeLinecap="round" 
            strokeDasharray={circumference} 
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
            style={{
                filter: `drop-shadow(0 0 2px ${color})`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={timeRemaining}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={dims.fs} 
            style={{ 
                fontFamily: 'inherit', 
                fontWeight: 800, 
                color: color,
                textShadow: isLowTime ? `0 0 12px ${color}66` : 'none'
            }}
          >
            {timeRemaining}
          </motion.span>
        </div>
      </motion.div>

      {/* Decorative pulse rings for low time */}
      <AnimatePresence>
        {isLowTime && (
            <motion.div 
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-full h-full rounded-full border-2 z-0"
                style={{ borderColor: color }}
            />
        )}
      </AnimatePresence>
    </div>);
}

