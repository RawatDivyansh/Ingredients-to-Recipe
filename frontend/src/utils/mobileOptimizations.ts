/**
 * Mobile Optimization Utilities
 * Provides utilities for detecting mobile devices, optimizing animations,
 * and implementing haptic-style visual feedback
 */

// Device detection
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android/.test(navigator.userAgent);
};

// Animation timing adjustments for mobile
export const getAnimationDuration = (baseDuration: number): number => {
  if (!isMobileDevice()) return baseDuration;
  
  // Reduce animation duration by 30% on mobile for snappier feel
  return Math.round(baseDuration * 0.7);
};

export const getAnimationDelay = (baseDelay: number): number => {
  if (!isMobileDevice()) return baseDelay;
  
  // Reduce delays by 40% on mobile
  return Math.round(baseDelay * 0.6);
};

// Touch target validation
export const MINIMUM_TOUCH_TARGET = 44; // 44px minimum per Apple/Google guidelines

export const validateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.width >= MINIMUM_TOUCH_TARGET && rect.height >= MINIMUM_TOUCH_TARGET;
};

export const ensureTouchTarget = (element: HTMLElement): void => {
  const rect = element.getBoundingClientRect();
  
  if (rect.width < MINIMUM_TOUCH_TARGET) {
    element.style.minWidth = `${MINIMUM_TOUCH_TARGET}px`;
  }
  
  if (rect.height < MINIMUM_TOUCH_TARGET) {
    element.style.minHeight = `${MINIMUM_TOUCH_TARGET}px`;
  }
};

// Haptic-style visual feedback
export interface HapticFeedbackOptions {
  type?: 'light' | 'medium' | 'heavy';
  duration?: number;
}

export const triggerHapticFeedback = (
  element: HTMLElement,
  options: HapticFeedbackOptions = {}
): void => {
  const { type = 'medium', duration = 150 } = options;
  
  // Scale values based on feedback intensity
  const scaleMap = {
    light: 0.98,
    medium: 0.95,
    heavy: 0.92,
  };
  
  const scale = scaleMap[type];
  const originalTransform = element.style.transform;
  
  // Apply press-down effect
  element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
  element.style.transform = `scale(${scale})`;
  
  // Add visual feedback class
  element.classList.add('haptic-feedback-active');
  
  // Reset after duration
  setTimeout(() => {
    element.style.transform = originalTransform || 'scale(1)';
    element.classList.remove('haptic-feedback-active');
    
    // Clean up inline styles after transition
    setTimeout(() => {
      if (element.style.transform === 'scale(1)' || element.style.transform === originalTransform) {
        element.style.transform = '';
        element.style.transition = '';
      }
    }, duration);
  }, duration);
};

// Touch ripple effect
export interface RippleOptions {
  color?: string;
  duration?: number;
  size?: number;
}

export const createTouchRipple = (
  event: React.TouchEvent | React.MouseEvent,
  options: RippleOptions = {}
): void => {
  const { color = 'rgba(255, 255, 255, 0.6)', duration = 600, size } = options;
  
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  
  // Calculate ripple position
  const x = 'touches' in event 
    ? event.touches[0].clientX - rect.left 
    : (event as React.MouseEvent).clientX - rect.left;
  const y = 'touches' in event 
    ? event.touches[0].clientY - rect.top 
    : (event as React.MouseEvent).clientY - rect.top;
  
  // Create ripple element
  const ripple = document.createElement('span');
  ripple.className = 'touch-ripple';
  
  const rippleSize = size || Math.max(rect.width, rect.height) * 2;
  ripple.style.width = `${rippleSize}px`;
  ripple.style.height = `${rippleSize}px`;
  ripple.style.left = `${x - rippleSize / 2}px`;
  ripple.style.top = `${y - rippleSize / 2}px`;
  ripple.style.backgroundColor = color;
  ripple.style.animationDuration = `${duration}ms`;
  
  // Ensure parent has proper positioning
  const position = window.getComputedStyle(target).position;
  if (position === 'static') {
    target.style.position = 'relative';
  }
  
  // Ensure parent has overflow hidden
  target.style.overflow = 'hidden';
  
  target.appendChild(ripple);
  
  // Remove ripple after animation
  setTimeout(() => {
    ripple.remove();
  }, duration);
};

// Performance monitoring
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private rafId: number | null = null;
  private callbacks: Array<(fps: number) => void> = [];
  
  start(): void {
    if (this.rafId !== null) return;
    
    const measure = () => {
      const currentTime = performance.now();
      this.frameCount++;
      
      if (currentTime >= this.lastTime + 1000) {
        this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
        this.frameCount = 0;
        this.lastTime = currentTime;
        
        // Notify callbacks
        this.callbacks.forEach(callback => callback(this.fps));
      }
      
      this.rafId = requestAnimationFrame(measure);
    };
    
    this.rafId = requestAnimationFrame(measure);
  }
  
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  getFPS(): number {
    return this.fps;
  }
  
  onFPSUpdate(callback: (fps: number) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
  
  isPerformanceGood(): boolean {
    return this.fps >= 55; // Allow 5fps tolerance
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Adaptive animation configuration
export interface AdaptiveAnimationConfig {
  duration: number;
  delay: number;
  enabled: boolean;
}

export const getAdaptiveAnimationConfig = (
  baseDuration: number = 300,
  baseDelay: number = 0
): AdaptiveAnimationConfig => {
  // Disable animations if user prefers reduced motion
  if (prefersReducedMotion()) {
    return {
      duration: 0,
      delay: 0,
      enabled: false,
    };
  }
  
  // Adjust for mobile
  if (isMobileDevice()) {
    return {
      duration: getAnimationDuration(baseDuration),
      delay: getAnimationDelay(baseDelay),
      enabled: true,
    };
  }
  
  // Desktop - use base values
  return {
    duration: baseDuration,
    delay: baseDelay,
    enabled: true,
  };
};

// Throttle scroll events for better mobile performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Debounce for input events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Passive event listener support detection
export const supportsPassiveEvents = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  let supportsPassive = false;
  
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => {
        supportsPassive = true;
        return true;
      },
    });
    
    window.addEventListener('testPassive', null as any, opts);
    window.removeEventListener('testPassive', null as any, opts);
  } catch (e) {
    // Passive events not supported
  }
  
  return supportsPassive;
};

// Get optimal event listener options
export const getEventListenerOptions = (passive = true): boolean | AddEventListenerOptions => {
  if (!supportsPassiveEvents()) return false;
  
  return { passive };
};
