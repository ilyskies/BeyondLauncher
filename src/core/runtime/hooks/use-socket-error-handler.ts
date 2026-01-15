import { useCallback } from "react";
import { useToastStore } from "@/shared/stores/toast";
import { useAuth } from "@/features/auth/stores/auth";
import { useConfig } from "@/shared/stores/config";

interface SocketErrorData {
  message: string;
  critical?: boolean;
  type?: string;
}

export function useSocketErrorHandler() {
  const { addToast } = useToastStore();
  const { logout } = useAuth();
  const { isDev } = useConfig();

  const handleError = useCallback(
    (errorData: SocketErrorData) => {
      const errorInfo = getErrorInfo(errorData);

      if (errorInfo.shouldLogout) {
        logout();
      }

      addToast({
        type: errorInfo.type,
        title: errorInfo.title,
        message: errorInfo.message,
        duration: errorData.critical ? 0 : 5000,
      });

      if (errorData.critical) {
        console.error("[Runtime] Critical socket error:", errorData);
      } else if (isDev) {
        console.warn("[Runtime] Socket warning:", errorData);
      }
    },
    [addToast, logout, isDev]
  );

  return handleError;
}

function getErrorInfo(errorData: SocketErrorData) {
  const { message, type: errorType } = errorData;

  if (
    message?.includes("session has expired") ||
    message?.includes("Token expired") ||
    message?.includes("token expired")
  ) {
    return {
      type: "error" as const,
      title: "Session Expired",
      message: "Your session has expired. Please log in again.",
      shouldLogout: true,
    };
  }

  if (
    message?.includes("account has been banned") ||
    message?.includes("user is banned")
  ) {
    return {
      type: "error" as const,
      title: "Account Banned",
      message: "Your account has been banned. Please contact support.",
      shouldLogout: true,
    };
  }

  if (
    message?.includes("session has been terminated") ||
    message?.includes("Token invalidated") ||
    message?.includes("token invalidated")
  ) {
    return {
      type: "error" as const,
      title: "Session Terminated",
      message: "Your session has been terminated. Please log in again.",
      shouldLogout: true,
    };
  }

  if (
    message?.includes("Authentication failed") ||
    message?.includes("Invalid token")
  ) {
    return {
      type: "error" as const,
      title: "Authentication Failed",
      message: "Your session is invalid. Please log in again.",
      shouldLogout: true,
    };
  }

  if (message?.includes("Not authenticated")) {
    return {
      type: "error" as const,
      title: "Authentication Required",
      message: "Please log in to continue.",
      shouldLogout: false,
    };
  }

  if (
    message?.includes("Connection timeout") ||
    message?.includes("Heartbeat timeout")
  ) {
    return {
      type: "warning" as const,
      title: "Connection Timeout",
      message: "Lost connection to server. Reconnecting...",
      shouldLogout: false,
    };
  }

  if (message?.includes("Max reconnection attempts")) {
    return {
      type: "error" as const,
      title: "Connection Failed",
      message:
        "Unable to connect to server. Please check your internet connection.",
      shouldLogout: false,
    };
  }

  if (
    message?.includes("Invalid message format") ||
    errorType === "unknown_message"
  ) {
    return {
      type: "warning" as const,
      title: "Communication Error",
      message: "There was a problem communicating with the server.",
      shouldLogout: false,
    };
  }

  if (message?.includes("Server communication problem")) {
    return {
      type: "warning" as const,
      title: "Connection Error",
      message,
      shouldLogout: false,
    };
  }

  return {
    type: "error" as const,
    title: "Connection Error",
    message,
    shouldLogout: false,
  };
}
