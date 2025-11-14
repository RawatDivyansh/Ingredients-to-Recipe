import React, { useState, useEffect } from 'react';
import './EnhancedLoadingState.css';

interface EnhancedLoadingStateProps {
  progress?: number; // 0-100
  showProgress?: boolean;
  showIllustration?: boolean;
  customMessages?: string[];
  longWaitThreshold?: number; // milliseconds
}

const defaultMessages = [
  'Finding the perfect recipes for you...',
  'Analyzing ingredient combinations...',
  'Checking our recipe database...',
  'Matching flavors and cuisines...',
  'Preparing delicious suggestions...',
  'Almost there, hang tight...',
];

const encouragingMessages = [
  'Great things take time! 🌟',
  'Your patience will be rewarded! 🎉',
  'Crafting something special for you! ✨',
  'Worth the wait, we promise! 🍳',
  'Good food is worth waiting for! 🍽️',
];

const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = ({
  progress,
  showProgress = false,
  showIllustration = true,
  customMessages,
  longWaitThreshold = 5000,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const messages = customMessages || defaultMessages;

  // Rotate messages every 2 seconds
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, [messages.length]);

  // Track elapsed time and show encouragement for long waits
  useEffect(() => {
    const startTime = Date.now();
    
    const timeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= longWaitThreshold) {
        setShowEncouragement(true);
      }
    }, 1000);

    return () => clearInterval(timeInterval);
  }, [longWaitThreshold]);

  const displayProgress = progress !== undefined ? progress : undefined;

  return (
    <div className="enhanced-loading-state">
      {showIllustration && (
        <div className="loading-illustration">
          <div className="cooking-pot">
            <div className="pot-body"></div>
            <div className="pot-handle pot-handle-left"></div>
            <div className="pot-handle pot-handle-right"></div>
            <div className="steam steam-1"></div>
            <div className="steam steam-2"></div>
            <div className="steam steam-3"></div>
          </div>
          <div className="cooking-utensils">
            <div className="spoon"></div>
            <div className="fork"></div>
          </div>
        </div>
      )}

      <div className="loading-content">
        <div className="loading-spinner-enhanced">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>

        <p className="loading-message" key={currentMessageIndex}>
          {messages[currentMessageIndex]}
        </p>

        {showProgress && displayProgress !== undefined && (
          <div className="loading-progress-container">
            <div className="loading-progress-bar">
              <div 
                className="loading-progress-fill"
                style={{ width: `${displayProgress}%` }}
              ></div>
            </div>
            <span className="loading-progress-percentage">
              {Math.round(displayProgress)}%
            </span>
          </div>
        )}

        {showEncouragement && (
          <p className="loading-encouragement">
            {encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]}
          </p>
        )}
      </div>
    </div>
  );
};

export default EnhancedLoadingState;
