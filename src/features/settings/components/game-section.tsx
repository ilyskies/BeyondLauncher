"use client";

import { useGameSettings } from "@/shared/stores/game-settings";
import { Hammer, RotateCcw, Package, LucideIcon } from "lucide-react";

export function GameSection() {
  const { settings, updateSetting } = useGameSettings();

  return (
    <div className="p-12">
      <div className="max-w-3xl">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Game Options</h2>
          <p className="text-white/40 text-sm">
            Customize your gameplay experience
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Building Settings
            </h3>
            <div className="space-y-3">
              <ToggleCard
                icon={Package}
                label="Bubble Builds"
                enabled={settings.bubbleWrapBuilds}
                onChange={(value) => updateSetting("bubbleWrapBuilds", value)}
              />
              <ToggleCard
                icon={Hammer}
                label="Disable Pre-Edits"
                enabled={settings.disablePreEdits}
                onChange={(value) => updateSetting("disablePreEdits", value)}
              />
              <ToggleCard
                icon={RotateCcw}
                label="Reset on Release"
                enabled={settings.resetOnRelease}
                onChange={(value) => updateSetting("resetOnRelease", value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleCard({
  icon: Icon,
  label,
  enabled,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
      <div className="flex items-center gap-4">
        <div
          className={`flex-shrink-0 p-2.5 rounded-lg transition-colors duration-200 ${
            enabled
              ? "bg-blue-500/20 text-blue-400"
              : "bg-white/10 text-white/40"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white">{label}</h4>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange(!enabled);
          }}
          className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
            enabled ? "bg-blue-500" : "bg-white/20"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
              enabled ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="absolute inset-0 rounded-xl border border-blue-500/20 pointer-events-none" />
      )}
    </div>
  );
}
