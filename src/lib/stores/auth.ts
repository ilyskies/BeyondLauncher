import { AnoraUser } from "@/types/anora";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  currentUser: AnoraUser | null;
  isLoading: boolean;

  authenticate: (token: string, user?: AnoraUser) => void;
  signOut: () => void;
  updateUser: (user: AnoraUser) => void;
  patchUser: (updates: Partial<AnoraUser>) => void;
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
      name: "anora-auth",
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
    patchUser: store.patchUser,
    setDisplayName: store.setDisplayName,
    setLoading: store.setLoading,
    clearAuth: store.clear,
  };
};
