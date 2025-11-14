import React, { useEffect, useState } from 'react';
import './SuccessFeedback.css';

export interface SuccessFeedbackProps {
  message?: string;
  duration?: number;
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
}

const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  message = 'Success!',
  duration = 2000,
  onComplete,
  size = 'medium',
  showMessage = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

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
    <div className={`success-feedback success-feedback--${size} ${isExiting ? 'success-feedback--exiting' : ''}`}>
      <div className="success-feedback__checkmark-container">
        <svg className="success-feedback__checkmark" viewBox="0 0 52 52">
          <circle className="success-feedback__checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="success-feedback__checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>
      {showMessage && (
        <div className="success-feedback__message">{message}</div>
      )}
    </div>
  );
};

export default SuccessFeedback;
