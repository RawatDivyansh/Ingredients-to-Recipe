import React, { useEffect, useState } from 'react';
import './CelebrationAnimation.css';

interface CelebrationAnimationProps {
  type?: 'confetti' | 'stars' | 'checkmark' | 'trophy';
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  type = 'confetti',
  message,
  duration = 3000,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const renderAnimation = () => {
    switch (type) {
      case 'confetti':
        return (
          <div className="celebration-confetti">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: getRandomColor()
                }}
              />
            ))}
          </div>
        );
      
      case 'stars':
        return (
          <div className="celebration-stars">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              >
                ⭐
              </div>
            ))}
          </div>
        );
      
      case 'checkmark':
        return (
          <div className="celebration-checkmark">
            <div className="checkmark-circle">
              <div className="checkmark-icon">✓</div>
            </div>
          </div>
        );
      
      case 'trophy':
        return (
          <div className="celebration-trophy">
            <div className="trophy-icon">🏆</div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#27ae60', '#3498db', '#e74c3c', '#f39c12', 
      '#9b59b6', '#1abc9c', '#e67e22', '#2ecc71'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`celebration-container ${isVisible ? 'visible' : ''}`}>
      {renderAnimation()}
      {message && (
        <div className="celebration-message">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default CelebrationAnimation;
