"use client";

import { useState, memo, useCallback } from "react";
import {
  FolderOpen,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ImportCard } from "./import-card";
import { LibraryItem } from "./library-item";
import { Modal } from "@/shared/components/ui/modal";
import { useBuildStore } from "@/features/library/stores/builds";
import {
  addBuildToLibrary,
  importBuild,
  ImportResult,
} from "@/shared/utils/importBuild";
import Image from "next/image";

export const LibrarySection = memo(function LibrarySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [buildInfo, setBuildInfo] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { builds, addBuild } = useBuildStore();

  const handleOpenModal = useCallback(() => {
    setStep(1);
    setSelectedPath("");
    setBuildInfo(null);
    setError(null);
    setIsVerifying(false);
    setIsImporting(false);
    setIsModalOpen(true);
  }, []);

  const handleSelectFolder = useCallback(async () => {
    setIsVerifying(true);
    setError(null);
    setBuildInfo(null);

    try {
      const result = await importBuild();

      if (!result) {
        setIsVerifying(false);
        return;
      }

      setSelectedPath(result.path);
      setBuildInfo(result);
    } catch (err) {
      console.error("Import error:", err);
      setError(err instanceof Error ? err.message : "Failed to import build");
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const handleContinue = useCallback(async () => {
    if (step === 1 && buildInfo) {
      setStep(2);
    } else if (step === 2 && buildInfo && !isImporting) {
      setIsImporting(true);
      setError(null);

      try {
        const success = await addBuildToLibrary(buildInfo);

        if (success) {
          setIsModalOpen(false);
          setTimeout(() => {
            setStep(1);
            setSelectedPath("");
            setBuildInfo(null);
            setIsImporting(false);
          }, 300);
        } else {
          setError("Failed to add build to library");
        }
      } catch (err) {
        console.error("Add to library error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to add build to library"
        );
      } finally {
        setIsImporting(false);
      }
    }
  }, [step, buildInfo, isImporting]);

  return (
    <div className="flex h-full flex-col gap-6 p-12 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white animate-in fade-in-0 slide-in-from-top-3 duration-700">
          Library
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 animate-in fade-in-0 duration-1000">
        {builds.map((build, index) => (
          <div
            key={build.id}
            className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5 duration-700"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <LibraryItem
              title={build.title}
              version={build.version}
              image={build.image!}
              id={build.id}
              season={build.season}
              size={build.size}
              dateAdded={build.dateAdded}
              netcl={build.netcl}
              supported={build.supported}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 right-8 w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg shadow-2xl hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 flex items-center justify-center z-50 border border-white/30"
        aria-label="Add Build"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add an installation"
        step={`Step ${step} of 2`}
      >
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-7 duration-500">
            <div className="space-y-2 text-sm">
              <p className="text-white/70 leading-relaxed">
                Select the folder containing the{" "}
                <code className="px-1.5 py-0.5 bg-white/5 border border-[#2a2a2a] rounded text-white/80 font-mono text-xs">
                  FortniteGame
                </code>{" "}
                and{" "}
                <code className="px-1.5 py-0.5 bg-white/5 border border-[#2a2a2a] rounded text-white/80 font-mono text-xs">
                  Engine
                </code>{" "}
                directories.
              </p>
            </div>

            {buildInfo && (
              <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 px-3 py-2 text-green-400 text-sm animate-in fade-in-0 slide-in-from-top-7 duration-500">
                <CheckCircle className="h-4 w-4 flex-shrink-0 animate-in zoom-in-95 duration-700" />
                <span className="font-semibold">Build Identified!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-red-400 text-sm animate-in fade-in-0 slide-in-from-top-7 duration-500">
                <AlertCircle className="h-4 w-4 flex-shrink-0 animate-in zoom-in-95 duration-700" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wide">
                Build Path
              </label>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <div className="w-full rounded-md border-2 border-[#2a2a2a] bg-[#13171C] px-3 py-2.5 text-sm text-white/60 font-mono truncate">
                    {selectedPath || "No folder selected"}
                  </div>
                </div>
                <button
                  onClick={handleSelectFolder}
                  disabled={isVerifying}
                  className="flex cursor-pointer items-center justify-center rounded-md border-2 border-[#2a2a2a] bg-[#13171C] hover:bg-[#1a1e24] hover:border-white/30 transition-all duration-200 px-3 py-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FolderOpen className="h-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#2a2a2a]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={!buildInfo || isVerifying}
                className="cursor-pointer flex items-center gap-2 rounded-md bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Continue →
              </button>
            </div>
          </div>
        )}
        {step === 2 && buildInfo && (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-7 duration-500">
            {isImporting ? (
              <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-700">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
                <p className="mt-4 font-semibold text-white text-sm">
                  Adding to library...
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-md border-2 border-[#2a2a2a] bg-[#13171C] animate-in zoom-in-95 duration-700">
                  <div className="relative h-28 w-full">
                    <Image
                      src={buildInfo?.image as string}
                      alt="Build"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E12] to-transparent" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden border-2 border-[#2a2a2a] bg-[#0C0E12] flex-shrink-0">
                        <Image
                          src={buildInfo?.image as string}
                          alt="Icon"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-0.5">
                        <h3 className="text-sm font-bold text-white">
                          {buildInfo!.title}
                        </h3>
                        <p className="font-mono text-xs text-white/60">
                          {buildInfo!.netcl}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#2a2a2a]">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="cursor-pointer text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={isImporting}
                    className="cursor-pointer flex items-center gap-2 rounded-md bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 active:scale-95"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Add Build
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
});
