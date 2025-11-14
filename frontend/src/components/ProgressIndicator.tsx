import React, { useEffect, useState } from 'react';
import './ProgressIndicator.css';

export interface ProgressStep {
  label: string;
  icon?: string;
}

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: ProgressStep[];
  animated?: boolean;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
  animated = true,
  showLabels = true,
  size = 'medium'
}) => {
  const [animatedSteps, setAnimatedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (animated) {
      // Animate steps sequentially
      const timer = setTimeout(() => {
        const completed = Array.from({ length: currentStep }, (_, i) => i);
        setAnimatedSteps(completed);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const completed = Array.from({ length: currentStep }, (_, i) => i);
      setAnimatedSteps(completed);
    }
  }, [currentStep, animated]);

  const getStepStatus = (index: number): 'completed' | 'active' | 'pending' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const isStepAnimated = (index: number): boolean => {
    return animatedSteps.includes(index);
  };

  return (
    <div className={`progress-indicator progress-indicator--${size}`} role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
      <div className="progress-indicator__track">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isAnimated = isStepAnimated(index);
          const showLine = index < steps.length - 1;

          return (
            <React.Fragment key={index}>
              <div 
                className={`progress-indicator__step progress-indicator__step--${status} ${isAnimated ? 'progress-indicator__step--animated' : ''}`}
                aria-current={status === 'active' ? 'step' : undefined}
              >
                <div className="progress-indicator__circle">
                  {status === 'completed' ? (
                    <svg className="progress-indicator__checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : step.icon ? (
                    <span className="progress-indicator__icon">{step.icon}</span>
                  ) : (
                    <span className="progress-indicator__number">{index + 1}</span>
                  )}
                </div>
                {showLabels && (
                  <div className="progress-indicator__label">{step.label}</div>
                )}
              </div>

              {showLine && (
                <div className={`progress-indicator__line progress-indicator__line--${status === 'completed' ? 'filled' : 'empty'}`}>
                  <div className="progress-indicator__line-fill" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
