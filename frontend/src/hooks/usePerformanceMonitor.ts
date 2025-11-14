import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
}

/**
 * Hook to monitor animation performance and detect low FPS
 * Helps maintain 60fps by detecting performance issues
 */
export const usePerformanceMonitor = (threshold: number = 50): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    isLowPerformance: false,
  });

  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const rafIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Only monitor on mobile devices
    const isMobile = window.innerWidth <= 767;
    if (!isMobile) {
      return;
    }

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;

      frameCountRef.current++;

      // Calculate FPS every second
      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        const frameTime = delta / frameCountRef.current;
        const isLowPerformance = fps < threshold;

        setMetrics({
          fps,
          frameTime,
          isLowPerformance,
        });

        // Apply performance optimizations if FPS is low
        if (isLowPerformance) {
          document.documentElement.classList.add('low-performance');
        } else {
          document.documentElement.classList.remove('low-performance');
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      document.documentElement.classList.remove('low-performance');
    };
  }, [threshold]);

  return metrics;
};

/**
 * Hook to detect if device is mobile
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};

/**
 * Hook to reduce animation complexity on low-end devices
 */
export const useReducedAnimations = (): boolean => {
  const [shouldReduce, setShouldReduce] = useState(false);

  useEffect(() => {
    // Check for user preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for low-end device indicators
    const isLowEndDevice = 
      // Low memory
      ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 4) ||
      // Slow connection
      ((navigator as any).connection && 
      (((navigator as any).connection.effectiveType === 'slow-2g') || 
       ((navigator as any).connection.effectiveType === '2g')));

    setShouldReduce(prefersReducedMotion || isLowEndDevice);

    if (prefersReducedMotion || isLowEndDevice) {
      document.documentElement.classList.add('reduced-animations');
    }

    return () => {
      document.documentElement.classList.remove('reduced-animations');
    };
  }, []);

  return shouldReduce;
};
