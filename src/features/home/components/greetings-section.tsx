"use client";

import { BeyondUser } from "@/shared/types/beyond";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSocketStore } from "@/core/socket";

interface GreetingsSectionProps {
  user: BeyondUser;
}

export function GreetingsSection({ user }: GreetingsSectionProps) {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const { send } = useSocketStore();

  const favoriteCharacter = user?.Profiles?.Athena?.FavoriteCharacter || "";
  const displayName = user?.UserAccount?.DisplayName || "Player";
  const roleColor = user?.UserAccount?.RoleColor || "#ffffff";

  const characterImageUrl = favoriteCharacter
    ? `https://fortnite-api.com/images/cosmetics/br/${favoriteCharacter}/icon.png`
    : "https://fortnite-api.com/images/cosmetics/br/cid_001_athena_commando_f_default/icon.png";

  useEffect(() => {
    send("request_player_count", undefined);

    const interval = setInterval(() => {
      send("request_player_count", undefined);
    }, 30000);

    return () => clearInterval(interval);
  }, [send]);

  useEffect(() => {
    const { on, off } = useSocketStore.getState();

    const handlePlayerCount = (data: {
      playersOnline: number;
      friendsOnline: number;
    }) => {
      setPlayerCount(data.playersOnline);
    };

    on("player_count_update", handlePlayerCount);

    return () => {
      off("player_count_update", handlePlayerCount);
    };
  }, []);

  return (
    <div className="w-[640px] h-[90px] flex items-center px-6 rounded-lg overflow-visible select-none relative z-10 animate-in fade-in slide-in-from-left-4 duration-500 bg-[#0a0e1a]/60 backdrop-blur-md border border-white/10 shadow-xl">
      <div className="relative h-[120px] w-[220px] -ml-[70px] -mt-9 scale-x-[-1]">
        <Image
          src={characterImageUrl}
          alt={favoriteCharacter || "Character"}
          className="absolute bottom-0 left-0 object-contain"
          style={{
            imageRendering: "crisp-edges",
            WebkitFontSmoothing: "antialiased",
          }}
          fill
          priority
        />
      </div>

      <div className="-ml-10">
        <h1 className="text-xl font-bold text-white flex items-center">
          Welcome back,{" "}
          <span style={{ color: roleColor }} className="ml-1">
            {displayName}
          </span>
        </h1>
        <p className="text-[#b0b0b0] text-sm">
          There are currently{" "}
          <span className="text-white font-semibold">{playerCount}</span>{" "}
          players online!
        </p>
      </div>
    </div>
  );
}
