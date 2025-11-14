import React, { useEffect, useState } from 'react';
import './MilestoneCelebration.css';

export interface MilestoneCelebrationProps {
  message: string;
  icon?: string;
  duration?: number;
  onComplete?: () => void;
  type?: 'success' | 'achievement' | 'milestone';
}

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  message,
  icon = '🎉',
  duration = 3000,
  onComplete,
  type = 'milestone'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`milestone-celebration milestone-celebration--${type} ${isExiting ? 'milestone-celebration--exiting' : ''}`}>
      <div className="milestone-celebration__content">
        <div className="milestone-celebration__icon">{icon}</div>
        <div className="milestone-celebration__message">{message}</div>
      </div>
      <div className="milestone-celebration__confetti">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="milestone-celebration__confetti-piece" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
};

export default MilestoneCelebration;
