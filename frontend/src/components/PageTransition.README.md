# Page Transition Components

This document provides usage examples for the page transition components implemented in task 7.

## Components

### 1. PageTransition

Wrapper component for smooth transitions between routes, modals, and popups.

**Usage Example - Route Transitions:**

```tsx
import { useLocation } from 'react-router-dom';
import { PageTransition } from './components';

function App() {
  const location = useLocation();
  
  return (
    <PageTransition transitionKey={location.pathname} type="fade">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recipes" element={<RecipeResults />} />
      </Routes>
    </PageTransition>
  );
}
```

**Usage Example - Modal:**

```tsx
import { PageTransition } from './components';

function Modal({ isOpen, children }) {
  return isOpen ? (
    <PageTransition transitionKey="modal" type="scale">
      <div className="modal">
        {children}
      </div>
    </PageTransition>
  ) : null;
}
```

**Usage Example - Drawer:**

```tsx
import { PageTransition } from './components';

function Drawer({ isOpen, children }) {
  return isOpen ? (
    <PageTransition transitionKey="drawer" type="slide">
      <div className="drawer">
        {children}
      </div>
    </PageTransition>
  ) : null;
}
```

**Props:**
- `transitionKey` (string): Unique key to trigger transition
- `type` ('fade' | 'slide' | 'scale'): Type of transition (default: 'fade')
- `timeout` (number): Duration in milliseconds (default: 300)
- `unmountOnExit` (boolean): Unmount on exit (default: true)
- `appear` (boolean): Run transition on initial mount (default: true)

---

### 2. ContentReveal

Component for staggered content reveal animations on page load or scroll.

**Usage Example - Simple Reveal:**

```tsx
import { ContentReveal } from './components';

function Section() {
  return (
    <ContentReveal animation="fadeUp">
      <h2>Welcome to Recipe Finder</h2>
      <p>Discover amazing recipes...</p>
    </ContentReveal>
  );
}
```

**Usage Example - Staggered Children:**

```tsx
import { ContentReveal } from './components';

function RecipeGrid({ recipes }) {
  return (
    <ContentReveal animation="fadeUp" stagger staggerDelay={100}>
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </ContentReveal>
  );
}
```

**Props:**
- `animation` ('fade' | 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale'): Animation type (default: 'fadeUp')
- `delay` (number): Delay before animation starts in ms (default: 0)
- `duration` (number): Animation duration in ms (default: 600)
- `threshold` (number): Intersection observer threshold 0-1 (default: 0.1)
- `triggerOnce` (boolean): Trigger only once (default: true)
- `stagger` (boolean): Apply stagger to children (default: false)
- `staggerDelay` (number): Delay between staggered children in ms (default: 100)

---

### 3. Parallax

Component for creating parallax scroll effects on background elements.

**Usage Example:**

```tsx
import { Parallax } from './components';

function HeroSection() {
  return (
    <div className="hero">
      <Parallax speed={0.3} direction="up">
        <img src="/background.jpg" alt="Background" />
      </Parallax>
      <div className="hero-content">
        <h1>Find Your Perfect Recipe</h1>
      </div>
    </div>
  );
}
```

**Props:**
- `speed` (number): Parallax speed multiplier 0-1 (default: 0.5)
- `direction` ('up' | 'down' | 'left' | 'right'): Movement direction (default: 'up')
- `disabled` (boolean): Disable parallax effect (default: false)

**Note:** Parallax is automatically disabled on mobile devices and when `prefers-reduced-motion` is set.

---

### 4. FilterTransition & FilterTransitionGroup

Components for smooth grid rearrangement when filters change.

**Usage Example:**

```tsx
import { FilterTransitionGroup, FilterTransition } from './components';

function RecipeResults({ recipes }) {
  return (
    <FilterTransitionGroup className="recipe-grid">
      {recipes.map(recipe => (
        <FilterTransition key={recipe.id} itemKey={recipe.id}>
          <RecipeCard recipe={recipe} />
        </FilterTransition>
      ))}
    </FilterTransitionGroup>
  );
}
```

**FilterTransition Props:**
- `itemKey` (string | number): Unique key for the item
- `timeout` (number): Transition duration in ms (default: 400)

---

## Accessibility

All transition components respect the user's motion preferences:

- When `prefers-reduced-motion: reduce` is set, transitions are nearly instant
- Parallax effects are disabled on mobile and with reduced motion
- All animations use GPU-accelerated properties (transform, opacity)

## Performance

- All components use `requestAnimationFrame` for smooth animations
- Parallax scroll handlers are throttled
- Transitions use `will-change` property for optimization
- Components clean up event listeners and animation frames on unmount
