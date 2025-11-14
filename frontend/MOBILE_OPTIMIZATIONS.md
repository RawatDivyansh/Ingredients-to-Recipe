# Mobile Optimizations Guide

This document describes the mobile optimizations implemented for the Recipe Finder application to ensure smooth performance and excellent user experience on mobile devices.

## Overview

The mobile optimizations focus on three key areas:
1. **Touch-friendly interactions** - Ensuring all interactive elements meet minimum touch target sizes
2. **Performance monitoring** - Detecting and adapting to low-performance devices
3. **Animation optimization** - Reducing animation complexity on mobile devices

## Touch Optimizations

### Minimum Touch Targets
All interactive elements meet the minimum 44px × 44px touch target size as recommended by Apple's Human Interface Guidelines and Google's Material Design.

**Implementation:**
- Buttons, links, and interactive elements have `min-height: 44px` and `min-width: 44px`
- Tag remove buttons have adequate padding to ensure touch-friendly tap areas
- Input fields have `min-height: 48px` for comfortable typing

### Touch Feedback
Visual feedback is provided for all touch interactions:

**Classes:**
- `.touch-feedback` - Provides scale-down effect on touch
- `.touch-ripple` - Creates ripple effect on tap
- `.touch-flash` - Flash background color on selection
- `.touch-glow` - Glow effect for important actions

**Usage Example:**
```tsx
<button className="touch-target touch-ripple">
  Click Me
</button>
```

### Animation Timing Adjustments
Mobile animations are faster to feel more responsive:
- Fast: 100ms (was 150ms)
- Normal: 200ms (was 300ms)
- Slow: 350ms (was 500ms)

## Performance Monitoring

### usePerformanceMonitor Hook
Monitors FPS and automatically applies optimizations when performance drops below 50fps.

**Usage:**
```tsx
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

const { fps, isLowPerformance } = usePerformanceMonitor(50);
```

**Features:**
- Measures FPS in real-time
- Applies `.low-performance` class to `<html>` when FPS drops
- Only runs on mobile devices (width ≤ 767px)

### useReducedAnimations Hook
Detects low-end devices and user preferences for reduced motion.

**Usage:**
```tsx
import { useReducedAnimations } from '../hooks/usePerformanceMonitor';

const shouldReduce = useReducedAnimations();
```

**Detection Criteria:**
- User has `prefers-reduced-motion: reduce` enabled
- Device has less than 4GB RAM
- Network connection is slow-2g or 2g

### PerformanceMonitor Component
Add this component to your app to enable automatic performance monitoring:

```tsx
import { PerformanceMonitor } from './components';

function App() {
  return (
    <>
      <PerformanceMonitor />
      {/* Your app content */}
    </>
  );
}
```

## Performance Optimizations

### CSS Optimizations

**Low Performance Mode:**
When FPS drops below threshold, the following optimizations are applied:
- Animation durations reduced to 0.1s
- Complex animations (shimmer, pulse, float, gradient-shift) disabled
- Hover effects simplified
- Skeleton loaders show static background

**Mobile-Specific:**
- Parallax effects disabled
- Gradient animations simplified to solid colors
- Shadow complexity reduced
- Blur effects removed
- Image rendering optimized

### CSS Containment
Applied to frequently updated components for better performance:
```css
.recipe-card,
.animated-ingredient-tag,
.filter-panel,
.collapsible-section {
  contain: layout style paint;
}
```

### GPU Acceleration
Transform and opacity are used for animations to leverage GPU:
```css
.gpu-accelerate {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

## Collapsible Sections

The `CollapsibleSection` component provides smooth expand/collapse animations optimized for mobile.

**Usage:**
```tsx
import { CollapsibleSection } from './components';

<CollapsibleSection 
  title="Filter Options" 
  icon="🔍"
  defaultExpanded={false}
>
  <div>Your content here</div>
</CollapsibleSection>
```

**Features:**
- Smooth height animation
- Touch-friendly header (min 48px)
- Faster animations on mobile (150ms vs 300ms)
- Respects `prefers-reduced-motion`
- Automatic performance optimization in low-performance mode

## Mobile-Specific CSS Classes

### Utility Classes
- `.mobile-full-width` - Full width on mobile
- `.mobile-hidden` - Hide on mobile
- `.mobile-only` - Show only on mobile
- `.mobile-grid` - Single column grid on mobile
- `.mobile-flex` - Column flex layout on mobile
- `.touch-spacing` - Touch-friendly spacing (16px)

### Safe Area Support (iOS Notch)
```css
.mobile-safe-top {
  padding-top: max(16px, env(safe-area-inset-top));
}
```

Available classes:
- `.mobile-safe-top`
- `.mobile-safe-bottom`
- `.mobile-safe-left`
- `.mobile-safe-right`
- `.mobile-safe-all`

## Best Practices

### 1. Always Use Touch Targets
```tsx
// ✅ Good
<button className="touch-target">Click</button>

// ❌ Bad
<button style={{ width: '20px', height: '20px' }}>×</button>
```

### 2. Add Touch Feedback
```tsx
// ✅ Good
<div className="recipe-card touch-feedback" onClick={handleClick}>

// ❌ Bad
<div className="recipe-card" onClick={handleClick}>
```

### 3. Optimize Animations
```tsx
// ✅ Good - Use transform and opacity
.animate {
  transform: translateY(0);
  opacity: 1;
  transition: transform 200ms, opacity 200ms;
}

// ❌ Bad - Avoid animating layout properties
.animate {
  height: 100px;
  margin-top: 20px;
  transition: height 200ms, margin-top 200ms;
}
```

### 4. Test on Real Devices
- Test on actual mobile devices, not just browser DevTools
- Test on both iOS and Android
- Test on low-end devices (< 4GB RAM)
- Test with slow network connections

### 5. Monitor Performance
```tsx
// Add PerformanceMonitor to your app
import { PerformanceMonitor } from './components';

function App() {
  return (
    <>
      <PerformanceMonitor />
      {/* Your app */}
    </>
  );
}
```

## Accessibility

All mobile optimizations maintain accessibility:
- Touch targets meet WCAG 2.1 Level AAA (44px minimum)
- Focus indicators are visible and touch-friendly (3px outline)
- Animations respect `prefers-reduced-motion`
- Screen readers announce state changes
- Keyboard navigation works on all devices

## Browser Support

Mobile optimizations are tested and supported on:
- iOS Safari 14+
- Chrome Mobile (Android 10+)
- Samsung Internet
- Firefox Mobile

## Performance Targets

The mobile optimizations aim to achieve:
- **60 FPS** for all animations
- **< 100ms** touch response time
- **< 2.5s** Largest Contentful Paint (LCP)
- **< 0.1** Cumulative Layout Shift (CLS)

## Troubleshooting

### Animations are too slow on mobile
Check if performance monitoring is enabled and FPS is being measured correctly.

### Touch targets are too small
Ensure you're using the `.touch-target` class or setting `min-width: 44px; min-height: 44px;`

### Performance is still poor
1. Check if `PerformanceMonitor` component is added to your app
2. Verify CSS containment is applied to frequently updated components
3. Ensure animations use `transform` and `opacity` only
4. Check for memory leaks in React components

## Future Enhancements

Planned improvements:
- Adaptive image loading based on device capabilities
- Service worker for offline support
- Progressive Web App (PWA) features
- Haptic feedback API integration (where supported)
