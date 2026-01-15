import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Build {
  id: string;
  title: string;
  version: string;
  season: string;
  path: string;
  size: string;
  image?: string;
  supported: boolean;
  dateAdded: string;
  netcl: string;
}

interface BuildStore {
  builds: Build[];
  selectedBuildId: string | null;
  addBuild: (build: Build) => void;
  removeBuild: (id: string) => void;
  setSelectedBuild: (id: string) => void;
  getBuild: (id: string) => Build | undefined;
  clearBuilds: () => void;
}

export const useBuildStore = create<BuildStore>()(
  persist(
    (set, get) => ({
      builds: [],
      selectedBuildId: null,

      addBuild: (build: Build) => {
        set((state) => ({
          builds: [build, ...state.builds],
          selectedBuildId: build.id,
        }));
      },

      removeBuild: (id: string) => {
        set((state) => ({
          builds: state.builds.filter((b) => b.id !== id),
          selectedBuildId: state.selectedBuildId === id ? null : state.selectedBuildId,
        }));
      },

      setSelectedBuild: (id: string) => {
        set({ selectedBuildId: id });
      },

      getBuild: (id: string) => {
        return get().builds.find((b) => b.id === id);
      },

      clearBuilds: () => {
        set({ builds: [], selectedBuildId: null });
      },
    }),
    {
      name: "beyond-builds",
    }
  )
);