"use client";

import { Minus, X } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export function Frame() {
  return (
    <div
      data-tauri-drag-region
      className="flex h-10 items-center justify-between bg-titlebar px-3 select-none border-b border-border/50"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">Anora</span>
      </div>

      <div className="flex items-center gap-1">
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
  );
}
