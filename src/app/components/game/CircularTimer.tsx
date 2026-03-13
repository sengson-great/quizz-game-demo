import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface CircularTimerProps {
  timeRemaining: number;
  totalTime: number;
  onExpire: () => void;
  isActive: boolean;
}

export function CircularTimer({ timeRemaining, totalTime, onExpire, isActive }: CircularTimerProps) {
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

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = timeRemaining / totalTime;
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = () => {
    if (timeRemaining > 20) return '#059669';
    if (timeRemaining > 10) return '#d97706';
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
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle cx="55" cy="55" r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 55 55)"
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
              filter: `drop-shadow(0 0 6px ${getColor()})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: getColor() }}>
            {timeRemaining}
          </span>
        </div>
      </motion.div>
    </div>
  );
}