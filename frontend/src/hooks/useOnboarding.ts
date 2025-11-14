import { useState, useEffect } from 'react';

interface OnboardingStep {
  message: string;
  targetElement: string;
}

interface UseOnboardingOptions {
  steps: OnboardingStep[];
  storageKey?: string;
  autoStart?: boolean;
}

export const useOnboarding = ({
  steps,
  storageKey = 'onboarding-completed',
  autoStart = true
}: UseOnboardingOptions) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const completed = localStorage.getItem(storageKey);
    if (completed !== 'true' && autoStart && steps.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsActive(true);
      }, 500);
    }
  }, [storageKey, autoStart, steps.length]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      dismissOnboarding();
    }
  };

  const dismissOnboarding = () => {
    setIsActive(false);
    localStorage.setItem(storageKey, 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem(storageKey);
    setCurrentStep(0);
    setIsActive(true);
  };

  const startOnboarding = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  return {
    currentStep: isActive ? currentStep : -1,
    totalSteps: steps.length,
    currentStepData: isActive && steps[currentStep] ? steps[currentStep] : null,
    isActive,
    nextStep,
    dismissOnboarding,
    resetOnboarding,
    startOnboarding
  };
};
