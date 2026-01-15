"use client";

import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Particles from "@/shared/components/ui/particles";
import { getVersion } from "@tauri-apps/api/app";
import { useNavigate } from "@/shared/hooks/useNavigate";
import { useAuth } from "@/features/auth/stores/auth";
import { open } from "@tauri-apps/plugin-shell";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useOnboarding } from "@/features/onboarding/stores/onboarding";
import { apiClient, API_ENDPOINTS } from "@/core/api";

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
      const response = await apiClient.get<{ authUrl?: string }>(
        API_ENDPOINTS.auth.discordCallback,
        {
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
        }
      );

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.location;
        if (location) {
          await open(location);
          return;
        }
      }

      if (response.data.authUrl) {
        await open(response.data.authUrl);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setStatus("failed");
    }
  };

  const handleDeepLink = useCallback(
    async (urls: string[]) => {
      const beyondToken = urls.find((url) => url.startsWith("beyond://"));
      if (!beyondToken) return;

      try {
        const token = beyondToken
          .replace("beyond://", "")
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
        navigate(isOnboardingComplete ? "/home" : "/onboarding/username");
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
        navigate(isOnboardingComplete ? "/home" : "/onboarding/username");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, completedSteps]);
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 animate-in fade-in duration-500">
      <Particles quantity={90} staticity={70} ease={50} />

      <div className="relative z-10 w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150">
        <div className="rounded-2xl p-8 bg-[#0a0e1a]/70 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-white mb-1">
              Welcome to Beyond
            </h1>
            <p className="text-white/70 text-sm">
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
              className="mt-3 w-full py-2 text-white/70 hover:text-white text-sm transition-colors cursor-pointer"
            >
              Try again
            </button>
          )}

          <div className="flex items-center justify-between mt-8 text-xs text-white/70">
            <span>v{version}</span>
            <span className="font-semibold text-white/80">BEYOND</span>
          </div>
        </div>
      </div>
    </div>
  );
}
