"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { usePatchNotesStore } from "@/lib/stores/patch_notes_store";
import { PatchNotesGrid } from "./patch_notes/patch_notes_grid";
import { PatchNotePagination } from "./patch_notes/patch_note_pagination";
import { PatchNoteModal } from "./patch_notes/patch_note_modal";
import { useSocketStore } from "@/lib/socket";
import { PatchNote } from "@/types/socket";

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
      <div className="w-full">
        <div className="border-b border-border/50 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Patch Notes
          </h2>
          {unreadCount > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                {unreadCount} unread {unreadCount === 1 ? "update" : "updates"}
              </p>
              <button
                onClick={handleMarkAllAsRead}
                className="text-primary hover:text-accent transition-colors duration-200 cursor-pointer text-sm font-medium"
              >
                Mark all as read
              </button>
            </div>
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
