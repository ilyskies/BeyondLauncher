import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OnboardingStep = "username" | "complete";

interface OnboardingState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  username: string | null;
  hasCompletedOnboarding: boolean;

  setStep: (step: OnboardingStep) => void;
  completeStep: (step: OnboardingStep) => void;
  setUsername: (username: string) => void;
  resetOnboarding: () => void;
  isStepCompleted: (step: OnboardingStep) => boolean;
  getProgress: () => number;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: "username",
      completedSteps: [],
      username: null,
      hasCompletedOnboarding: false,

      setStep: (step) => {
        set({ currentStep: step });
      },

      completeStep: (step) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          const newCompletedSteps = [...completedSteps, step];

          const newHasCompletedOnboarding =
            newCompletedSteps.includes("complete");

          set({
            completedSteps: newCompletedSteps,
            currentStep: step,
            hasCompletedOnboarding: newHasCompletedOnboarding,
          });
        } else {
          console.log("Step already completed, skipping");
        }
      },

      setUsername: (username) => {
        set({ username });
      },

      resetOnboarding: () => {
        set({
          currentStep: "username",
          completedSteps: [],
          username: null,
          hasCompletedOnboarding: false,
        });
      },

      isStepCompleted: (step) => {
        return get().completedSteps.includes(step);
      },

      getProgress: () => {
        const { completedSteps } = get();
        const totalSteps = 2;
        return (completedSteps.length / totalSteps) * 100;
      },
    }),
    {
      name: "beyond-onboarding",
      storage: createJSONStorage(() => localStorage),
      version: 4,
    }
  )
);

export const useOnboarding = () => {
  const store = useOnboardingStore();

  return {
    currentStep: store.currentStep,
    completedSteps: store.completedSteps,
    username: store.username,
    progress: store.getProgress(),
    hasCompletedOnboarding: store.hasCompletedOnboarding,

    setStep: store.setStep,
    completeStep: store.completeStep,
    setUsername: store.setUsername,
    resetOnboarding: store.resetOnboarding,
    isStepCompleted: store.isStepCompleted,
  };
};
