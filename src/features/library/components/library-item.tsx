import { useState, useEffect, useRef, memo, useCallback } from "react";
import { Trash, FolderOpen, Lock, MoreVertical } from "lucide-react";
import { useBuildStore } from "@/features/library/stores/builds";
import { useToastStore } from "@/shared/stores/toast";
import { showNativeNotification } from "@/shared/utils/notifications";
import { invoke } from "@tauri-apps/api/core";
import { useSocketStore } from "@/core/socket";
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

export const LibraryItem = memo(function LibraryItem({
  title,
  version: _version,
  image,
  id,
  season,
  netcl,
  size: _size,
  supported = true,
  dateAdded: _dateAdded,
}: LibraryItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { removeBuild, setSelectedBuild, getBuild } = useBuildStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMenuOpen]);

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
    const interval = setInterval(checkGameStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const showError = useCallback(
    (title: string, message: string) => {
      addToast({
        type: "error",
        title,
        message,
        duration: 5000,
      });
    },
    [addToast]
  );

  const getExchangeCode = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        off("exchange_code", handleExchangeCode);
        reject(new Error("Exchange code request timed out"));
      }, 10000);

      const handleExchangeCode = (data: string) => {
        clearTimeout(timeout);
        off("exchange_code", handleExchangeCode);

        if (!data || data.trim() === "") {
          reject(new Error("Invalid or empty exchange code received"));
          return;
        }

        resolve(data);
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

        await showNativeNotification("Game Closed", `${title} has been closed`);
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

      await showNativeNotification("Game Launched", `${title} is now running`);
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

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      removeBuild(id);

      await showNativeNotification(
        "Build Deleted",
        `${title} has been removed from your library`
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
    }
  }, [id, removeBuild, showError, title]);

  const handleOpenFolder = useCallback(async () => {
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
  }, [getBuild, id, showError, title]);

  return (
    <>
      <div
        className="group relative w-full rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]"
        style={{ aspectRatio: "3/4" }}
        onClick={() => {
          if (!isMenuOpen && supported) {
            handlePlay();
          }
        }}
      >
        <div className="relative w-full h-full">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-[#0C0E12] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-black text-white/20">
                  {season || "S?"}
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

          {!supported && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Lock className="w-12 h-12 text-gray-400" />
                <p className="text-gray-300 text-sm font-semibold">
                  Not Available
                </p>
              </div>
            </div>
          )}

          {(isLaunching || isClosing || isGameRunning) && (
            <div className="absolute top-3 left-3">
              <div className="bg-gray-500/10 backdrop-blur-md border border-white/20 rounded-md px-2 py-1">
                <span className="text-white text-xs font-semibold">
                  {isLaunching
                    ? "Launching..."
                    : isClosing
                    ? "Closing..."
                    : "Running"}
                </span>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
            <p className="text-white/70 text-xs font-medium">
              {netcl?.replace("++Fortnite+Release-", "")}
            </p>
          </div>

          {supported && (
            <div className="absolute top-3 right-3 z-[100]">
              <button
                ref={buttonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (buttonRef.current) {
                    const rect = buttonRef.current.getBoundingClientRect();
                    setMenuPosition({
                      top: rect.top,
                      left: rect.right + 8,
                    });
                  }
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 hover:border-white/40 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[998]"
            onMouseDown={() => setIsMenuOpen(false)}
          />
          <div
            className="fixed w-48 bg-[#0C0E12] border-2 border-[#2a2a2a] rounded-md shadow-2xl overflow-hidden z-[999] animate-in fade-in-0 zoom-in-95 duration-200"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onMouseDown={async (e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                await handleOpenFolder();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 text-left transition-all duration-150 cursor-pointer border-b border-[#2a2a2a]"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="font-medium">Open Folder</span>
            </button>

            <button
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                handleDelete();
              }}
              disabled={isDeleting}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 text-left disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash className="w-4 h-4" />
                  <span className="font-medium">Delete</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </>
  );
});
