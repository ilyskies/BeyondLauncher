"use client";

import { useSocketStore } from "@/core/socket";
import { useAuth } from "@/features/auth/stores/auth";
import { WifiOff, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const SocketBanner = () => {
  const { isConnected, isConnecting, connect, connectionError } =
    useSocketStore();
  const { isAuthenticated } = useAuth();

  const showBanner = isAuthenticated && !isConnected && !isConnecting;

  const handleRetry = () => {
    connect().catch(console.error);
  };

  if (!showBanner && !isConnecting) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div 
          className="bg-white/5 backdrop-blur-xl border border-amber-500/30 rounded-xl px-6 py-3.5 flex items-center gap-4"
          style={{
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.15), 0 10px 40px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center justify-center">
            {isConnecting ? (
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-white">
              {isConnecting ? "Connecting to Beyond" : connectionError ? "Connection Failed" : "Connection Lost"}
            </p>
            <p className="text-xs text-white/60">
              {isConnecting
                ? "Establishing secure connection..."
                : connectionError || "Attempting to reconnect..."}
            </p>
          </div>
          {!isConnecting && (
            <button
              onClick={handleRetry}
              className="ml-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 backdrop-blur-sm hover:scale-105 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
