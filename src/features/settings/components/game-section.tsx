"use client";

import { useState } from "react";

export function GameSection() {
  const [bubbleWrapBuilds, setBubbleWrapBuilds] = useState(false);
  const [disablePreEdits, setDisablePreEdits] = useState(false);
  const [resetOnRelease, setResetOnRelease] = useState(false);

  return (
    <div className="p-12">
      <div className="max-w-3xl">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Game Options</h2>
          <p className="text-white/40 text-sm">Configure your game settings</p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Building</h3>
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <ToggleOption
                label="Disable Pre-Edits"
                enabled={disablePreEdits}
                onChange={setDisablePreEdits}
              />
              <ToggleOption
                label="Reset On Release"
                enabled={resetOnRelease}
                onChange={setResetOnRelease}
              />
              <ToggleOption
                label="Bubble Wrap Builds"
                enabled={bubbleWrapBuilds}
                onChange={setBubbleWrapBuilds}
                isLast
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({
  label,
  enabled,
  onChange,
  isLast,
}: {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all duration-200 ${
        !isLast ? "border-b border-white/10" : ""
      }`}
    >
      <span className="text-white text-sm font-medium">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${
          enabled ? "bg-blue-500" : "bg-white/20"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
