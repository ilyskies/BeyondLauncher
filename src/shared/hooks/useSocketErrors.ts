import { useEffect } from "react";
import { useSocketStore } from "@/core/socket";
import { useToastStore } from "@/shared/stores/toast";
import { useAuth } from "@/features/auth/stores/auth";

export const useSocketErrors = () => {
  const { addToast } = useToastStore();
  const { logout } = useAuth();

  useEffect(() => {
    const { on, off } = useSocketStore.getState();

    const handleSocketError = (errorData: {
      message: string;
      critical: boolean;
      type?: string;
    }) => {
      const errorMap = {
        "authentication required": {
          type: "warning" as const,
          title: "Authentication Required",
          message: "Please authenticate to establish connection.",
        },
        "authentication failed": {
          type: "error" as const,
          title: "Authentication Failed",
          message: "Your session has expired. Please log in again.",
        },
        "authentication error": {
          type: "error" as const,
          title: "Authentication Error",
          message: "There was a problem verifying your session.",
        },
        "token has been invalidated due to inactivity": {
          type: "error" as const,
          title: "Session Expired",
          message:
            "Your session has expired due to inactivity. Please log in again.",
        },
        "session expired due to inactivity": {
          type: "error" as const,
          title: "Session Expired",
          message:
            "Your session has expired due to inactivity. Please log in again.",
        },
        "session terminated": {
          type: "error" as const,
          title: "Session Terminated",
          message: "Your session has been terminated.",
        },
        "not authenticated": {
          type: "error" as const,
          title: "Not Authenticated",
          message: "Please log in to perform this action.",
        },
        "missing message type": {
          type: "warning" as const,
          title: "Communication Error",
          message: "There was a problem processing your request.",
        },
        "invalid message format": {
          type: "warning" as const,
          title: "Invalid Request",
          message: "The request format is invalid.",
        },
        "username is required": {
          type: "warning" as const,
          title: "Username Required",
          message: "Please enter a username.",
        },
        "username is already taken": {
          type: "warning" as const,
          title: "Username Taken",
          message: "This username is already taken. Please choose another one.",
        },
        "failed to check username availability": {
          type: "error" as const,
          title: "System Error",
          message: "Unable to check username availability. Please try again.",
        },
        "failed to set username": {
          type: "error" as const,
          title: "Update Failed",
          message: "Unable to update username. Please try again.",
        },
        "failed to complete setup": {
          type: "error" as const,
          title: "Setup Failed",
          message: "Unable to complete setup. Please try again.",
        },
        "unknown message type": {
          type: "warning" as const,
          title: "Unknown Request",
          message: "The system received an unknown request type.",
        },
        "heartbeat timeout": {
          type: "error" as const,
          title: "Connection Lost",
          message: "Lost connection to server. Attempting to reconnect...",
        },
        "connection lost": {
          type: "error" as const,
          title: "Connection Lost",
          message: "Lost connection to the server. Attempting to reconnect...",
        },
        "rate limited": {
          type: "warning" as const,
          title: "Rate Limited",
          message: "You're sending too many requests. Please slow down.",
        },
      };

      const lowerMessage = errorData.message.toLowerCase();
      const matchedError = Object.entries(errorMap).find(([key]) =>
        lowerMessage.includes(key)
      );

      if (matchedError) {
        const [, errorConfig] = matchedError;
        addToast({
          ...errorConfig,
          duration: errorData.critical ? 0 : 5000,
        });

        if (
          errorConfig.message.includes("session has expired") ||
          errorConfig.message.includes("log in again") ||
          errorConfig.message.includes("not authenticated")
        ) {
          setTimeout(() => logout(), 2000);
        }
      } else {
        addToast({
          type: errorData.critical ? "error" : "warning",
          title: "Connection Error",
          message: errorData.message,
          duration: errorData.critical ? 0 : 5000,
        });
      }
    };

    on("error", handleSocketError);

    return () => {
      off("error", handleSocketError);
    };
  }, [addToast, logout]);
};
