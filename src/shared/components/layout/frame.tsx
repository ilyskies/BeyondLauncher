"use client";

import { Minus, Users, X } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useState } from "react";
import { useRouterContext } from "@/core/router/router";
import { FriendsList } from "@/shared/components/ui/friends";

export function Frame() {
  const [showFriends, setShowFriends] = useState(false);
  const { currentPath } = useRouterContext();

  console.log("Current path", currentPath);
  const showFriendsButton =
    !currentPath.includes("/login") && !currentPath.includes("/onboarding");

  return (
    <>
      <div
        data-tauri-drag-region
        className="flex h-10 items-center justify-between bg-titlebar px-3 select-none border-b border-border/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Beyond</span>
        </div>

        <div className="flex items-center gap-1">
          {showFriendsButton && (
            <button
              onClick={() => setShowFriends(!showFriends)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors cursor-pointer"
            >
              <Users size={18} />
              <span>Friends</span>
            </button>
          )}

          <button
            onClick={() => getCurrentWebviewWindow().minimize()}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>

          <button
            onClick={() => getCurrentWebviewWindow().close()}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/20 hover:text-destructive transition-colors text-muted-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showFriends && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowFriends(false)}
          />
          <div className="fixed right-0 top-16 z-30 w-80 max-h-[calc(100vh-4rem)] bg-background/95 backdrop-blur-sm border border-border/30 rounded-lg shadow-2xl">
            <FriendsList />
          </div>
        </>
      )}
    </>
  );
}
