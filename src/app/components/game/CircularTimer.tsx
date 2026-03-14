import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface CircularTimerProps {
  timeRemaining: number;
  totalTime: number;
  onExpire: () => void;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CircularTimer({ timeRemaining, totalTime, onExpire, isActive, size = 'md' }: CircularTimerProps) {
  const hasExpired = useRef(false);

  useEffect(() => {
    if (timeRemaining <= 0 && !hasExpired.current && isActive) {
      hasExpired.current = true;
      onExpire();
    }
    if (timeRemaining > 0) {
      hasExpired.current = false;
    }
  }, [timeRemaining, onExpire, isActive]);

  const dims = size === 'sm' ? { w: 56, r: 22, sw: 4, fs: 'text-sm' }
    : size === 'lg' ? { w: 110, r: 44, sw: 6, fs: 'text-2xl' }
    : { w: 80, r: 32, sw: 5, fs: 'text-xl' };

  const circumference = 2 * Math.PI * dims.r;
  const progress = timeRemaining / totalTime;
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = () => {
    if (timeRemaining > totalTime * 0.66) return '#059669';
    if (timeRemaining > totalTime * 0.33) return '#d97706';
    return '#e11d48';
  };

  const isPulsing = timeRemaining <= 10 && timeRemaining > 0 && isActive;

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        animate={isPulsing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, repeat: isPulsing ? Infinity : 0 }}
        className="relative"
      >
        <svg width={dims.w} height={dims.w} viewBox={`0 0 ${dims.w} ${dims.w}`}>
          <circle cx={dims.w / 2} cy={dims.w / 2} r={dims.r}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={dims.sw} />
          <circle cx={dims.w / 2} cy={dims.w / 2} r={dims.r}
            fill="none"
            stroke={getColor()}
            strokeWidth={dims.sw}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${dims.w / 2} ${dims.w / 2})`}
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
              filter: `drop-shadow(0 0 6px ${getColor()})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={dims.fs} style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, color: getColor() }}>
            {timeRemaining}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
