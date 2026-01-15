"use client";

import { motion } from "framer-motion";
import { PatchNoteContent } from "./patch_note_content";
import { PatchNote } from "@/shared/types/socket";
import { usePatchNotesStore } from "@/features/patch-notes/stores/patch-notes-store";

interface PatchNoteModalProps {
  note: PatchNote;
  onClose: () => void;
}

export function PatchNoteModal({ note, onClose }: PatchNoteModalProps) {
  const { markAsRead } = usePatchNotesStore();

  const handleOpen = () => {
    markAsRead(note.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0A0C10]/98 backdrop-blur-xl z-50 overflow-y-auto"
      onClick={onClose}
      onAnimationComplete={handleOpen}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: 0.25,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="min-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <PatchNoteContent note={note} onClose={onClose} />
      </motion.div>
    </motion.div>
  );
}
