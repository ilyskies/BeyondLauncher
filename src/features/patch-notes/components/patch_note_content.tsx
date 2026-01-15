"use client";

import { PatchNote } from "@/shared/types/socket";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, User } from "lucide-react";

interface PatchNoteContentProps {
  note: PatchNote;
  onClose: () => void;
}

export function PatchNoteContent({ note, onClose }: PatchNoteContentProps) {
  const renderContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => {
      if (paragraph.startsWith("# ")) {
        return (
          <motion.h2
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.08 }}
            className="text-2xl font-bold text-white mb-4"
          >
            {paragraph.replace("# ", "")}
          </motion.h2>
        );
      } else if (paragraph.startsWith("## ")) {
        return (
          <motion.h3
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.08 }}
            className="text-xl font-semibold text-white mb-3"
          >
            {paragraph.replace("## ", "")}
          </motion.h3>
        );
      } else if (paragraph.startsWith("- **")) {
        const items = paragraph
          .split("\n")
          .filter((item) => item.startsWith("- **"));
        return (
          <motion.ul
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 + index * 0.08 }}
            className="space-y-2 mb-5"
          >
            {items.map((item, itemIndex) => (
              <motion.li
                key={itemIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.08 + itemIndex * 0.04 }}
                className="flex items-start gap-3 text-white/80"
              >
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full mt-2 flex-shrink-0" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: item
                      .replace("- **", "<strong class='text-white'>")
                      .replace("**", "</strong>"),
                  }}
                />
              </motion.li>
            ))}
          </motion.ul>
        );
      }
      return (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + index * 0.08 }}
          className="text-white/80 leading-relaxed mb-5"
        >
          {paragraph}
        </motion.p>
      );
    });
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between mb-8"
      >
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="flex items-center gap-3 text-white hover:text-white/80 transition-colors duration-200 cursor-pointer group bg-[#0C0E12] border-2 border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg px-4 py-2.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-sm">Back</span>
        </motion.button>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-right"
        >
          <div className="text-white font-semibold text-sm">{note.date}</div>
          {note.author && (
            <div className="text-white/60 text-xs">
              by <span className="text-white/80">@{note.author}</span>
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-2"
        >
          {note.title}
        </motion.h1>
        <p className="text-white/70 text-lg font-medium">{note.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative rounded-lg overflow-hidden mb-6 border-2 border-[#2a2a2a] h-64"
      >
        {note.image ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${note.image})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0C0E12]" />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#0C0E12] border-2 border-[#2a2a2a] rounded-lg p-8"
      >
        <div className="prose prose-invert max-w-none text-white/80 leading-relaxed">
          {renderContent(note.content)}
        </div>

        {(note.views || note.author) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-[#2a2a2a]"
          >
            <div className="flex items-center gap-4 text-white/60">
              {note.views && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-md border border-[#2a2a2a]"
                >
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold text-sm">
                    {note.views.toLocaleString()} views
                  </span>
                </motion.div>
              )}
              {note.author && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-md border border-[#2a2a2a]"
                >
                  <User className="w-4 h-4" />
                  <span className="font-semibold text-sm">@{note.author}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
