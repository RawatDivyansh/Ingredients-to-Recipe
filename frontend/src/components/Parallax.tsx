import React, { useEffect, useRef, useState } from 'react';
import './Parallax.css';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

/**
 * Parallax component for creating parallax scroll effects on background elements
 * 
 * @param children - Content to apply parallax effect to
 * @param speed - Parallax speed multiplier (default: 0.5, range: 0-1)
 * @param direction - Direction of parallax movement (default: 'up')
 * @param disabled - Whether to disable parallax effect (default: false)
 * @param className - Additional CSS classes
 */
export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
  disabled = false,
  className = '',
}) => {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const element = elementRef.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const scrolled = window.scrollY;
        const elementTop = rect.top + scrolled;
        const windowHeight = window.innerHeight;

        // Calculate offset based on element position relative to viewport
        const elementCenter = elementTop + rect.height / 2;
        const viewportCenter = scrolled + windowHeight / 2;
        const distance = viewportCenter - elementCenter;

        setOffset(distance * speed);
      });
    };

    // Initial calculation
    handleScroll();

    // Throttled scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [speed, disabled]);

  const getTransform = () => {
    if (disabled) return 'none';

    switch (direction) {
      case 'up':
        return `translateY(${-offset}px)`;
      case 'down':
        return `translateY(${offset}px)`;
      case 'left':
        return `translateX(${-offset}px)`;
      case 'right':
        return `translateX(${offset}px)`;
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={elementRef}
      className={`parallax ${className}`}
      style={{
        transform: getTransform(),
        willChange: disabled ? 'auto' : 'transform',
      }}
    >
      {children}
    </div>
  );
};

export default Parallax;
