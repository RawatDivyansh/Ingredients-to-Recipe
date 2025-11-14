# AnimatedTooltip Component

An accessible, animated tooltip component with smart positioning and mobile support.

## Features

- **Fade-in animation** with configurable delay
- **Smart positioning** that automatically adjusts to avoid screen edges
- **Arrow pointer** that points to the trigger element
- **Mobile-friendly** with tap-to-show and dismissible functionality
- **Accessible** with ARIA attributes and keyboard support
- **Respects reduced motion** preferences

## Usage

### Basic Usage

```tsx
import { AnimatedTooltip } from '../components';

<AnimatedTooltip content="This is helpful information">
  <button>Hover me</button>
</AnimatedTooltip>
```

### With Custom Position

```tsx
<AnimatedTooltip 
  content="Tooltip appears on the right" 
  position="right"
>
  <span>Hover me</span>
</AnimatedTooltip>
```

### With Custom Delay

```tsx
<AnimatedTooltip 
  content="Appears after 500ms" 
  delay={500}
>
  <button>Hover me</button>
</AnimatedTooltip>
```

### With Rich Content

```tsx
<AnimatedTooltip 
  content={
    <div>
      <strong>Pro Tip:</strong>
      <p>You can use any React component as content!</p>
    </div>
  }
>
  <button>Hover me</button>
</AnimatedTooltip>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| React.ReactNode` | Required | The content to display in the tooltip |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred position of the tooltip |
| `delay` | `number` | `300` | Delay in milliseconds before showing tooltip |
| `children` | `React.ReactNode` | Required | The element that triggers the tooltip |
| `disabled` | `boolean` | `false` | Whether the tooltip is disabled |

## Behavior

### Desktop
- Tooltip appears on hover after the specified delay
- Disappears when mouse leaves the trigger element
- Position automatically adjusts if it would overflow the viewport

### Mobile
- Tooltip appears on tap/click
- Shows a dismiss button (×) in the top-right corner
- Can be dismissed by tapping the dismiss button or tapping outside

### Accessibility
- Uses `role="tooltip"` for screen readers
- Uses `aria-live="polite"` to announce content changes
- Respects `prefers-reduced-motion` setting
- Dismiss button has proper `aria-label`

## Smart Positioning

The tooltip automatically adjusts its position to stay within the viewport:

- If `position="top"` but there's no room above, it switches to bottom
- If `position="bottom"` but there's no room below, it switches to top
- If `position="left"` but there's no room on the left, it switches to right
- If `position="right"` but there's no room on the right, it switches to left

## Styling

The tooltip uses CSS custom properties from the design system:

- `--z-tooltip`: Z-index for tooltip layering
- `--spacing-sm`, `--spacing-md`: Padding values
- `--color-neutral-dark`: Background color
- `--color-background`: Text color
- `--radius-md`: Border radius
- `--shadow-lg`: Box shadow
- `--duration-normal`: Animation duration
- `--ease-out`: Animation easing

You can override these in your CSS if needed.

## Examples in the App

The tooltip system is integrated throughout the application:

1. **HomePage**: Help icons next to ingredient input and "Get Recipes" button
2. **RecipeResults**: Help icon in the page header
3. **FilterPanel**: Help icons for cooking time and dietary preferences filters

## HelpIcon Component

A convenience component that combines AnimatedTooltip with a question mark icon:

```tsx
import { HelpIcon } from '../components';

<HelpIcon
  content="This is helpful information"
  position="right"
  pulse={true}
  size="medium"
/>
```

### HelpIcon Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string \| React.ReactNode` | Required | The tooltip content |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tooltip position |
| `pulse` | `boolean` | `true` | Whether to show pulsing animation |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Icon size |
| `ariaLabel` | `string` | `'Help information'` | Accessibility label |

The HelpIcon includes a pulsing indicator animation to draw attention, which can be disabled by setting `pulse={false}`.
