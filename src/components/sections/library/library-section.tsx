"use client";

import { useState } from "react";
import {
  FolderOpen,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ImportCard } from "./import-card";
import { LibraryItem } from "./library-item";
import { Modal } from "@/components/ui/modal";
import { useBuildStore } from "@/lib/stores/builds";
import {
  addBuildToLibrary,
  importBuild,
  ImportResult,
} from "@/lib/utils/importBuild";
import Image from "next/image";

export function LibrarySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [buildInfo, setBuildInfo] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { builds, addBuild } = useBuildStore();

  const handleOpenModal = () => {
    setStep(1);
    setSelectedPath("");
    setBuildInfo(null);
    setError(null);
    setIsVerifying(false);
    setIsImporting(false);
    setIsModalOpen(true);
  };

  const handleSelectFolder = async () => {
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
  };

  const handleContinue = async () => {
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
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white animate-in fade-in-0 slide-in-from-top-3 duration-700">
          Library
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 animate-in fade-in-0 duration-1000">
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
        <div className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5 duration-700">
          <ImportCard onClick={handleOpenModal} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add an installation"
        step={`Step ${step} of 2`}
      >
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-7 duration-500">
            <div className="space-y-2 text-sm">
              <p className="text-zinc-300 leading-relaxed">
                Select the folder containing the{" "}
                <code className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-white/80 font-mono text-xs">
                  FortniteGame
                </code>{" "}
                and{" "}
                <code className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-white/80 font-mono text-xs">
                  Engine
                </code>{" "}
                directories.
              </p>
            </div>

            {buildInfo && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-3 py-2 text-emerald-300 text-sm animate-in fade-in-0 slide-in-from-top-7 duration-500">
                <CheckCircle className="h-4 w-4 flex-shrink-0 animate-in zoom-in-95 duration-700" />
                <span className="font-semibold">Build Identified!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-500/40 px-3 py-2 text-red-300 text-sm animate-in fade-in-0 slide-in-from-top-7 duration-500">
                <AlertCircle className="h-4 w-4 flex-shrink-0 animate-in zoom-in-95 duration-700" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-2 uppercase tracking-wide">
                Build Path
              </label>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <div className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-zinc-400 font-mono truncate transition-all duration-500">
                    {selectedPath || "No folder selected"}
                  </div>
                </div>
                <button
                  onClick={handleSelectFolder}
                  disabled={isVerifying}
                  className="flex cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-white/10 hover:bg-white/15 transition-all duration-500 px-3 py-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105 hover:border-white/40"
                >
                  {isVerifying ? (
                    <Loader2 className="h-4 w-4 animate-spin duration-700" />
                  ) : (
                    <FolderOpen className="h-4 w-4 transition-transform duration-500 hover:scale-110" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer text-xs font-medium text-zinc-400 hover:text-white transition-all duration-500 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={!buildInfo || isVerifying}
                className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105"
              >
                Continue{" "}
                <span className="transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        )}
        {step === 2 && buildInfo && (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-7 duration-500">
            {isImporting ? (
              <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-700">
                <Loader2 className="h-10 w-10 animate-spin text-primary duration-1000" />
                <p className="mt-4 font-semibold text-white text-sm animate-pulse duration-1000">
                  Adding to library...
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 animate-in zoom-in-95 duration-700">
                  <div className="relative h-28 w-full">
                    <Image
                      src={buildInfo?.image as string}
                      alt="Build"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1115] to-transparent" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden border border-white/10 bg-zinc-800 flex-shrink-0">
                        <Image
                          src={buildInfo?.image as string}
                          alt="Icon"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-0.5">
                        <h3 className="text-sm font-bold text-white">
                          {buildInfo!.title}
                        </h3>
                        <p className="font-mono text-xs text-zinc-400">
                          {buildInfo!.netcl}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="cursor-pointer text-xs font-medium text-zinc-400 hover:text-white transition-all duration-500 hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={isImporting}
                    className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-500 disabled:opacity-50 active:scale-95 hover:scale-105"
                  >
                    <CheckCircle className="h-4 w-4 transition-transform duration-500 group-hover:scale-110" />{" "}
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
}
