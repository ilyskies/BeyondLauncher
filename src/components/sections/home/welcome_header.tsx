"use client";

import { useState, useEffect, useRef } from "react";
import { Users, UserPlus } from "lucide-react";
import { useSocketStore } from "@/lib/socket";

export function WelcomeHeader({ username }: { username: string }) {
  const [showPlayers, setShowPlayers] = useState(true);
  const [playersOnline, setPlayersOnline] = useState(0);
  const [friendsOnline, setFriendsOnline] = useState(0);
  const [animate, setAnimate] = useState(false);
  const { send, on, off, isConnected } = useSocketStore();
  const playerCountIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPlayerCountRef = useRef<string>("");

  useEffect(() => {
    if (isConnected) {
      send("request_player_count", undefined);

      playerCountIntervalRef.current = setInterval(() => {
        send("request_player_count", undefined);
      }, 2000);

      return () => {
        if (playerCountIntervalRef.current) {
          clearInterval(playerCountIntervalRef.current);
          playerCountIntervalRef.current = null;
        }
      };
    } else {
      if (playerCountIntervalRef.current) {
        clearInterval(playerCountIntervalRef.current);
        playerCountIntervalRef.current = null;
      }
    }
  }, [isConnected, send]);

  useEffect(() => {
    const handlePlayerCountUpdate = (data: {
      playersOnline: number;
      friendsOnline: number;
    }) => {
      const newDataString = JSON.stringify(data);
      if (newDataString !== lastPlayerCountRef.current) {
        console.log("[WelcomeHeader] Player count updated:", data);
        lastPlayerCountRef.current = newDataString;

        const oldPlayers = playersOnline;
        const oldFriends = friendsOnline;

        setPlayersOnline(data.playersOnline);
        setFriendsOnline(data.friendsOnline);

        if (
          data.playersOnline !== oldPlayers ||
          data.friendsOnline !== oldFriends
        ) {
          setAnimate(true);
          setTimeout(() => setAnimate(false), 600);
        }
      } else {
        console.log("[WelcomeHeader] Player count unchanged");
      }
    };

    on("player_count_update", handlePlayerCountUpdate);

    return () => {
      off("player_count_update", handlePlayerCountUpdate);
    };
  }, [on, off, playersOnline, friendsOnline]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPlayers((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (playerCountIntervalRef.current) {
        clearInterval(playerCountIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-3xl font-bold text-primary">
          Welcome back, <span className="text-accent">{username}</span>. Ready
          to play?
        </h2>
        <div className="text-accent text-lg mt-2 h-7 relative overflow-hidden flex items-center gap-2">
          <div className="relative w-5 h-5 flex-shrink-0">
            <Users
              className={`absolute inset-0 transition-all duration-500 ${
                showPlayers
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-75 -rotate-90"
              }`}
            />
            <UserPlus
              className={`absolute inset-0 transition-all duration-500 ${
                !showPlayers
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-75 rotate-90"
              }`}
            />
          </div>

          <div
            className="absolute left-7 transition-all duration-500 ease-in-out"
            style={{
              transform: showPlayers ? "translateY(0)" : "translateY(-100%)",
              opacity: showPlayers ? 1 : 0,
            }}
          >
            <span
              className={`inline-block font-semibold transition-transform duration-300 ${
                animate && showPlayers ? "scale-125" : "scale-100"
              }`}
            >
              {playersOnline}
            </span>{" "}
            {playersOnline == 1 ? "player" : "players"} online
          </div>
          <div
            className="absolute left-7 transition-all duration-500 ease-in-out"
            style={{
              transform: showPlayers ? "translateY(100%)" : "translateY(0)",
              opacity: showPlayers ? 0 : 1,
            }}
          >
            <span
              className={`inline-block font-semibold transition-transform duration-300 ${
                animate && !showPlayers ? "scale-125" : "scale-100"
              }`}
            >
              {friendsOnline}
            </span>{" "}
            {friendsOnline == 1 ? "friend" : "friends"} online
          </div>
        </div>
      </div>
    </div>
  );
}
