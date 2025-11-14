"use client";

import { motion } from "framer-motion";
import { PatchNote } from "@/types/socket";
import { usePatchNotesStore } from "@/lib/stores/patch_notes_store";

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
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="bg-card border border-border rounded-xl hover:border-accent/40 transition-all duration-300 cursor-pointer group hover:shadow-lg relative p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex-shrink-0 overflow-hidden">
          {note.image && (
            <div
              className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
              style={{ backgroundImage: `url(${note.image})` }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
              {note.title}
            </h3>
            {!isNoteRead && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium uppercase tracking-wide group-hover:bg-accent transition-colors duration-200"
              >
                UNREAD
              </motion.span>
            )}
          </div>

          <p className="text-foreground font-medium text-sm mb-2 group-hover:text-foreground/90 transition-colors duration-200">
            {note.subtitle}
          </p>

          <p className="text-muted-foreground text-sm mb-2 leading-relaxed line-clamp-2 group-hover:text-muted-foreground/90 transition-colors duration-200">
            {note.content
              .split("\n\n")[0]
              .replace(/^#.*$/gm, "")
              .replace(/[*-]/g, "")
              .trim()}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="group-hover:text-foreground/80 transition-colors duration-200">
              {note.date}
            </span>
            {note.author && (
              <span className="group-hover:text-primary transition-colors duration-200">
                by @{note.author}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}
