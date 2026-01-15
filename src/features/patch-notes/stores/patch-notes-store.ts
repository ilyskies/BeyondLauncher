import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PatchNotesStore {
  readPatchNotes: Set<string> | string[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isRead: (id: string) => boolean;
}

export const usePatchNotesStore = create<PatchNotesStore>()(
  persist(
    (set, get) => ({
      readPatchNotes: new Set<string>(),

      markAsRead: (id: string) => {
        set((state: { readPatchNotes: unknown }) => {
          const current = state.readPatchNotes;

          const asSet =
            current instanceof Set
              ? current
              : Array.isArray(current)
              ? new Set(current)
              : new Set();

          const newRead = new Set(asSet);
          newRead.add(id);

          return { readPatchNotes: newRead };
        });
      },

      markAllAsRead: () => {
        set({ readPatchNotes: new Set() });
      },

      isRead: (id: string) => {
        const { readPatchNotes } = get();
        if (readPatchNotes instanceof Set) {
          return readPatchNotes.has(id);
        } else if (Array.isArray(readPatchNotes)) {
          return readPatchNotes.includes(id);
        }
        return false;
      },
    }),
    {
      name: "patch-notes",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (
            parsed.state.readPatchNotes &&
            Array.isArray(parsed.state.readPatchNotes)
          ) {
            parsed.state.readPatchNotes = new Set(parsed.state.readPatchNotes);
          }
          return parsed;
        },
        setItem: (name, value) => {
          const state = {
            ...value.state,
            readPatchNotes: Array.from(value.state.readPatchNotes),
          };
          localStorage.setItem(name, JSON.stringify({ state }));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
