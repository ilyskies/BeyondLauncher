import { create } from "zustand";

interface UsernameCheckState {
  isChecking: boolean;
  isAvailable: boolean;
  error: string;
  setChecking: (checking: boolean) => void;
  setAvailability: (available: boolean, error?: string) => void;
  reset: () => void;
}

export const useUsernameCheck = create<UsernameCheckState>((set) => ({
  isChecking: false,
  isAvailable: false,
  error: "",
  setChecking: (isChecking) => set({ isChecking }),
  setAvailability: (isAvailable, error = "") =>
    set({ isAvailable, error, isChecking: false }),
  reset: () => set({ isChecking: false, isAvailable: false, error: "" }),
}));
