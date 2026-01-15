"use client";

import { motion } from "framer-motion";
import { PatchNote } from "@/shared/types/socket";
import { usePatchNotesStore } from "@/features/patch-notes/stores/patch-notes-store";

interface PatchNoteCardProps {
  note: PatchNote;
  index: number;
  onSelect: (note: PatchNote) => void;
}

export function PatchNoteCard({ note, index, onSelect }: PatchNoteCardProps) {
  const { isRead, markAsRead } = usePatchNotesStore();
  const isNoteRead = isRead(note.id);

  const handleClick = () => {
    if (!isNoteRead) {
      markAsRead(note.id);
    }
    onSelect(note);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className="bg-[#0C0E12] border-2 border-[#2a2a2a] rounded-lg hover:border-[#3a3a3a] transition-all duration-200 cursor-pointer group hover:shadow-xl relative p-5"
    >
      <div className="flex items-start gap-4">
        {note.image && (
          <div className="w-20 h-20 rounded-md flex-shrink-0 overflow-hidden border border-[#2a2a2a]">
            <div
              className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundImage: `url(${note.image})` }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors duration-200">
              {note.title}
            </h3>
            {!isNoteRead && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                className="bg-white/10 text-white px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border border-white/20"
              >
                NEW
              </motion.span>
            )}
          </div>

          <p className="text-white/70 font-medium text-sm mb-3">
            {note.subtitle}
          </p>

          <p className="text-white/60 text-sm mb-3 leading-relaxed line-clamp-2">
            {note.content
              .split("\n\n")[0]
              .replace(/^#.*$/gm, "")
              .replace(/[*-]/g, "")
              .trim()}
          </p>

          <div className="flex items-center justify-between text-xs text-white/50">
            <span>
              {note.date}
            </span>
            {note.author && (
              <span className="font-medium">
                by @{note.author}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
