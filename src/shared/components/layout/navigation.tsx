"use client";

import { Home, Library, Settings } from "lucide-react";
import { BeyondUser } from "@/shared/types/beyond";

interface NavigationProps {
  activeTab: "home" | "library" | "settings";
  onTabChange: (tab: "home" | "library" | "settings") => void;
  user: BeyondUser | null;
  onLogout: () => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="relative z-10 w-16 bg-gray-500/5 backdrop-filter backdrop-blur-lg backdrop-saturate-100 backdrop-contrast-100 border-r border-white/10 flex flex-col items-center py-6 gap-4">
      <button
        onClick={() => onTabChange("home")}
        className={`p-2 rounded-lg text-white transition-all duration-200 cursor-pointer ${
          activeTab === "home" ? "bg-white/10" : "hover:bg-white/5"
        }`}
        type="button"
      >
        <Home size={20} />
      </button>

      <button
        onClick={() => onTabChange("library")}
        className={`p-2 rounded-lg text-white transition-all duration-200 cursor-pointer ${
          activeTab === "library" ? "bg-white/10" : "hover:bg-white/5"
        }`}
        type="button"
      >
        <Library size={20} />
      </button>

      <div className="flex-1" />

      <button
        onClick={() => onTabChange("settings")}
        className={`p-2 rounded-lg text-white transition-all duration-200 cursor-pointer ${
          activeTab === "settings" ? "bg-white/10" : "hover:bg-white/5"
        }`}
        type="button"
      >
        <Settings size={20} />
      </button>
    </nav>
  );
}
