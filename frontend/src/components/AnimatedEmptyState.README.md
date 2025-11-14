# AnimatedEmptyState Component

A reusable, animated empty state component that provides engaging feedback when no content is available or filters return no results.

## Features

- 🎨 **Animated Illustrations**: Floating icon animation with smooth transitions
- 📝 **Helpful Suggestions**: Optional list of actionable suggestions
- 🎯 **Call-to-Action**: Optional button to guide users to next steps
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop
- ♿ **Accessible**: ARIA labels, semantic HTML, and keyboard navigation
- 🎭 **Reduced Motion**: Respects `prefers-reduced-motion` preference
- 🎨 **Design System**: Uses CSS variables for consistent theming

## Usage

### Basic Example

```tsx
import AnimatedEmptyState from './components/AnimatedEmptyState';

<AnimatedEmptyState
  icon="🔍"
  title="No results found"
  message="We couldn't find any items matching your search."
/>
```

### With Suggestions

```tsx
<AnimatedEmptyState
  icon="🛒"
  title="Your Shopping List is Empty"
  message="Add missing ingredients from recipes to build your shopping list!"
  suggestions={[
    'View a recipe and click "Add to Shopping List"',
    'Missing ingredients will be automatically added',
    'Check off items as you shop'
  ]}
/>
```

### With Call-to-Action

```tsx
<AnimatedEmptyState
  icon="❤️"
  title="No Favorite Recipes Yet"
  message="Start exploring recipes and save your favorites to see them here!"
  suggestions={[
    'Browse popular recipes on the homepage',
    'Search for recipes with your ingredients',
    'Click the heart icon on any recipe to save it'
  ]}
  action={{
    label: 'Explore Recipes',
    onClick: () => navigate('/'),
    ariaLabel: 'Go to homepage to explore recipes'
  }}
/>
```

### With Custom Class

```tsx
<AnimatedEmptyState
  icon="🍳"
  title="No Recipes Found"
  message="Try adjusting your filters or adding more ingredients."
  className="custom-empty-state"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `icon` | `string` | Yes | Emoji or icon to display (e.g., "🔍", "🍳") |
| `title` | `string` | Yes | Main title text |
| `message` | `string` | Yes | Descriptive message explaining the empty state |
| `suggestions` | `string[]` | No | Optional list of helpful suggestions |
| `action` | `ActionConfig` | No | Optional call-to-action button |
| `className` | `string` | No | Optional custom class name |

### ActionConfig Type

```typescript
interface ActionConfig {
  label: string;           // Button text
  onClick: () => void;     // Click handler
  ariaLabel?: string;      // Optional ARIA label for accessibility
}
```

## Animation Details

### Entry Animation
- Component fades in and scales up (0.95 → 1.0)
- Duration: 500ms
- Easing: `cubic-bezier(0.4, 0.0, 0.2, 1)`

### Icon Animation
- Continuous floating effect
- Moves up and down 10px
- Duration: 3s infinite
- Easing: `ease-in-out`

### Content Stagger
- Title: 200ms delay
- Message: 300ms delay
- Suggestions: 400ms delay
- Each suggestion item: +100ms stagger
- Action button: 900ms delay

### Hover Effects
- Suggestion items slide right 4px on hover
- Action button lifts up 2px with enhanced shadow

## Accessibility

- Uses semantic HTML (`<h2>`, `<p>`, `<ul>`, `<button>`)
- Includes `role="status"` and `aria-live="polite"` for screen readers
- Icon marked with `aria-hidden="true"` (decorative)
- Action button supports custom `aria-label`
- Respects `prefers-reduced-motion` media query
- Minimum 44px touch targets on mobile

## Responsive Behavior

### Mobile (≤767px)
- Reduced padding: 32px 16px
- Smaller icon: 3rem
- Smaller title: 1.25rem
- Full-width action button
- Minimum 48px button height

### Tablet (768-1023px)
- Medium padding: 48px 32px
- Standard sizing

### Desktop (≥1024px)
- Full padding: 60px 40px
- Maximum width: 600px
- Centered with auto margins

## Styling

The component uses CSS variables from the design system:

```css
--color-primary
--color-primary-dark
--color-neutral-dark
--color-neutral-lighter
--color-text-primary
--color-text-secondary
--radius-sm, --radius-md, --radius-lg
--shadow-sm, --shadow-md, --shadow-lg
--duration-fast, --duration-normal, --duration-slow
--ease-default
```

## Examples in the App

### Recipe Results (No Matches)
```tsx
<AnimatedEmptyState
  icon="🔍"
  title="No recipes found"
  message="We couldn't find any recipes matching your criteria."
  suggestions={[
    'Removing some filters',
    'Adding more ingredients',
    'Trying different ingredient combinations',
  ]}
  action={{
    label: 'Back to Home',
    onClick: handleBackToHome,
  }}
/>
```

### Favorite Recipes (Empty)
```tsx
<AnimatedEmptyState
  icon="❤️"
  title="No Favorite Recipes Yet"
  message="Start exploring recipes and save your favorites to see them here!"
  suggestions={[
    'Browse popular recipes on the homepage',
    'Search for recipes with your ingredients',
    'Click the heart icon on any recipe to save it'
  ]}
  action={{
    label: 'Explore Recipes',
    onClick: () => navigate('/'),
    ariaLabel: 'Go to homepage to explore recipes'
  }}
/>
```

### Shopping List (Empty)
```tsx
<AnimatedEmptyState
  icon="🛒"
  title="Your Shopping List is Empty"
  message="Add missing ingredients from recipes to build your shopping list!"
  suggestions={[
    'View a recipe and click "Add to Shopping List"',
    'Missing ingredients will be automatically added',
    'Check off items as you shop'
  ]}
/>
```

## Best Practices

1. **Choose Appropriate Icons**: Use emojis that clearly represent the empty state context
2. **Write Clear Messages**: Explain why the state is empty and what users can do
3. **Provide Actionable Suggestions**: Give users specific next steps
4. **Include CTAs When Helpful**: Guide users to relevant actions
5. **Keep It Positive**: Use encouraging, friendly language
6. **Test Accessibility**: Verify with screen readers and keyboard navigation

## Related Components

- `IngredientEmptyState`: Specialized empty state for ingredient selection
- `SkeletonLoader`: Loading state placeholder
- `ErrorMessage`: Error state feedback
- `LoadingSpinner`: Loading indicator

## Performance

- Lightweight: ~2KB gzipped (CSS + JS)
- GPU-accelerated animations (transform, opacity)
- No external dependencies
- Optimized for 60fps animations
- Respects reduced motion preferences
