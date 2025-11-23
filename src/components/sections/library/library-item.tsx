import { useState, useEffect } from "react";
import { MoreVertical, Trash, FolderOpen, Lock } from "lucide-react";
import Image from "next/image";
import { useBuildStore } from "@/lib/stores/builds";
import { useErrorBanners } from "@/lib/stores/error_banner";
import { invoke } from "@tauri-apps/api/core";
import { useSocketStore } from "@/lib/socket";
import { openPath } from "@tauri-apps/plugin-opener";

interface LibraryItemProps {
  title: string;
  version: string;
  image?: string;
  id: string;
  season?: string;
  netcl?: string;
  size?: string;
  supported?: boolean;
  dateAdded?: string;
}

export function LibraryItem({
  title,
  version,
  image,
  id,
  season,
  netcl,
  size,
  supported = true,
  dateAdded,
}: LibraryItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { removeBuild, setSelectedBuild, getBuild } = useBuildStore();
  const { add: addErrorBanner } = useErrorBanners();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isHovered) {
        return;
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isHovered]);

  useEffect(() => {
    const checkGameStatus = async () => {
      try {
        const running = await invoke<boolean>("is_game_running");
        setIsGameRunning(running);
        if (!running) {
          setIsClosing(false);
        }
      } catch (error) {
        console.error("Failed to check game status:", error);
      }
    };

    checkGameStatus();
    const interval = setInterval(checkGameStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const showError = (title: string, message: string) => {
    addErrorBanner({
      type: "error",
      title,
      message,
      autoDismiss: true,
      dismissAfter: 5000,
    });
  };

  const showSuccess = (title: string, message: string) => {
    addErrorBanner({
      type: "success",
      title,
      message,
      autoDismiss: true,
      dismissAfter: 3000,
    });
  };

  const getExchangeCode = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        off("exchange_code", handleExchangeCode);
        reject(new Error("Exchange code request timed out"));
      }, 10000);

      const handleExchangeCode = (data: { Code: string }) => {
        clearTimeout(timeout);
        off("exchange_code", handleExchangeCode);

        if (!data?.Code || data.Code.trim() === "") {
          reject(new Error("Invalid or empty exchange code received"));
          return;
        }

        resolve(data.Code);
      };

      const { send, on, off } = useSocketStore.getState();
      on("exchange_code", handleExchangeCode);
      send("request_exchange_code", undefined);
    });
  };

  const handlePlay = async () => {
    if (!supported) {
      showError("Build Not Supported", `${title} is not currently supported.`);
      return;
    }

    if (isLaunching || isClosing) return;

    if (isGameRunning) {
      setIsClosing(true);
      try {
        await invoke("close_game");
        showSuccess("Game Closed", `${title} has been closed`);
      } catch (error) {
        console.error("Failed to close game:", error);
        showError(
          "Close Failed",
          `Failed to close ${title}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setIsClosing(false);
      }
      return;
    }

    setIsLaunching(true);

    try {
      setSelectedBuild(id);

      const build = getBuild(id);
      if (!build) {
        showError("Build Not Found", `Could not find build: ${title}`);
        setIsLaunching(false);
        return;
      }

      const shippingPath = `${build.path}\\FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe`;

      const exists = await invoke<boolean>("check_file_exists", {
        path: shippingPath,
      });
      if (!exists) {
        showError(
          "Executable Not Found",
          `Fortnite executable not found at: ${shippingPath}`
        );
        setIsLaunching(false);
        return;
      }

      const exchangeCode = await getExchangeCode();

      const isLaunched = await invoke<boolean>("launch_game", {
        filePath: shippingPath,
        exchangeCode,
      });

      if (!isLaunched) {
        throw new Error("Failed to launch");
      }

      showSuccess("Game Launched", `${title} is now running`);
    } catch (error) {
      console.error("Failed to launch build:", error);
      showError(
        "Launch Failed",
        `Failed to launch ${title}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLaunching(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      removeBuild(id);
      showSuccess(
        "Build Deleted",
        `${title} has been removed from your library.`
      );
    } catch (error) {
      console.error("Failed to delete build:", error);
      showError(
        "Delete Failed",
        `Failed to delete ${title}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
      setIsMenuOpen(false);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const build = getBuild(id);
      if (!build) {
        showError("Build Not Found", `Could not find build: ${title}`);
        return;
      }

      await openPath(build.path);
    } catch (error) {
      console.error("Failed to open folder:", error);
      showError(
        "Open Folder Failed",
        `Failed to open folder: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="w-full cursor-pointer"
      style={{ aspectRatio: "3/4" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full h-[calc(100%-70px)] overflow-hidden rounded-lg"
        onClick={(e) => {
          if (!isMenuOpen && supported) {
            handlePlay();
          }
        }}
      >
        {image ? (
          <Image src={image} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/50 to-accent/40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-black text-primary/40">
                {season || "S?"}
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

        {isHovered && !isMenuOpen && (
          <div className="absolute inset-0 bg-white/10 rounded-lg" />
        )}

        {!supported && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Lock className="w-14 h-14 text-gray-400" />
              <p className="text-gray-300 text-sm font-semibold">
                Not Available
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 h-20 flex flex-col justify-between bg-gradient-to-b from-card/80 to-card border-t border-border/50">
        <h3 className="text-foreground font-bold text-sm truncate">{title}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className="text-xs font-semibold cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              style={{
                color: isLaunching
                  ? "rgb(101, 160, 255)"
                  : isClosing
                  ? "rgb(101, 160, 255)"
                  : isGameRunning
                  ? "rgb(168, 85, 247)"
                  : "rgb(148, 163, 184)",
              }}
            >
              {isLaunching
                ? "Launching"
                : isClosing
                ? "Closing"
                : isGameRunning
                ? "Running"
                : "Launch"}
            </span>
            <span className="text-xs text-muted-foreground">
              {netcl?.replace("++Fortnite+Release-", "")}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-1 cursor-pointer hover:bg-primary/20 rounded transition-colors duration-150"
            >
              <MoreVertical className="w-5 h-5 text-muted-foreground hover:text-primary" />

              {isMenuOpen && (
                <>
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl z-[9999] overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200"
                    style={{
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <div className="bg-primary/10 px-4 py-2 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                        Info
                      </p>
                    </div>

                    <div className="px-4 py-3 space-y-2 text-xs border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="text-foreground font-mono">
                          {size || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Added:</span>
                        <span className="text-foreground">
                          {formatDate(dateAdded)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFolder();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 text-left border-b border-border cursor-pointer transition-colors duration-150"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span className="font-semibold">Open Folder</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      disabled={isDeleting}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 text-left disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                          <span className="font-semibold">Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash className="w-4 h-4" />
                          <span className="font-semibold">Delete</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div
                    className="fixed inset-0 z-[9998] animate-in fade-in-0 duration-150"
                    onClick={() => setIsMenuOpen(false)}
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
