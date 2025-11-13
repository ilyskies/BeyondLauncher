"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Background } from "@/components/shared/background";
import { Check, Edit, Lock, AlertCircle } from "lucide-react";
import { useNavigate } from "@/lib/hooks/useNavigate";
import { useOnboarding } from "@/lib/stores/onboarding";
import { useSocketStore } from "@/lib/socket";
import { useAuth } from "@/lib/stores/auth";
import { useErrorBanners } from "@/lib/stores/error_banner";

export default function UsernameView() {
  const [username, setUsername] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const { completeStep, setStep, setUsername: saveUsername } = useOnboarding();
  const { send, isConnected } = useSocketStore();
  const { isAuthenticated } = useAuth();
  const { add } = useErrorBanners();

  useEffect(() => {
    setStep("username");
  }, [setStep]);

  const validateUsername = (value: string) => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      return "3-20 characters, letters, numbers, and underscores only";
    }

    const lowerValue = value.toLowerCase();

    if (/(.)\1{3,}/.test(value)) {
      return "Username contains too many repetitive characters";
    }

    const specialCharDensity =
      (value.match(/[0-9_]/g) || []).length / value.length;
    if (specialCharDensity > 0.6) {
      return "Username contains too many numbers or special characters";
    }

    const offensivePatterns = [
      /h[i1l|][t7][l1|][e3][r2]/,
      /[n|\|][a4@][z5$][i1l|]/,
      /[k<][k<][k<]/,
      /[w\\\/\/][h4#][i1l|][t7][e3][p9][o0@][w\\\/\/][e3][r2]/,
      /[j3][e3][w\\\/\/][k<][i1l|][l1|][l1|]/,
      /[h4#][e3][i1l|][l1|][e3][r2]/,
      /[h4#][i1l|][m\\\/\/][l1|][e3][r2]/,
      /[gq9][o0@][e3][b8][b8][e3][l1|][s5$]/,
      /[h4#][o0@][l1|][o0@][c<\(][a4@][u7][s5$][t7]/,
      /[s5$][h4#][o0@][a4@][h4#]/,
      /[j3][u7][d2][e3][n|\|][r2][a4@][t7]/,
      /[p9][o0@][gq9][r2][o0@][m\\\/\/]/,
      /[gq9][a4@][s5$][c<\(][h4@][a4@][m8][b8][e3][r2]/,
      /[n1|][i1l|][gq9][gq9e3]/,
      /f[a4@][gq9]/,
      /[r2][e3][t7][a4@][r2]/,
      /[c<\(][o0@][o0@][n|\|]/,
      /[k<][i1l|][k<][e3]/,
      /[c<\(][h4#][i1l|][n|\|][k<]/,
      /[gq9][o0@][o0@][k<]/,
      /[w\\\/\/][e3][t7][b8][a4@][c<\(][k<]/,
      /[t7][r2][a4@][n|\|][n|\|]/,
      /[t7][r2][o0@][o0@][n|\|]/,
      /[a4@][s5$][s5$]/,
      /[f7][u7][c<\(][k<]/,
      /[s5$][h4#][i1l|][t7]/,
      /[b8][i1l|][t7][c<\(][h4#]/,
      /[c<\(][u7][n|\|][t7]/,
      /[d2][i1l|][c<\(][k<]/,
      /[p9][u7][s5$][s5$][y4]/,
      /[w\\\/\/][h4#][o0@][r2][e3]/,
      /[s5$][l1|][u7][t7]/,
      /[c<\(][o0@][c<\(][k<]/,
      /[p9][e3][n|\|][i1l|][s5$]/,
      /[v\\\/\/][a4@][gq9][i1l|][n|\|][a4@]/,
      /[h4#][e3][l1|][l1|]/,
      /[m\\\/\/][o0@][t7][h4#][e3][r2][f7]/,
      /[d2][u7][m\\\/\/][b8][a4@][s5$][s5$]/,
      /[a4@][s5$][s5$][h4#][o0@][l1|][e3]/,
      /[s5$][h4#][i1l|][t7][h4#][e3][a4@][d2]/,
      /[f7][u7][c<\(][k<][f7][a4@][c<\(][e3]/,
      /[k<][i1l|][l1|][l1|]/,
      /[m\\\/\/][u7][r2][d2][e3][r2]/,
      /[r2][a4@][p9][e3]/,
      /[b8][o0@][m\\\/\/][b8]/,
      /[s5$][t7][a4@][b8]/,
      /[h4#][i1l|][t7][e3][r2]/,
      /[d2][i1l|][e3]/,
      /[s5$][u7][i1l|][c<\(][i1l|][d2][e3]/,
      /[h4@][a4@][n|\|][gq9]/,
      /[p9][o0@][i1l|][s5$][o0@][n|\|]/,
      /[b8][u7][r2][n|\|]/,
      /[s5$][e3][x%]/,
      /[p9][o0@][r2][n|\|]/,
      /[f7][a4@][p9]/,
      /[m\\\/\/][a4@][s5$][t7][u7][r2][b8][a4@][t7][e3]/,
      /[o0@][r2][gq9][a4@][s5$][m\\\/\/]/,
      /[p9][e3][n|\|][e3][t7][r2][a4@][t7][e3]/,
      /[b8][o0@][o0@][b8]/,
      /[t7][i1l|][t7]/,
      /[a4@][n|\|][a4@][l1|]/,
      /[b8][u7][t7][t7]/,
      /[c<\(][l1|][i1l|][t7]/,
      /[v\\\/\/][u7][l1|][v\\\/\/][a4@]/,
      /[d2][i1l|][l1|][d2][o0@]/,

      /i[h4#][a4@][t7][e3]/,
      /h[a4@][t7][e3]/,
      /k[i1l|][l1|][l1|][a4@][l1|][l1|]/,
      /d[e3][a4@][t7][h4#][t7][o0@]/,
      /[j3][e3][w\\\/\/][s5$]/,
      /[j3][u7][d2][e3][n|\|][i1l|][t7][y4]/,
      /[j3][u7][d2][a4@][i1l|][s5$][m\\\/\/]/,
      /[j3][u7][d2][a4@][i1l|][c<\(]/,
      /[gq9][o0@][y4][i1l|][m\\\/\/]/,
      /[m\\\/\/][u7][s5$][l1|][i1l|][m\\\/\/]/,
      /[i1l|][s5$][l1|][a4@][m\\\/\/]/,
      /[m\\\/\/][u7][s5$][l1|][e3][m\\\/\/]/,
      /[c<\(][h4#][r2][i1l|][s5$][t7][i1l|][a4@][n|\|]/,
      /[b8][u7][d2][d2][h4#][i1l|][s5$][t7]/,
      /[h4#][i1l|][n|\|][d2][u7][i1l|][s5$][t7]/,
      /[a4@][t7][h4#][e3][i1l|][s5$][t7]/,
      /[b8][l1|][a4@][c<\(][k<][p9][e3][o0@][p9][l1|][e3]/,
      /[w\\\/\/][h4#][i1l|][t7][e3][p9][e3][o0@][p9][l1|][e3]/,
      /[a4@][s5$][i1l|][a4@][n|\|][p9][e3][o0@][p9][l1|][e3]/,
      /[h4#][i1l|][s5$][p9][a4@][n|\|][i1l|][c<\(]/,
      /[l1|][a4@][t7][i1l|][n|\|][o0@]/,
      /[a4@][r2][a4@][b8]/,
      /[m\\\/\/][e3][x%][i1l|][c<\(][a4@][n|\|]/,
      /[a4@][f7][r2][i1l|][c<\(][a4@][n|\|]/,
    ];

    for (const pattern of offensivePatterns) {
      if (pattern.test(lowerValue)) {
        return "Username contains inappropriate content";
      }
    }

    if (/([a-z0-9])\1{2,}/i.test(value)) {
      return "Username contains too many repeating characters";
    }

    return null;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    const error = validateUsername(value);
    setValidationError(error || "");
    setIsValid(!error);
  };

  const handleLockUsername = () => {
    if (isValid) {
      setIsLocked(true);
    }
  };

  const handleEditUsername = () => {
    setIsLocked(false);
  };

  const handleContinue = async () => {
    if (isValid && !isAnimating && isLocked) {
      if (!isConnected || !isAuthenticated) {
        add({
          type: "error",
          title: "Connection Required",
          message:
            "Please ensure you are connected to the server before setting your username.",
          autoDismiss: true,
          dismissAfter: 5000,
        });
        return;
      }

      setIsAnimating(true);

      try {
        send("set_new_username", { username });

        saveUsername(username);
        completeStep("username");

        setTimeout(() => {
          console.log("Username set:", username);
          navigate("/onboarding/complete");
        }, 800);
      } catch (error) {
        console.error("Failed to set username:", error);
        add({
          type: "error",
          title: "Username Error",
          message: "Failed to set username. Please try again.",
          autoDismiss: true,
          dismissAfter: 5000,
        });
        setIsAnimating(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4">
      <Background />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-foreground mb-1">
              Choose a username
            </h1>
            <p className="text-muted-foreground text-sm">
              This is how others will see you
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>

            <div className="relative">
              {isLocked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center"
                >
                  <div className="w-full px-4 py-3 pr-12 bg-muted/50 border border-border rounded-lg text-muted-foreground cursor-not-allowed">
                    {username}
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <motion.button
                      onClick={handleEditUsername}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <motion.input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleLockUsername}
                    placeholder="Enter username"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="w-full px-4 py-3 pr-10 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:border-transparent transition-all duration-200 caret-[#5865F2] cursor-text"
                    style={{
                      caretColor: "#5865F2",
                    }}
                  />
                  {isValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                  {validationError && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {validationError ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {validationError}
              </motion.p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                3-20 characters, letters, numbers, and underscores only
              </p>
            )}
          </div>

          <motion.button
            onClick={handleContinue}
            disabled={!isValid || isAnimating || !isLocked}
            whileHover={
              isValid && isLocked && !isAnimating ? { scale: 1.02 } : {}
            }
            whileTap={
              isValid && isLocked && !isAnimating ? { scale: 0.98 } : {}
            }
            animate={isAnimating ? { scale: 0.98 } : {}}
            className={`
              w-full py-3 px-4 rounded-xl font-medium text-base transition-all duration-200 select-none cursor-pointer
              ${
                isValid && isLocked && !isAnimating
                  ? "bg-[#5865F2] hover:bg-[#4752C4] text-white cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            {isAnimating ? (
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Completing Setup...
              </div>
            ) : (
              "Complete Setup"
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
