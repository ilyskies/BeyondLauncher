"use client";

import { BeyondUser } from "@/shared/types/beyond";
import { GreetingsSection } from "@/features/home/components/greetings-section";
import { BannerSection } from "@/features/home/components/banner-section";
import { PatchNotesSection } from "@/features/home/components/patch-notes-section";
import { LibrarySection } from "@/features/library/components/library-section";
import SettingsView from "@/features/settings/views/settings";

export function ContentArea({
  activeTab,
  user,
  onTabChange,
}: {
  activeTab: "home" | "library" | "settings";
  user: BeyondUser;
  onTabChange: (tab: "home" | "library" | "settings") => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {activeTab === "home" && (
        <div className="w-full px-12 py-12 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="max-w-7xl mx-auto space-y-8">
            <GreetingsSection user={user} />
            <BannerSection onTabChange={onTabChange} />
            <PatchNotesSection />
          </div>
        </div>
      )}

      {activeTab === "library" && <LibrarySection />}

      {activeTab === "settings" && (
        <div className="w-full h-full">
          <SettingsView />
        </div>
      )}
    </div>
  );
}
