"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/stores/auth";
import { Sidebar } from "../components/sidebar";
import { AccountSection } from "../components/account-section";
import { GameSection } from "../components/game-section";
import { AppearanceSection } from "../components/appearance-section";

type SettingsSection = "account" | "game" | "appearance";

export default function SettingsView() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");
  const { user, logout } = useAuth();

  const renderContent = () => {
    const content = (() => {
      switch (activeSection) {
        case "account":
          return <AccountSection user={user} />;
        case "game":
          return <GameSection />;
        case "appearance":
          return <AppearanceSection />;
        default:
          return null;
      }
    })();

    return (
      <div
        key={activeSection}
        className="animate-in fade-in slide-in-from-right-4 duration-300"
      >
        {content}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex animate-in fade-in duration-500">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={logout}
      />
      <div className="flex-1 h-full overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
