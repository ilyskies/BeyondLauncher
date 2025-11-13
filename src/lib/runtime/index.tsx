"use client";
import { useAuth } from "@/lib/stores/auth";
import { useConfig } from "@/lib/stores/config";
import { useSocketStore } from "@/lib/socket";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnoraUser } from "@/types/anora";
import { useErrorBanners } from "../stores/error_banner";
import { NewUsernameData } from "@/types/socket";

interface RuntimeProps {
  children: React.ReactNode;
}

interface SocketErrorData {
  message: string;
  critical?: boolean;
  type?: string;
}

const DISABLED_ROUTES = ["/updater", "/login"];

export const Runtime = ({ children }: RuntimeProps) => {
  const { token, isAuthenticated, updateUser, patchUser, setDisplayName } =
    useAuth();
  const { config, isDev } = useConfig();
  const { add } = useErrorBanners();
  const { initialize, connect, disconnect, send, on, off } = useSocketStore();
  const [version, setVersion] = useState<string>("...");
  const pathname = usePathname();

  const userHandlerRef = useRef<(user: AnoraUser) => void>(() => {});
  const sendRef = useRef(send);
  const errorHandlerRef = useRef<(errorData: SocketErrorData) => void>(
    () => {}
  );
  const isAuthenticatedRef = useRef(false);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    userHandlerRef.current = (user: AnoraUser) => {
      if (user?.UserAccount) {
        updateUser(user);
      }
    };
  }, [updateUser]);

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  useEffect(() => {
    errorHandlerRef.current = (errorData: SocketErrorData) => {
      let title = "Connection Error";
      let message = errorData.message;
      let type: "error" | "warning" = "error";

      if (
        errorData.message?.includes("Authentication failed") ||
        errorData.message?.includes("Invalid token")
      ) {
        title = "Authentication Failed";
        message = "Your session has expired. Please log in again.";
      } else if (errorData.message?.includes("Not authenticated")) {
        title = "Authentication Required";
        message = "Please log in to continue.";
      } else if (
        errorData.message?.includes("Connection timeout") ||
        errorData.message?.includes("Heartbeat timeout")
      ) {
        title = "Connection Timeout";
        message = "Lost connection to server. Reconnecting...";
        type = "warning";
      } else if (errorData.message?.includes("Max reconnection attempts")) {
        title = "Connection Failed";
        message =
          "Unable to connect to server. Please check your internet connection.";
      } else if (
        errorData.message?.includes("Invalid message format") ||
        errorData.type === "unknown_message"
      ) {
        title = "Communication Error";
        message = "There was a problem communicating with the server.";
        type = "warning";
      } else if (errorData.message?.includes("Server communication problem")) {
        type = "warning";
      }

      add({
        type,
        title,
        message,
        autoDismiss: !errorData.critical,
      });

      if (errorData.critical) {
        console.error("[Runtime] Critical socket error:", errorData);
      } else if (isDev) {
        console.warn("[Runtime] Socket warning:", errorData);
      }
    };
  }, [add, isDev]);

  const shouldEnableSocket = !DISABLED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    getVersion()
      .then(setVersion)
      .catch(() => setVersion("dev"));
  }, []);

  useEffect(() => {
    const handleError = (errorData: SocketErrorData) =>
      errorHandlerRef.current?.(errorData);

    on("error", handleError);
    return () => off("error", handleError);
  }, [on, off]);

  useEffect(() => {
    if (!shouldEnableSocket || !token || !isAuthenticated) {
      disconnect();
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

    const handleUserData = (user: AnoraUser) => userHandlerRef.current?.(user);

    const handleConnected = () => {
      console.log("[Runtime] Socket connected");
    };

    const handleAuthenticated = () => {
      console.log("[Runtime] Socket authenticated");
      sendRef.current("request_user", undefined);
    };

    const handleDisconnected = (data: { code: number; reason: string }) => {
      if (data.code === 1008 && data.reason.includes("token")) {
        errorHandlerRef.current?.({
          message: "Authentication failed",
          critical: true,
        });
      } else if (data.code === 1000 && data.reason.includes("timeout")) {
        errorHandlerRef.current?.({
          message: "Connection timeout",
          critical: false,
        });
      }
    };

    const handleNewUsername = (data: NewUsernameData) => {
      if (data.username) {
        setDisplayName(data.username);
        console.log("[Runtime] Username updated to:", data.username);
      }
    };

    on("user", handleUserData);
    on("connected", handleConnected);
    on("authenticated", handleAuthenticated);
    on("disconnected", handleDisconnected);
    on("new_username", handleNewUsername);

    connect().catch((err) => {
      errorHandlerRef.current?.({
        message: err.message || "Failed to connect to server",
        critical: true,
      });
    });

    return () => {
      off("user", handleUserData);
      off("connected", handleConnected);
      off("authenticated", handleAuthenticated);
      off("disconnected", handleDisconnected);
      off("new_username", handleNewUsername);
      disconnect();
    };
  }, [
    isAuthenticated,
    token,
    config.wsEndpoint,
    initialize,
    connect,
    disconnect,
    version,
    shouldEnableSocket,
    isDev,
    on,
    off,
    patchUser,
    setDisplayName,
  ]);

  return <>{children}</>;
};

export default Runtime;
