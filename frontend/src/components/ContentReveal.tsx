import React, { useEffect, useRef, useState } from 'react';
import './ContentReveal.css';

export type RevealAnimation = 'fade' | 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale';

interface ContentRevealProps {
  children: React.ReactNode;
  animation?: RevealAnimation;
  delay?: number;
  duration?: number;
  threshold?: number;
  triggerOnce?: boolean;
  stagger?: boolean;
  staggerDelay?: number;
  className?: string;
}

/**
 * ContentReveal component for staggered content reveal animations on page load or scroll
 * 
 * @param children - Content to be revealed
 * @param animation - Type of reveal animation (default: 'fadeUp')
 * @param delay - Delay before animation starts in milliseconds (default: 0)
 * @param duration - Duration of animation in milliseconds (default: 600)
 * @param threshold - Intersection observer threshold (0-1, default: 0.1)
 * @param triggerOnce - Whether to trigger animation only once (default: true)
 * @param stagger - Whether to apply stagger effect to children (default: false)
 * @param staggerDelay - Delay between staggered children in milliseconds (default: 100)
 * @param className - Additional CSS classes
 */
export const ContentReveal: React.FC<ContentRevealProps> = ({
  children,
  animation = 'fadeUp',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
  stagger = false,
  staggerDelay = 100,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, triggerOnce]);

  const style: React.CSSProperties = {
    '--reveal-delay': `${delay}ms`,
    '--reveal-duration': `${duration}ms`,
  } as React.CSSProperties;

  if (stagger && React.Children.count(children) > 1) {
    return (
      <div
        ref={elementRef}
        className={`content-reveal ${className}`}
        style={style}
      >
        {React.Children.map(children, (child, index) => (
          <div
            className={`content-reveal-item content-reveal-${animation} ${
              isVisible ? 'content-reveal-visible' : ''
            }`}
            style={{
              '--reveal-delay': `${delay + index * staggerDelay}ms`,
              '--reveal-duration': `${duration}ms`,
            } as React.CSSProperties}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`content-reveal content-reveal-${animation} ${
        isVisible ? 'content-reveal-visible' : ''
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default ContentReveal;
