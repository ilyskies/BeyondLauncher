"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/stores/auth";
import { useState, useEffect, memo, useMemo } from "react";
import { useSocketStore } from "@/core/socket";

type FriendStatus = "online" | "away" | "offline";

interface Friend {
  id: string;
  displayName: string;
  avatar: string;
  discordId: string;
  status: FriendStatus;
  presence: string;
}

const FriendItem = memo(function FriendItem({
  friend,
  statusColor,
  index,
}: {
  friend: Friend;
  statusColor: Record<FriendStatus, string>;
  index: number;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getStatusAnimation = () => {
    if (friend.status === "online") {
      return {
        scale: [1, 1.2, 1],
        opacity: [1, 0.8, 1],
      };
    } else if (friend.status === "away") {
      return {
        opacity: [1, 0.6, 1],
      };
    }
    return {};
  };

  const statusTransition =
    friend.status === "online"
      ? { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
      : friend.status === "away"
      ? { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
      : { delay: index * 0.05 + 0.2 };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.05,
      }}
      whileHover={{
        scale: 1.02,
        x: 4,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer group relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative flex-shrink-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.1, type: "spring" }}
        >
          {friend.avatar ? (
            <>
              {!imageLoaded && (
                <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
              )}
              <motion.img
                src={`https://cdn.discordapp.com/avatars/${friend.discordId}/${friend.avatar}.png?size=64`}
                alt={`${friend.displayName}'s avatar`}
                className="w-9 h-9 rounded-full object-cover"
                loading="lazy"
                style={{ display: imageLoaded ? "block" : "none" }}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  setImageLoaded(false);
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </>
          ) : null}
          {(!friend.avatar || !imageLoaded) && friend.avatar === "" && (
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {friend.displayName[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </motion.div>

        <motion.span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0c10] ${
            statusColor[friend.status]
          }`}
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            ...getStatusAnimation(),
          }}
          transition={statusTransition}
        />
      </div>

      <div className="flex-1 min-w-0 relative z-10">
        <motion.p
          className="text-sm font-semibold text-white truncate"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.15 }}
        >
          {friend.displayName}
        </motion.p>
        <motion.p
          className="text-xs text-white/50 truncate"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.2 }}
        >
          {friend.presence}
        </motion.p>
      </div>
    </motion.div>
  );
});

export function FriendsList() {
  const { user } = useAuth();
  const { send, on, off } = useSocketStore();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    send("request_friends", undefined);

    const handleFriends = (data: { friends: Friend[] }) => {
      setFriends(data.friends || []);
    };

    on("friends_list", handleFriends);

    return () => {
      off("friends_list", handleFriends);
    };
  }, [send, on, off]);

  const { onlineFriends, awayFriends, offlineFriends } = useMemo(() => {
    return {
      onlineFriends: friends.filter((f) => f.status === "online"),
      awayFriends: friends.filter((f) => f.status === "away"),
      offlineFriends: friends.filter((f) => f.status === "offline"),
    };
  }, [friends]);

  const statusColor: Record<FriendStatus, string> = useMemo(
    () => ({
      online: "bg-green-500",
      away: "bg-yellow-500",
      offline: "bg-white/20",
    }),
    []
  );

  const renderFriendGroup = (
    friends: Friend[],
    label: string,
    groupIndex: number
  ) => {
    if (friends.length === 0) return null;

    return (
      <motion.div
        key={label}
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.4,
          delay: groupIndex * 0.1,
          type: "spring",
          stiffness: 200,
        }}
      >
        <motion.p
          className="text-xs font-semibold text-white/50 uppercase tracking-wider px-2 mb-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: groupIndex * 0.1 + 0.1 }}
        >
          {label} — {friends.length}
        </motion.p>

        <motion.div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {friends.map((friend, index) => (
              <FriendItem
                key={friend.id}
                friend={friend}
                statusColor={statusColor}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  };

  if (!user) {
    return (
      <motion.div
        className="flex flex-col h-full items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <motion.p
          className="text-sm text-white/50"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Not authenticated
        </motion.p>
      </motion.div>
    );
  }

  if (friends.length === 0) {
    return (
      <motion.div
        className="flex flex-col h-full items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-white/20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </motion.div>
        <motion.p
          className="text-sm text-white/50 mt-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          No friends yet
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {renderFriendGroup(onlineFriends, "Online", 0)}
          {renderFriendGroup(awayFriends, "Away", 1)}
          {renderFriendGroup(offlineFriends, "Offline", 2)}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
