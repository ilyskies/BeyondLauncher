"use client";

import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Background } from "@/components/shared/background";
import { getVersion } from "@tauri-apps/api/app";
import { useNavigate } from "@/lib/hooks/useNavigate";
import { useAuth } from "@/lib/stores/auth";
import { open } from "@tauri-apps/plugin-shell";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useOnboarding } from "@/lib/stores/onboarding";

type LoginStatus = "idle" | "loading" | "success" | "failed";

export default function Login() {
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [version, setVersion] = useState("...");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { completedSteps } = useOnboarding();

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  const handleLogin = async () => {
    if (status !== "idle") return;

    setStatus("loading");
    try {
      const callback = await fetch(
        "http://127.0.0.1:5078/discord/api/callback"
      );
      const response = await callback.text();

      if (response) {
        await open(response);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setStatus("failed");
    }
  };

  const handleDeepLink = useCallback(
    async (urls: string[]) => {
      const anoraToken = urls.find((url) => url.startsWith("anora://"));
      if (!anoraToken) return;

      try {
        const token = anoraToken
          .replace("anora://", "")
          .replace(/\//g, "")
          .trim();
        if (!token) {
          setStatus("failed");
          return;
        }

        const win = getCurrentWindow();
        await win.setFocus();

        setStatus("success");
        login(token);

        const isOnboardingComplete = completedSteps.includes("complete");
        navigate(isOnboardingComplete ? "/home" : "/onboarding/terms");
      } catch (error) {
        console.error("Failed to handle deep link:", error);
        setStatus("failed");
      }
    },
    [login, navigate, completedSteps]
  );

  useEffect(() => {
    let unlistenUrl: (() => void) | undefined;
    let unlistenEvent: (() => void) | undefined;

    const setupDeepLinks = async () => {
      try {
        unlistenUrl = await onOpenUrl(handleDeepLink);
        unlistenEvent = await listen<string[]>("deep-link", (event) => {
          handleDeepLink(event.payload);
        });
      } catch (error) {
        console.error("Failed to setup deep link listeners:", error);
      }
    };

    setupDeepLinks();

    return () => {
      unlistenUrl?.();
      unlistenEvent?.();
    };
  }, [handleDeepLink]);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        const isOnboardingComplete = completedSteps.includes("complete");
        navigate(isOnboardingComplete ? "/home" : "/onboarding/terms");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, completedSteps]);
  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4">
      <Background />

      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Welcome to Anora
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in with your Discord account to continue
            </p>
          </div>

          <button
            onClick={handleLogin}
            disabled={status !== "idle"}
            className={`
              py-3 px-4 rounded-xl w-full flex items-center justify-center transition-all duration-200 font-medium text-base
              ${
                status === "success"
                  ? "bg-green-600 text-white"
                  : status === "failed"
                  ? "bg-red-600 text-white"
                  : status === "loading"
                  ? "bg-[#5865F2] text-white cursor-not-allowed"
                  : "bg-[#5865F2] hover:bg-[#4752C4] hover:scale-[1.02] active:scale-[0.98] text-white cursor-pointer"
              }
              ${status === "idle" ? "shadow-lg hover:shadow-xl" : ""}
            `}
          >
            <div className="flex items-center justify-center w-full">
              {status === "loading" && (
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
              )}
              {status === "success" && <CheckCircle className="w-5 h-5 mr-2" />}
              {status === "failed" && <XCircle className="w-5 h-5 mr-2" />}

              <span>
                {status === "loading" && "Waiting for authentication..."}
                {status === "success" && "Success! Redirecting..."}
                {status === "failed" && "Authentication failed"}
                {status === "idle" && "Sign in with Discord"}
              </span>
            </div>
          </button>

          {status === "failed" && (
            <button
              onClick={() => setStatus("idle")}
              className="mt-3 w-full py-2 text-muted-foreground hover:text-foreground text-sm transition-colors cursor-pointer"
            >
              Try again
            </button>
          )}

          <div className="flex items-center justify-between mt-8 text-xs text-muted-foreground">
            <span>v{version}</span>
            <span className="font-semibold text-foreground/80">ANORA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
