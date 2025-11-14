import { useEffect } from 'react';
import { usePerformanceMonitor, useReducedAnimations } from '../hooks/usePerformanceMonitor';

/**
 * Performance Monitor Component
 * Monitors FPS and applies performance optimizations when needed
 * This component doesn't render anything, it just monitors performance
 */
const PerformanceMonitor: React.FC = () => {
  const { fps, isLowPerformance } = usePerformanceMonitor(50);
  const shouldReduceAnimations = useReducedAnimations();

  useEffect(() => {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] FPS: ${fps}, Low Performance: ${isLowPerformance}`);
    }

    // Apply performance class to body for CSS optimizations
    if (isLowPerformance) {
      document.body.classList.add('low-performance-device');
    } else {
      document.body.classList.remove('low-performance-device');
    }
  }, [fps, isLowPerformance]);

  useEffect(() => {
    if (shouldReduceAnimations) {
      document.body.classList.add('reduced-animations-device');
    } else {
      document.body.classList.remove('reduced-animations-device');
    }
  }, [shouldReduceAnimations]);

  // This component doesn't render anything
  return null;
};

export default PerformanceMonitor;
