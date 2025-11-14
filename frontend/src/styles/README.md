# Design System Documentation

## Overview

This design system provides a comprehensive set of CSS variables, animations, and utility classes for building consistent, engaging user interfaces in the Recipe Finder application.

## Files

- **variables.css** - CSS custom properties for colors, typography, spacing, shadows, and timing
- **keyframes.css** - Reusable animation keyframe definitions
- **animations.css** - Animation utility classes and transition helpers
- **responsive.css** - Responsive design utilities

## Usage

### CSS Variables

All design tokens are available as CSS custom properties:

```css
.my-component {
  color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-default);
}
```

### Animation Classes

Apply pre-built animations using utility classes:

```html
<!-- Entrance animations -->
<div class="animate-fade-in-up">Fades in while moving up</div>
<div class="animate-bounce-in">Bounces in</div>
<div class="animate-slide-in-left">Slides in from left</div>

<!-- Continuous animations -->
<div class="animate-pulse">Pulses continuously</div>
<div class="animate-float">Floats gently</div>
<div class="animate-shimmer">Shimmer effect for loading</div>

<!-- Hover effects -->
<button class="hover-lift">Lifts on hover</button>
<div class="hover-scale">Scales on hover</div>
<div class="hover-glow">Glows on hover</div>
```

### Animation Modifiers

Control animation timing and delays:

```html
<!-- Speed modifiers -->
<div class="animate-fade-in animate-fast">Fast animation (150ms)</div>
<div class="animate-fade-in animate-slow">Slow animation (500ms)</div>

<!-- Delay modifiers -->
<div class="animate-fade-in animate-delay-200">Delayed 200ms</div>
<div class="animate-fade-in animate-delay-500">Delayed 500ms</div>
```

### Staggered Animations

Create staggered entrance effects:

```html
<div class="stagger-children">
  <div>Item 1 (0ms delay)</div>
  <div>Item 2 (100ms delay)</div>
  <div>Item 3 (200ms delay)</div>
  <div>Item 4 (300ms delay)</div>
</div>
```

### Transition Utilities

Apply smooth transitions:

```html
<div class="transition-all hover-lift">Smooth transitions on all properties</div>
<div class="transition-colors">Smooth color transitions</div>
<div class="transition-transform">Smooth transform transitions</div>
```

### Loading States

```html
<!-- Skeleton loaders -->
<div class="skeleton" style="width: 200px; height: 20px;"></div>
<div class="skeleton skeleton-circle" style="width: 50px; height: 50px;"></div>

<!-- Spinners -->
<div class="spinner"></div>
<div class="spinner spinner-sm"></div>
<div class="spinner spinner-lg"></div>
```

## Color Palette

### Primary Colors
- `--color-primary`: #27ae60 (Green)
- `--color-secondary`: #3498db (Blue)
- `--color-accent`: #e74c3c (Red)

### Neutral Colors
- `--color-neutral-dark`: #2c3e50
- `--color-neutral-mid`: #7f8c8d
- `--color-neutral-light`: #ecf0f1

### Gradients
- `--gradient-primary`: Green gradient
- `--gradient-secondary`: Blue gradient
- `--gradient-accent`: Red gradient
- `--gradient-hero`: Multi-color hero gradient

### Category Gradients
- `--gradient-protein`: Red gradient
- `--gradient-vegetable`: Green gradient
- `--gradient-grain`: Orange gradient
- `--gradient-dairy`: Blue gradient
- `--gradient-spice`: Purple gradient

## Typography Scale

- `--font-size-hero`: 3rem (48px) - Hero headings
- `--font-size-h1`: 2.5rem (40px) - Main headings
- `--font-size-h2`: 2rem (32px) - Section headings
- `--font-size-h3`: 1.5rem (24px) - Subsection headings
- `--font-size-body`: 1rem (16px) - Body text
- `--font-size-small`: 0.875rem (14px) - Small text
- `--font-size-tiny`: 0.75rem (12px) - Tiny text

## Spacing System

- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)
- `--spacing-3xl`: 4rem (64px)

## Animation Timing

### Durations
- `--duration-fast`: 150ms - Quick micro-interactions
- `--duration-normal`: 300ms - Standard transitions
- `--duration-slow`: 500ms - Page transitions
- `--duration-slower`: 800ms - Complex animations

### Easing Functions
- `--ease-default`: cubic-bezier(0.4, 0.0, 0.2, 1) - Material Design
- `--ease-in`: cubic-bezier(0.4, 0.0, 1, 1)
- `--ease-out`: cubic-bezier(0.0, 0.0, 0.2, 1)
- `--ease-in-out`: cubic-bezier(0.4, 0.0, 0.2, 1)
- `--ease-bounce`: cubic-bezier(0.68, -0.55, 0.265, 1.55)
- `--ease-elastic`: cubic-bezier(0.68, -0.6, 0.32, 1.6)

## Accessibility

### Reduced Motion

The design system automatically respects the `prefers-reduced-motion` user preference:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations are disabled or significantly reduced */
}
```

All continuous animations (pulse, float, shimmer, etc.) are completely disabled when reduced motion is preferred.

### Focus Indicators

Use focus utility classes for keyboard navigation:

```html
<button class="focus-glow">Button with glow focus</button>
<input class="focus-ring" />
```

## Performance Optimization

### GPU Acceleration

For smooth animations, use GPU-accelerated properties:

```html
<div class="gpu-accelerated">Optimized for performance</div>
```

### Will-Change

Hint the browser about upcoming animations:

```html
<div class="will-change-transform">Will animate transform</div>
<div class="will-change-opacity">Will animate opacity</div>
```

**Important:** Remove `will-change` after animation completes to avoid memory issues.

## Best Practices

1. **Use CSS variables** for all colors, spacing, and timing to maintain consistency
2. **Prefer transform and opacity** for animations (GPU-accelerated)
3. **Keep animations subtle** - don't overdo it
4. **Test with reduced motion** enabled
5. **Use appropriate durations** - fast for micro-interactions, slow for page transitions
6. **Stagger animations** for lists and groups of elements
7. **Clean up animations** - remove will-change after animations complete
8. **Test on mobile devices** - ensure 60fps performance

## Examples

### Animated Button

```css
.cta-button {
  background: var(--gradient-primary);
  color: white;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-default);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.cta-button:active {
  transform: translateY(0);
}
```

### Animated Card

```css
.recipe-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-default);
}

.recipe-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.recipe-card img {
  transition: transform var(--duration-normal) var(--ease-default);
}

.recipe-card:hover img {
  transform: scale(1.05);
}
```

### Loading Skeleton

```html
<div class="skeleton" style="width: 100%; height: 200px; margin-bottom: var(--spacing-md);"></div>
<div class="skeleton skeleton-text" style="width: 80%;"></div>
<div class="skeleton skeleton-text" style="width: 60%;"></div>
```

## Testing

Open `design-system-test.html` in a browser to see all animations and utilities in action.

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Older browsers: Graceful degradation with fallbacks
