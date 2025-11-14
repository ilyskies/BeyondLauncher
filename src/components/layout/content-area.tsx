"use client";

import { AnoraUser } from "@/types/anora";
import { WelcomeHeader } from "../sections/home/welcome_header";
import { NewsSection } from "../sections/home/news_section";
import { PatchNotesSection } from "../sections/home/patch_notes_section";

export function ContentArea({
  activeTab,
  user,
}: {
  activeTab: "home" | "library" | "settings";
  user: AnoraUser;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {activeTab === "home" && (
        <>
          <div className="w-full px-12 py-12 space-y-12">
            <WelcomeHeader username={user.UserAccount.DisplayName} />
            <NewsSection />
            <PatchNotesSection />
          </div>
        </>
      )}
    </div>
  );
}
