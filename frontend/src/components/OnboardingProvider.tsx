import React, { createContext, useContext, ReactNode } from 'react';
import { useOnboarding } from '../hooks/useOnboarding';
import { useCelebration, CELEBRATIONS } from '../hooks/useCelebration';
import OnboardingHint from './OnboardingHint';
import CelebrationAnimation from './CelebrationAnimation';

interface OnboardingContextType {
  startOnboarding: () => void;
  resetOnboarding: () => void;
  celebrate: (config: any) => void;
  checkFirstTime: (actionKey: string, celebration: any) => boolean;
  checkMilestone: (milestoneKey: string, currentValue: number, milestones: any[]) => any;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: ReactNode;
  steps?: Array<{ message: string; targetElement: string }>;
  enableOnboarding?: boolean;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  steps = [],
  enableOnboarding = true
}) => {
  const {
    currentStep,
    totalSteps,
    currentStepData,
    isActive,
    nextStep,
    dismissOnboarding,
    resetOnboarding,
    startOnboarding
  } = useOnboarding({
    steps,
    autoStart: enableOnboarding
  });

  const {
    activeCelebration,
    celebrate,
    clearCelebration,
    checkFirstTime,
    checkMilestone
  } = useCelebration();

  return (
    <OnboardingContext.Provider
      value={{
        startOnboarding,
        resetOnboarding,
        celebrate,
        checkFirstTime,
        checkMilestone
      }}
    >
      {children}
      
      {/* Render onboarding hint if active */}
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

      {/* Render celebration animation if active */}
      {activeCelebration && (
        <CelebrationAnimation
          type={activeCelebration.type}
          message={activeCelebration.message}
          duration={activeCelebration.duration}
          onComplete={clearCelebration}
        />
      )}
    </OnboardingContext.Provider>
  );
};

// Export celebrations for easy access
export { CELEBRATIONS };
