import { useCallback, useRef, useEffect } from "react";
import { BeyondUser } from "@/shared/types/beyond";
import { useAuth } from "@/features/auth/stores/auth";
import { SocketEvent, SocketEventMap } from "@/shared/types/socket";

export function useProfileSync(
  send: <T extends SocketEvent>(type: T, data: SocketEventMap[T]) => void,
  isAuthenticated: boolean
) {
  const { updateUser } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUserDataRef = useRef<string>("");
  const isAuthenticatedRef = useRef(false);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const handleUserUpdate = useCallback(
    (newUser: BeyondUser) => {
      if (!newUser?.UserAccount) return;

      const newUserString = JSON.stringify(newUser);
      if (newUserString !== lastUserDataRef.current) {
        lastUserDataRef.current = newUserString;
        updateUser(newUser);
      }
    },
    [updateUser]
  );

  const startSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    send("request_user", undefined);
    send("request_profile_update", undefined);

    intervalRef.current = setInterval(() => {
      if (isAuthenticatedRef.current) {
        console.log("[Runtime] Requesting user data update");
        send("request_user", undefined);
        send("request_profile_update", undefined);
      }
    }, 30000);
  }, [send]);

  const stopSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { handleUserUpdate, startSync, stopSync };
}
