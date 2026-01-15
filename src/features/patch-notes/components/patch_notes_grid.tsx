"use client";

import { motion } from "framer-motion";
import { PatchNote } from "@/shared/types/socket";
import { PatchNoteCard } from "./patch_note_card";

interface PatchNotesGridProps {
  patchNotes: PatchNote[];
  onNoteSelect: (note: PatchNote) => void;
}

export function PatchNotesGrid({
  patchNotes,
  onNoteSelect,
}: PatchNotesGridProps) {
  return (
    <motion.div
      key={`grid-${patchNotes.map((n) => n.id).join("-")}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {patchNotes.map((note, index) => (
        <PatchNoteCard
          key={note.id}
          note={note}
          index={index}
          onSelect={onNoteSelect}
        />
      ))}
    </motion.div>
  );
}
