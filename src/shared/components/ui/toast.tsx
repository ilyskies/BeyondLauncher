"use client";

import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0 && !isPaused) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          setIsExiting(true);
          setTimeout(() => onClose(id), 300);
        }
      }, 10);

      return () => clearInterval(interval);
    }
  }, [id, duration, onClose, isPaused]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const styles = {
    success: "bg-white/5 border-green-500/40",
    error: "bg-white/5 border-red-500/40",
    warning: "bg-white/5 border-yellow-500/40",
    info: "bg-white/5 border-blue-500/40",
  };

  const glowStyles = {
    success: "shadow-[0_0_20px_rgba(34,197,94,0.2)]",
    error: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
    warning: "shadow-[0_0_20px_rgba(234,179,8,0.2)]",
    info: "shadow-[0_0_20px_rgba(59,130,246,0.2)]",
  };

  const progressColors = {
    success: "bg-green-500/60",
    error: "bg-red-500/60",
    warning: "bg-yellow-500/60",
    info: "bg-blue-500/60",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{
        opacity: isExiting ? 0 : 1,
        x: isExiting ? 100 : 0,
        scale: isExiting ? 0.8 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`${styles[type]} ${glowStyles[type]} border rounded-lg overflow-hidden backdrop-blur-xl min-w-[320px] max-w-md relative group hover:scale-105 transition-transform cursor-default`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex-shrink-0 mt-0.5"
          >
            {icons[type]}
          </motion.div>
          <div className="flex-1 min-w-0">
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-white font-semibold text-sm mb-1"
            >
              {title}
            </motion.h3>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/70 text-xs leading-relaxed"
              >
                {message}
              </motion.p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className={`h-full ${progressColors[type]} transition-all duration-100`}
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
