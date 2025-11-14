import React, { useEffect, useState } from 'react';
import './MatchScoreIndicator.css';

export interface MatchScoreIndicatorProps {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animated?: boolean;
  type?: 'circular' | 'linear';
}

const MatchScoreIndicator: React.FC<MatchScoreIndicatorProps> = ({
  score,
  size = 'medium',
  showLabel = true,
  animated = true,
  type = 'circular'
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimatedScore(score);
      return;
    }

    const duration = 1000;
    const startTime = Date.now();
    const startScore = 0;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentScore = startScore + (score - startScore) * easeOut;

      setAnimatedScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, animated]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'great';
    if (score >= 50) return 'good';
    return 'fair';
  };

  const scoreColor = getScoreColor(animatedScore);

  if (type === 'circular') {
    const radius = size === 'small' ? 30 : size === 'large' ? 50 : 40;
    const strokeWidth = size === 'small' ? 4 : size === 'large' ? 6 : 5;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
      <div className={`match-score-indicator match-score-indicator--circular match-score-indicator--${size} match-score-indicator--${scoreColor}`}>
        <svg height={radius * 2} width={radius * 2}>
          <circle
            className="match-score-indicator__background"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className="match-score-indicator__progress"
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="match-score-indicator__value">
          {Math.round(animatedScore)}%
        </div>
      </div>
    );
  }

  // Linear type
  return (
    <div className={`match-score-indicator match-score-indicator--linear match-score-indicator--${size} match-score-indicator--${scoreColor}`}>
      <div className="match-score-indicator__track">
        <div 
          className="match-score-indicator__fill"
          style={{ width: `${animatedScore}%` }}
        />
      </div>
      {showLabel && (
        <div className="match-score-indicator__label">
          {Math.round(animatedScore)}% Match
        </div>
      )}
    </div>
  );
};

export default MatchScoreIndicator;
