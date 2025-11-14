# Onboarding System Documentation

## Overview

The onboarding system provides a comprehensive solution for guiding first-time users through your application with interactive hints and celebrating their achievements with delightful animations.

## Components

### 1. OnboardingHint

A component that displays contextual hints pointing to specific elements on the page.

**Features:**
- Spotlight effect highlighting target elements
- Animated hint bubble with arrow pointer
- Progress dots showing current step
- Skip/Next navigation buttons
- Local storage persistence to remember completed onboarding

**Props:**
```typescript
interface OnboardingHintProps {
  step: number;              // Current step number (1-based)
  totalSteps: number;        // Total number of steps
  message: string;           // Hint message to display
  targetElement: string;     // CSS selector for target element
  onDismiss: () => void;     // Called when user dismisses
  onNext: () => void;        // Called when user clicks next
  storageKey?: string;       // Local storage key (default: 'onboarding-completed')
}
```

### 2. CelebrationAnimation

A component that displays celebratory animations for user achievements.

**Features:**
- Multiple animation types (confetti, stars, checkmark, trophy)
- Customizable messages
- Configurable duration
- Auto-dismissal with callback

**Props:**
```typescript
interface CelebrationAnimationProps {
  type?: 'confetti' | 'stars' | 'checkmark' | 'trophy';
  message?: string;
  duration?: number;         // Duration in milliseconds (default: 3000)
  onComplete?: () => void;   // Called when animation completes
}
```

### 3. OnboardingProvider

A context provider that manages onboarding state and celebrations globally.

**Props:**
```typescript
interface OnboardingProviderProps {
  children: ReactNode;
  steps?: Array<{
    message: string;
    targetElement: string;
  }>;
  enableOnboarding?: boolean;  // Default: true
}
```

## Hooks

### useOnboarding

Manages onboarding state and progression.

```typescript
const {
  currentStep,        // Current step index (-1 if inactive)
  totalSteps,         // Total number of steps
  currentStepData,    // Current step data object
  isActive,           // Whether onboarding is active
  nextStep,           // Function to advance to next step
  dismissOnboarding,  // Function to dismiss onboarding
  resetOnboarding,    // Function to reset and restart
  startOnboarding     // Function to manually start
} = useOnboarding({
  steps: [
    { message: 'Welcome!', targetElement: '#welcome-button' },
    { message: 'Add ingredients here', targetElement: '#ingredient-input' }
  ],
  storageKey: 'my-onboarding',
  autoStart: true
});
```

### useCelebration

Manages celebration animations and first-time action tracking.

```typescript
const {
  activeCelebration,   // Current active celebration config
  celebrate,           // Function to trigger celebration
  clearCelebration,    // Function to clear celebration
  checkFirstTime,      // Function to check and celebrate first-time actions
  checkMilestone,      // Function to check and celebrate milestones
  resetCelebrations    // Function to reset all celebration data
} = useCelebration();
```

### useOnboardingContext

Access onboarding and celebration functions from anywhere in the app (must be within OnboardingProvider).

```typescript
const {
  startOnboarding,
  resetOnboarding,
  celebrate,
  checkFirstTime,
  checkMilestone
} = useOnboardingContext();
```

## Usage Examples

### Basic Onboarding Setup

```tsx
import { OnboardingProvider } from './components';

const onboardingSteps = [
  {
    message: 'Welcome! Start by adding your ingredients here.',
    targetElement: '#ingredient-input'
  },
  {
    message: 'Click here to generate recipes based on your ingredients.',
    targetElement: '#generate-button'
  },
  {
    message: 'Browse your personalized recipe recommendations here.',
    targetElement: '#recipe-list'
  }
];

function App() {
  return (
    <OnboardingProvider steps={onboardingSteps} enableOnboarding={true}>
      <YourApp />
    </OnboardingProvider>
  );
}
```

### Celebrating First-Time Actions

```tsx
import { useOnboardingContext, CELEBRATIONS } from './components';

function IngredientInput() {
  const { checkFirstTime } = useOnboardingContext();

  const handleAddIngredient = (ingredient: string) => {
    // Add ingredient logic...
    
    // Celebrate if this is the first ingredient
    checkFirstTime('add-ingredient', CELEBRATIONS.FIRST_INGREDIENT);
  };

  return (
    <input onChange={(e) => handleAddIngredient(e.target.value)} />
  );
}
```

### Celebrating Milestones

```tsx
import { useOnboardingContext, CELEBRATIONS } from './components';

function RecipeList({ recipes }) {
  const { checkMilestone } = useOnboardingContext();

  useEffect(() => {
    // Check for milestone achievements
    checkMilestone('recipes-viewed', recipes.length, [
      {
        key: 'five-recipes',
        threshold: 5,
        celebration: {
          type: 'confetti',
          message: '🎉 You\'ve viewed 5 recipes!',
          duration: 3000
        }
      },
      {
        key: 'ten-recipes',
        threshold: 10,
        celebration: CELEBRATIONS.TEN_RECIPES
      }
    ]);
  }, [recipes.length, checkMilestone]);

  return <div>{/* Recipe list */}</div>;
}
```

### Manual Celebration Trigger

```tsx
import { useOnboardingContext } from './components';

function RecipeCard({ recipe }) {
  const { celebrate } = useOnboardingContext();

  const handlePerfectMatch = () => {
    if (recipe.matchScore === 100) {
      celebrate({
        type: 'trophy',
        message: '🏆 Perfect Match! All ingredients used!',
        duration: 3000
      });
    }
  };

  return <div onClick={handlePerfectMatch}>{/* Recipe card */}</div>;
}
```

### Standalone Usage (Without Provider)

```tsx
import { OnboardingHint, CelebrationAnimation } from './components';
import { useOnboarding, useCelebration } from './hooks';

function MyComponent() {
  const { currentStep, totalSteps, currentStepData, isActive, nextStep, dismissOnboarding } = 
    useOnboarding({
      steps: [
        { message: 'Step 1', targetElement: '#element1' },
        { message: 'Step 2', targetElement: '#element2' }
      ]
    });

  const { activeCelebration, celebrate, clearCelebration } = useCelebration();

  return (
    <>
      {isActive && currentStepData && (
        <OnboardingHint
          step={currentStep + 1}
          totalSteps={totalSteps}
          message={currentStepData.message}
          targetElement={currentStepData.targetElement}
          onDismiss={dismissOnboarding}
          onNext={nextStep}
        />
      )}

      {activeCelebration && (
        <CelebrationAnimation
          type={activeCelebration.type}
          message={activeCelebration.message}
          duration={activeCelebration.duration}
          onComplete={clearCelebration}
        />
      )}
    </>
  );
}
```

## Predefined Celebrations

The system includes predefined celebrations for common actions:

```typescript
CELEBRATIONS.FIRST_INGREDIENT  // First ingredient added
CELEBRATIONS.FIRST_RECIPE      // First recipe found
CELEBRATIONS.FIRST_FAVORITE    // First recipe favorited
CELEBRATIONS.FIRST_RATING      // First recipe rated
CELEBRATIONS.PERFECT_MATCH     // Perfect recipe match
CELEBRATIONS.FIVE_INGREDIENTS  // 5 ingredients selected
CELEBRATIONS.TEN_RECIPES       // 10 recipes discovered
CELEBRATIONS.FIRST_SEARCH      // First search performed
```

## Customization

### Custom Celebration Types

You can create custom celebrations with any configuration:

```typescript
celebrate({
  type: 'confetti',
  message: '🎊 Custom achievement unlocked!',
  duration: 4000
});
```

### Custom Storage Keys

Use different storage keys for different onboarding flows:

```typescript
useOnboarding({
  steps: [...],
  storageKey: 'advanced-features-onboarding'
});
```

### Resetting Onboarding

For testing or allowing users to replay onboarding:

```tsx
const { resetOnboarding } = useOnboardingContext();

<button onClick={resetOnboarding}>
  Replay Tutorial
</button>
```

## Accessibility

- All animations respect `prefers-reduced-motion` media query
- Keyboard navigation supported for all interactive elements
- Focus indicators visible on all buttons
- Screen reader friendly with proper ARIA labels

## Mobile Optimization

- Touch-friendly button sizes (minimum 44px)
- Responsive positioning for hints
- Optimized animation performance
- Dismissible overlay on mobile devices

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- CSS animations with fallbacks
- LocalStorage with error handling
