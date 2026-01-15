import { BeyondUser } from "@/shared/types/beyond";
import { NewUsernameData } from "@/shared/types/socket";

export interface SocketHandlers {
  onUserUpdate: (user: BeyondUser) => void;
  onConnected: () => void;
  onAuthenticated: () => void;
  onDisconnected: (data: { code: number; reason: string }) => void;
  onNewUsername: (data: NewUsernameData) => void;
  onUsernameAvailable: (data: { username: string; available: boolean }) => void;
  onUsernameTaken: (data: { username: string }) => void;
  onProfileUpdate: (data: { user: BeyondUser }) => void;
  onError: (error: {
    message: string;
    critical?: boolean;
    type?: string;
  }) => void;
}

export function createSocketHandlers(
  handleUserUpdate: (user: BeyondUser) => void,
  startSync: () => void,
  stopSync: () => void,
  setDisplayName: (name: string) => void,
  setUsernameAvailability: (available: boolean, error: string) => void,
  handleError: (error: { message: string; critical?: boolean; type?: string }) => void
): SocketHandlers {
  return {
    onUserUpdate: handleUserUpdate,

    onConnected: () => {
      console.log("[Runtime] Socket connected");
    },

    onAuthenticated: () => {
      startSync();
    },

    onDisconnected: (data) => {
      stopSync();
      if (data.code === 1008 && data.reason.includes("token")) {
        handleError({
          message: "Authentication failed",
          critical: true,
        });
      } else if (data.code === 1000 && data.reason.includes("timeout")) {
        handleError({
          message: "Connection timeout",
          critical: false,
        });
      }
    },

    onNewUsername: (data) => {
      if (data.username) {
        setDisplayName(data.username);
        console.log("[Runtime] Username updated to:", data.username);
      }
    },

    onUsernameAvailable: (data) => {
      console.log("[Runtime] Username available:", data);
      setUsernameAvailability(
        data.available,
        data.available ? "" : "Username is already taken"
      );
    },

    onUsernameTaken: (data) => {
      console.log("[Runtime] Username taken:", data);
      setUsernameAvailability(false, "Username is already taken");
    },

    onProfileUpdate: (data) => {
      if (data.user) {
        handleUserUpdate(data.user);
      }
    },

    onError: handleError,
  };
}
