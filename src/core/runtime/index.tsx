"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getVersion } from "@tauri-apps/api/app";

import { useAuth } from "@/features/auth/stores/auth";
import { useConfig } from "@/shared/stores/config";
import { useSocketStore } from "@/core/socket";
import { useUsernameCheck } from "@/features/onboarding/stores/username-check";

import { useSocketErrorHandler } from "./hooks/use-socket-error-handler";
import { useProfileSync } from "./hooks/use-profile-sync";
import { createSocketHandlers } from "./socket-handlers";

const DISABLED_ROUTES = ["/updater", "/login"];

interface RuntimeProps {
  children: React.ReactNode;
}

export const Runtime = ({ children }: RuntimeProps) => {
  const { token, isAuthenticated, setDisplayName } = useAuth();
  const { config } = useConfig();
  const { initialize, connect, disconnect, send, on, off } = useSocketStore();
  const { setAvailability } = useUsernameCheck.getState();
  const pathname = usePathname();
  const [version, setVersion] = useState<string>("...");

  const handleError = useSocketErrorHandler();
  const { handleUserUpdate, startSync, stopSync } = useProfileSync(
    send,
    isAuthenticated
  );

  const shouldEnableSocket = !DISABLED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    getVersion()
      .then(setVersion)
      .catch(() => setVersion("dev"));
  }, []);

  useEffect(() => {
    if (!shouldEnableSocket || !token || !isAuthenticated) {
      disconnect();
      stopSync();
      return;
    }

    const socketConfig = {
      url: `${config.wsEndpoint}?token=${token}`,
      version,
      token,
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
    };

    initialize(socketConfig);

    const handlers = createSocketHandlers(
      handleUserUpdate,
      startSync,
      stopSync,
      setDisplayName,
      setAvailability,
      handleError
    );

    on("user", handlers.onUserUpdate);
    on("connected", handlers.onConnected);
    on("authenticated", handlers.onAuthenticated);
    on("disconnected", handlers.onDisconnected);
    on("new_username", handlers.onNewUsername);
    on("username_available", handlers.onUsernameAvailable);
    on("username_taken", handlers.onUsernameTaken);
    on("profile_update", handlers.onProfileUpdate);
    on("error", handlers.onError);

    connect().catch((err) => {
      stopSync();
      handleError({
        message: err.message || "Failed to connect to server",
        critical: true,
      });
    });

    return () => {
      stopSync();
      off("user", handlers.onUserUpdate);
      off("connected", handlers.onConnected);
      off("authenticated", handlers.onAuthenticated);
      off("disconnected", handlers.onDisconnected);
      off("new_username", handlers.onNewUsername);
      off("username_available", handlers.onUsernameAvailable);
      off("username_taken", handlers.onUsernameTaken);
      off("profile_update", handlers.onProfileUpdate);
      off("error", handlers.onError);
      disconnect();
    };
  }, [
    shouldEnableSocket,
    token,
    isAuthenticated,
    config.wsEndpoint,
    version,
    initialize,
    connect,
    disconnect,
    on,
    off,
    handleUserUpdate,
    startSync,
    stopSync,
    setDisplayName,
    setAvailability,
    handleError,
  ]);

  return <>{children}</>;
};

export default Runtime;
