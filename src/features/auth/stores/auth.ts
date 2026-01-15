import { BeyondUser } from "@/shared/types/beyond";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  currentUser: BeyondUser | null;
  isLoading: boolean;

  authenticate: (token: string, user?: BeyondUser) => void;
  signOut: () => void;
  updateUser: (user: BeyondUser) => void;
  updateToken: (token: string) => void;
  patchUser: (updates: Partial<BeyondUser>) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
  setDisplayName: (displayName: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      currentUser: null,
      isLoading: false,

      authenticate: (token, user) => {
        set({
          accessToken: token,
          currentUser: user ?? null,
          isLoading: false,
        });
      },

      signOut: () => {
        set({
          accessToken: null,
          currentUser: null,
          isLoading: false,
        });
      },

      updateUser: (user) => {
        set({ currentUser: user });
      },

      updateToken: (token: string) => {
        set({ accessToken: token });
      },

      patchUser: (updates) => {
        const { currentUser } = get();
        if (!currentUser) return;

        set({
          currentUser: {
            ...currentUser,
            ...updates,
          },
        });
      },

      setDisplayName: (displayName: string) => {
        const { currentUser } = get();
        if (!currentUser) return;

        set({
          currentUser: {
            ...currentUser,
            UserAccount: {
              ...currentUser.UserAccount,
              DisplayName: displayName,
            },
          },
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      clear: () => {
        set({
          accessToken: null,
          currentUser: null,
          isLoading: false,
        });
      },
    }),
    {
      name: "beyond-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        currentUser: state.currentUser,
      }),
      version: 1,
    }
  )
);

export const useAuth = () => {
  const store = useAuthStore();

  const isAuthenticated = Boolean(store.accessToken);
  const sessionValid = Boolean(store.accessToken && store.currentUser);

  return {
    token: store.accessToken,
    user: store.currentUser,
    isLoading: store.isLoading,
    isAuthenticated,
    sessionValid,

    login: store.authenticate,
    logout: store.signOut,
    updateUser: store.updateUser,
    updateToken: store.updateToken,
    patchUser: store.patchUser,
    setDisplayName: store.setDisplayName,
    setLoading: store.setLoading,
    clearAuth: store.clear,
  };
};
