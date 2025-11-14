import React, { useState, useRef, useEffect, useCallback } from 'react';
import './AnimatedTooltip.css';

export interface AnimatedTooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactNode;
  disabled?: boolean;
}

const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  content,
  position = 'top',
  delay = 300,
  children,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [computedPosition, setComputedPosition] = useState(position);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Smart positioning to avoid screen edges
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 10;

    let newPosition = position;

    // Check if tooltip would overflow on the preferred position
    switch (position) {
      case 'top':
        if (triggerRect.top - tooltipRect.height < padding) {
          newPosition = 'bottom';
        }
        break;
      case 'bottom':
        if (triggerRect.bottom + tooltipRect.height > viewportHeight - padding) {
          newPosition = 'top';
        }
        break;
      case 'left':
        if (triggerRect.left - tooltipRect.width < padding) {
          newPosition = 'right';
        }
        break;
      case 'right':
        if (triggerRect.right + tooltipRect.width > viewportWidth - padding) {
          newPosition = 'left';
        }
        break;
    }

    // Additional check for horizontal overflow on top/bottom positions
    if (newPosition === 'top' || newPosition === 'bottom') {
      const tooltipLeft = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      if (tooltipLeft < padding) {
        // Would overflow left, keep position but adjust in CSS
      } else if (tooltipLeft + tooltipRect.width > viewportWidth - padding) {
        // Would overflow right, keep position but adjust in CSS
      }
    }

    setComputedPosition(newPosition);
  }, [position]);

  const handleMouseEnter = () => {
    if (disabled || isMobile) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after tooltip is rendered
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleClick = () => {
    if (isMobile && !disabled) {
      setIsVisible(!isVisible);
      if (!isVisible) {
        setTimeout(calculatePosition, 0);
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="animated-tooltip-wrapper"
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          className={`animated-tooltip animated-tooltip--${computedPosition} ${
            isVisible ? 'animated-tooltip--visible' : ''
          }`}
          role="tooltip"
          aria-live="polite"
        >
          <div className="animated-tooltip__content">
            {content}
          </div>
          <div className={`animated-tooltip__arrow animated-tooltip__arrow--${computedPosition}`} />
          {isMobile && (
            <button
              className="animated-tooltip__dismiss"
              onClick={handleDismiss}
              aria-label="Dismiss tooltip"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AnimatedTooltip;
