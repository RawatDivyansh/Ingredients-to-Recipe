import React, { useEffect, useState, useRef } from 'react';
import './OnboardingHint.css';

interface OnboardingHintProps {
  step: number;
  totalSteps: number;
  message: string;
  targetElement: string;
  onDismiss: () => void;
  onNext: () => void;
  storageKey?: string;
}

const OnboardingHint: React.FC<OnboardingHintProps> = ({
  step,
  totalSteps,
  message,
  targetElement,
  onDismiss,
  onNext,
  storageKey = 'onboarding-completed'
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(storageKey);
    if (completed === 'true') {
      return;
    }

    // Find target element and calculate position
    const target = document.querySelector(targetElement);
    if (target) {
      const rect = target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      // Calculate hint position (below the target element)
      const hintTop = rect.bottom + scrollTop + 20;
      const hintLeft = rect.left + scrollLeft + rect.width / 2;

      setPosition({ top: hintTop, left: hintLeft });
      
      // Show hint after a brief delay
      setTimeout(() => setIsVisible(true), 300);
    }
  }, [targetElement, storageKey]);

  useEffect(() => {
    // Reposition on window resize
    const handleResize = () => {
      const target = document.querySelector(targetElement);
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        const hintTop = rect.bottom + scrollTop + 20;
        const hintLeft = rect.left + scrollLeft + rect.width / 2;

        setPosition({ top: hintTop, left: hintLeft });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [targetElement]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      localStorage.setItem(storageKey, 'true');
      onDismiss();
    }, 300);
  };

  const handleNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (step === totalSteps) {
        localStorage.setItem(storageKey, 'true');
      }
      onNext();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      localStorage.setItem(storageKey, 'true');
      onDismiss();
    }, 300);
  };

  if (!isVisible && localStorage.getItem(storageKey) === 'true') {
    return null;
  }

  return (
    <>
      {/* Spotlight overlay */}
      <div className={`onboarding-overlay ${isVisible ? 'visible' : ''}`}>
        <div className="spotlight" data-target={targetElement}></div>
      </div>

      {/* Hint bubble */}
      <div
        ref={hintRef}
        className={`onboarding-hint ${isVisible ? 'visible' : ''}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <div className="hint-arrow"></div>
        <div className="hint-content">
          <p className="hint-message">{message}</p>
          
          {/* Progress dots */}
          <div className="hint-progress">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span
                key={i}
                className={`progress-dot ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'completed' : ''}`}
              ></span>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="hint-actions">
            <button className="hint-button skip" onClick={handleSkip}>
              Skip
            </button>
            <div className="hint-nav">
              {step < totalSteps ? (
                <button className="hint-button next" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button className="hint-button done" onClick={handleDismiss}>
                  Got it!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingHint;
