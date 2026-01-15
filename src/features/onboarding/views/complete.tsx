"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/features/onboarding/stores/onboarding";
import { useSocketStore } from "@/core/socket";
import { useAuth } from "@/features/auth/stores/auth";
import { Background } from "@/shared/components/common/background";
import { CheckCircle, Loader2, Rocket } from "lucide-react";

export default function OnboardingCompleteView() {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const { completeStep, setStep } = useOnboarding();
  const { isConnected, send } = useSocketStore();
  const { user } = useAuth();

  useEffect(() => {
    setStep("complete");
    completeStep("complete");

    if (isConnected && user) {
      send("setup_complete", undefined);
    }

    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2800),
      setTimeout(() => setStage(3), 4400),
      setTimeout(() => router.push("/home"), 7000),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [send, isConnected, user, router, setStep, completeStep]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Background />

      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/80 backdrop-blur-xl rounded-xl border border-border p-6"
        >
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">
                Onboarding Complete
              </h1>
              <div className="flex justify-center space-x-1.5">
                {[1, 2, 3].map((step) => (
                  <motion.div
                    key={step}
                    initial={{ scale: 0 }}
                    animate={{ scale: stage >= step ? 1 : 0.5 }}
                    className={`w-1.5 h-1.5 rounded-full ${
                      stage >= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {stage === 0 && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <Loader2 className="w-5 h-5 text-primary animate-spin mx-auto" />
                  <p className="text-muted-foreground text-sm">
                    Finalizing setup...
                  </p>
                </motion.div>
              )}

              {stage === 1 && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-foreground text-sm">
                      Profile ready
                    </span>
                  </div>
                  {user?.UserAccount?.DisplayName && (
                    <p className="text-primary font-medium text-sm">
                      Welcome, {user.UserAccount.DisplayName}
                    </p>
                  )}
                </motion.div>
              )}

              {stage === 2 && (
                <motion.div
                  key="connection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isConnected ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                    )}
                    <span className="text-foreground text-sm">
                      {isConnected ? "Connected" : "Connecting..."}
                    </span>
                  </div>
                </motion.div>
              )}

              {stage === 3 && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"
                  >
                    <Rocket className="w-5 h-5 text-primary" />
                  </motion.div>

                  <div className="space-y-1">
                    <p className="text-foreground font-medium text-sm">
                      Ready to go!
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Redirecting to home...
                    </p>
                  </div>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.6, ease: "easeInOut" }}
                    className="h-0.5 bg-primary/60 rounded-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
