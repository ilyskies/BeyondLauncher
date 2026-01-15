"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { usePatchNotesStore } from "@/features/patch-notes/stores/patch-notes-store";
import { PatchNotesGrid } from "@/features/patch-notes/components/patch-notes-grid";
import { PatchNotePagination } from "@/features/patch-notes/components/patch-note-pagination";
import { PatchNoteModal } from "@/features/patch-notes/components/patch-note-modal";
import { useSocketStore } from "@/core/socket";
import { PatchNote } from "@/shared/types/socket";

const PATCH_NOTES_PER_PAGE = 2;

export function PatchNotesSection() {
  const [selectedNote, setSelectedNote] = useState<PatchNote | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [patchNotes, setPatchNotes] = useState<PatchNote[]>([]);
  const { markAllAsRead, markAsRead } = usePatchNotesStore();
  const { send, on, off, isConnected } = useSocketStore();

  const totalPages = Math.ceil(patchNotes.length / PATCH_NOTES_PER_PAGE);
  const startIndex = (currentPage - 1) * PATCH_NOTES_PER_PAGE;
  const currentPatchNotes = patchNotes.slice(
    startIndex,
    startIndex + PATCH_NOTES_PER_PAGE
  );

  const unreadCount = patchNotes.filter((note) => {
    const { readPatchNotes } = usePatchNotesStore.getState();
    if (readPatchNotes instanceof Set) {
      return !readPatchNotes.has(note.id);
    } else if (Array.isArray(readPatchNotes)) {
      return !readPatchNotes.includes(note.id);
    }
    return true;
  }).length;

  useEffect(() => {
    if (isConnected) {
      send("request_patch_notes", undefined);
    }
  }, [isConnected, send]);

  useEffect(() => {
    const handlePatchNotesUpdate = (data: { patchNotes: PatchNote[] }) => {
      setPatchNotes(data.patchNotes);
    };

    on("patch_notes_update", handlePatchNotesUpdate);

    return () => {
      off("patch_notes_update", handlePatchNotesUpdate);
    };
  }, [on, off]);

  const handleNoteSelect = (note: PatchNote) => {
    setSelectedNote(note);
    markAsRead(note.id);

    if (isConnected) {
      send("mark_patch_note_read", { noteId: note.id });
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();

    if (isConnected) {
      patchNotes.forEach((note) => {
        send("mark_patch_note_read", { noteId: note.id });
      });
    }
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      requestAnimationFrame(() => {
        setCurrentPage(1);
      });
    }
  }, [currentPage, totalPages]);

  return (
    <>
      <div className="w-full animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Patch Notes</h2>
            {unreadCount > 0 && (
              <p className="text-white/60 text-sm">
                {unreadCount} new {unreadCount === 1 ? "update" : "updates"}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-white/80 hover:text-white transition-colors duration-200 cursor-pointer text-sm font-medium px-4 py-2 rounded-md hover:bg-white/5"
            >
              Mark all as read
            </button>
          )}
        </div>

        <PatchNotesGrid
          patchNotes={currentPatchNotes}
          onNoteSelect={handleNoteSelect}
        />

        {totalPages > 1 && (
          <PatchNotePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            unreadCount={unreadCount}
          />
        )}
      </div>

      <AnimatePresence>
        {selectedNote && (
          <PatchNoteModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
