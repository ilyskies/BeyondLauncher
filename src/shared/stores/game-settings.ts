import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface GameSettings {
  bubbleWrapBuilds: boolean;
  disablePreEdits: boolean;
  resetOnRelease: boolean;
}

const defaultSettings: GameSettings = {
  bubbleWrapBuilds: false,
  disablePreEdits: false,
  resetOnRelease: false,
};

interface GameSettingsState {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => void;
  resetSettings: () => void;
}

export const useGameSettingsStore = create<GameSettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: "beyond-game-settings",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

export const useGameSettings = () => {
  const store = useGameSettingsStore();

  return {
    settings: store.settings,
    updateSetting: store.updateSetting,
    resetSettings: store.resetSettings,
  };
};
