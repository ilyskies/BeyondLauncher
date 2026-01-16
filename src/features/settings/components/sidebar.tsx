"use client";

import { useState, useEffect } from "react";
import { User, Gamepad2, Palette, LogOut, LucideIcon } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { LogoutModal } from "./logout-modal";

type SettingsSection = "account" | "game" | "appearance";

interface SidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  onLogout: () => void;
}

export function Sidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: SidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [version, setVersion] = useState("...");
  const [identifier, setIdentifier] = useState("...");

  useEffect(() => {
    getVersion().then(setVersion);
    invoke<string>("get_app_identifier").then(setIdentifier);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
      <div className="w-56 h-full flex flex-col py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        </div>

        <div className="flex-1 space-y-1">
          <SidebarButton
            icon={User}
            label="Account"
            active={activeSection === "account"}
            onClick={() => onSectionChange("account")}
          />
          <SidebarButton
            icon={Gamepad2}
            label="Game"
            active={activeSection === "game"}
            onClick={() => onSectionChange("game")}
          />
          <SidebarButton
            icon={Palette}
            label="Appearance"
            active={activeSection === "appearance"}
            onClick={() => onSectionChange("appearance")}
          />
        </div>

        <div className="space-y-3 pt-4">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Log out</span>
          </button>

          <div className="px-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-white/20 mb-1">
              {identifier}/{version}
            </p>
            <p className="text-[10px] text-white/30">Made with ❤️ by skies</p>
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all cursor-pointer ${
        active
          ? "bg-white/10 text-white"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
