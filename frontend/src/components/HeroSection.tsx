import React, { useEffect, useState, useRef } from 'react';
import './HeroSection.css';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  animated?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title, 
  subtitle, 
  animated = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animated) {
      // Trigger animations after component mounts
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  // Parallax effect on scroll
  useEffect(() => {
    if (!animated) return;

    const handleScroll = () => {
      // Only update if user prefers motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [animated]);

  // Food icons for floating animation
  const foodIcons = ['🍅', '🥕', '🧅', '🥬', '🍄', '🌶️'];

  return (
    <div className="hero-section" ref={heroRef}>
      <div className="hero-gradient-background" />
      
      {/* Floating food icons with parallax */}
      <div className="hero-floating-icons">
        {foodIcons.map((icon, index) => (
          <span
            key={index}
            className="floating-icon"
            style={{
              left: `${15 + index * 15}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${3 + (index % 3)}s`,
              transform: `translateY(${scrollY * (0.1 + index * 0.05)}px)`
            }}
          >
            {icon}
          </span>
        ))}
      </div>

      {/* Hero content */}
      <div className="hero-content">
        <h1 
          className={`hero-title ${isVisible ? 'fade-in-visible' : ''}`}
          style={{ animationDelay: '0.2s' }}
        >
          {title}
        </h1>
        <p 
          className={`hero-subtitle ${isVisible ? 'fade-in-visible' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
