import { useState, useCallback } from 'react';

interface CelebrationConfig {
  type?: 'confetti' | 'stars' | 'checkmark' | 'trophy';
  message?: string;
  duration?: number;
}

interface Milestone {
  key: string;
  threshold: number;
  celebration: CelebrationConfig;
}

export const useCelebration = () => {
  const [activeCelebration, setActiveCelebration] = useState<CelebrationConfig | null>(null);

  const celebrate = useCallback((config: CelebrationConfig) => {
    setActiveCelebration(config);
  }, []);

  const clearCelebration = useCallback(() => {
    setActiveCelebration(null);
  }, []);

  const checkFirstTime = useCallback((actionKey: string, celebration: CelebrationConfig) => {
    const storageKey = `first-time-${actionKey}`;
    const hasPerformed = localStorage.getItem(storageKey);
    
    if (!hasPerformed) {
      localStorage.setItem(storageKey, 'true');
      celebrate(celebration);
      return true;
    }
    return false;
  }, [celebrate]);

  const checkMilestone = useCallback((
    milestoneKey: string,
    currentValue: number,
    milestones: Milestone[]
  ) => {
    const storageKey = `milestone-${milestoneKey}`;
    const completedMilestones = JSON.parse(localStorage.getItem(storageKey) || '[]');

    for (const milestone of milestones) {
      if (
        currentValue >= milestone.threshold &&
        !completedMilestones.includes(milestone.key)
      ) {
        completedMilestones.push(milestone.key);
        localStorage.setItem(storageKey, JSON.stringify(completedMilestones));
        celebrate(milestone.celebration);
        return milestone;
      }
    }
    return null;
  }, [celebrate]);

  const resetCelebrations = useCallback(() => {
    // Clear all first-time and milestone data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('first-time-') || key.startsWith('milestone-')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return {
    activeCelebration,
    celebrate,
    clearCelebration,
    checkFirstTime,
    checkMilestone,
    resetCelebrations
  };
};

// Predefined celebrations for common actions
export const CELEBRATIONS = {
  FIRST_INGREDIENT: {
    type: 'checkmark' as const,
    message: '🎉 Great start! Your first ingredient added!',
    duration: 2500
  },
  FIRST_RECIPE: {
    type: 'stars' as const,
    message: '✨ Amazing! You found your first recipe!',
    duration: 3000
  },
  FIRST_FAVORITE: {
    type: 'checkmark' as const,
    message: '❤️ Awesome! Recipe saved to favorites!',
    duration: 2500
  },
  FIRST_RATING: {
    type: 'stars' as const,
    message: '⭐ Thanks for rating! Your feedback matters!',
    duration: 2500
  },
  PERFECT_MATCH: {
    type: 'trophy' as const,
    message: '🏆 Perfect Match! All ingredients used!',
    duration: 3000
  },
  FIVE_INGREDIENTS: {
    type: 'confetti' as const,
    message: '🎊 Wow! 5 ingredients selected!',
    duration: 3000
  },
  TEN_RECIPES: {
    type: 'trophy' as const,
    message: '🏆 Recipe Explorer! 10 recipes discovered!',
    duration: 3000
  },
  FIRST_SEARCH: {
    type: 'stars' as const,
    message: '🔍 Let\'s find some delicious recipes!',
    duration: 2500
  }
};
