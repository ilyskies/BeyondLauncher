"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";

export type BannerType = "error" | "warning" | "info" | "success";

interface NotificationBannerProps {
  type: BannerType;
  title: string;
  message: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissAfter?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NotificationBanner = ({
  type,
  title,
  message,
  onDismiss,
  autoDismiss = true,
  dismissAfter = 5000,
  action,
}: NotificationBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  useEffect(() => {
    if (autoDismiss && isVisible) {
      const timer = setTimeout(handleDismiss, dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissAfter, handleDismiss, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-full mx-4">
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-5 animate-in slide-in-from-top duration-300">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="text-foreground font-semibold text-base mb-2">
              {title}
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {message}
            </p>

            {action && (
              <button
                onClick={action.onClick}
                className="mt-3 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                {action.label}
              </button>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 hover:bg-foreground/10 rounded-xl transition-all duration-200 cursor-pointer group"
          >
            <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
