# Enhanced Recipe Card Component

## Overview

The RecipeCard component has been enhanced with interactive animations, hover effects, and additional features to improve user engagement.

## Features Implemented

### 1. Hover Effects (Task 5.1)
- **Card Elevation**: Card lifts up with enhanced shadow on hover
- **Image Zoom**: Recipe image smoothly zooms in on hover
- **Smooth Transitions**: All hover effects use consistent timing (300ms)

### 2. Animated Metadata (Task 5.2)
- **Animated Clock Icon**: Rotating clock icon for cooking time
- **Colored Dietary Badges**: Category-based colored badges with icons
  - Vegan: Green with 🌱
  - Vegetarian: Light green with 🥗
  - Gluten-free: Orange with 🌾
  - Dairy-free: Blue with 🥛
  - Keto: Purple with 🥑
  - Paleo: Orange with 🍖
- **Match Score Progress Bar**: Animated gradient progress bar showing ingredient match percentage

### 3. Quick Actions & Perfect Match Badge (Task 5.3)
- **Quick Action Buttons**: Save and share buttons that slide in on hover
  - Visible on hover (desktop)
  - Always visible on mobile for touch accessibility
- **Perfect Match Badge**: Pulsing badge for 100% ingredient matches
  - Animated glow effect
  - Floating icon animation

## Usage

### Basic Usage (Backward Compatible)
```tsx
<RecipeCard
  recipe={recipe}
  onClick={() => handleRecipeClick(recipe.id)}
/>
```

### With All New Features
```tsx
<RecipeCard
  recipe={recipe}
  onClick={() => handleRecipeClick(recipe.id)}
  matchScore={95}
  isPerfectMatch={false}
  onSave={(recipeId) => handleSaveRecipe(recipeId)}
  onShare={(recipeId) => handleShareRecipe(recipeId)}
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| recipe | Recipe | Yes | - | Recipe object with all recipe data |
| onClick | () => void | Yes | - | Handler for card click |
| matchScore | number | No | recipe.match_percentage | Override match percentage display |
| isPerfectMatch | boolean | No | matchScore >= 100 | Show perfect match badge |
| onSave | (recipeId: number) => void | No | - | Handler for save button |
| onShare | (recipeId: number) => void | No | - | Handler for share button |

## Accessibility

- **Reduced Motion**: All animations respect `prefers-reduced-motion` setting
- **Touch Targets**: Minimum 44px touch targets on mobile
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Quick action buttons have proper aria-labels

## Performance

- **GPU Acceleration**: Uses `transform` and `opacity` for smooth animations
- **Will-change**: Applied to animated elements for optimization
- **Lazy Loading**: Images use lazy loading attribute

## Responsive Design

- **Mobile (< 768px)**: 
  - Reduced hover lift effect
  - Quick actions always visible
  - Smaller badges and icons
  - Minimum touch targets enforced

- **Tablet (768-1023px)**:
  - Medium-sized elements
  - Standard hover effects

- **Desktop (1024px+)**:
  - Full hover effects
  - Larger quick action buttons
  - Maximum elevation on hover

## Animation Details

### Keyframes Used
- `pulseGlow`: Perfect match badge pulsing effect (2s infinite)
- `float`: Floating icon animation (2s infinite)
- `rotate`: Clock icon rotation (2s infinite)
- `progress`: Progress bar fill animation (500ms)
- `slideInUp`: Quick actions slide-in (300ms)

### Transition Timings
- Card hover: 300ms
- Image zoom: 300ms
- Quick actions: 300ms
- Progress bar: 500ms
- Badge hover: 150ms

## Browser Support

Tested and working on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Examples

### Example 1: Recipe Results Page
Shows recipes with match scores and quick actions:
```tsx
{recipes.map((recipe) => (
  <RecipeCard
    key={recipe.id}
    recipe={recipe}
    onClick={() => navigate(`/recipes/${recipe.id}`)}
    onSave={handleSaveRecipe}
    onShare={handleShareRecipe}
  />
))}
```

### Example 2: Perfect Match Display
Highlight recipes that match all ingredients:
```tsx
<RecipeCard
  recipe={recipe}
  onClick={handleClick}
  isPerfectMatch={recipe.match_percentage === 100}
/>
```

### Example 3: Popular Recipes (Simple)
Basic usage without extra features:
```tsx
<RecipeCard
  recipe={recipe}
  onClick={() => navigate(`/recipes/${recipe.id}`)}
/>
```

## CSS Variables Used

The component uses design system variables from `styles/variables.css`:
- `--duration-fast`: 150ms
- `--duration-normal`: 300ms
- `--duration-slow`: 500ms
- `--ease-default`: cubic-bezier(0.4, 0.0, 0.2, 1)
- `--ease-in-out`: cubic-bezier(0.4, 0.0, 0.2, 1)

## Future Enhancements

Potential improvements for future iterations:
- Add favorite/bookmark functionality
- Implement drag-to-reorder
- Add recipe comparison feature
- Include nutritional info preview
- Add recipe difficulty indicator animation
