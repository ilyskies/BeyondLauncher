"use client";

import { PatchNote } from "@/types/socket";
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
            transition={{ delay: 0.7 + index * 0.1 }}
            className="text-2xl font-bold text-foreground mb-6 text-primary"
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
            transition={{ delay: 0.7 + index * 0.1 }}
            className="text-xl font-semibold text-foreground mb-4 text-accent"
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
            transition={{ delay: 0.8 + index * 0.1 }}
            className="space-y-2 mb-6"
          >
            {items.map((item, itemIndex) => (
              <motion.li
                key={itemIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 + itemIndex * 0.05 }}
                className="flex items-start gap-3 text-foreground"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: item
                      .replace("- **", "<strong>")
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
          transition={{ delay: 0.7 + index * 0.1 }}
          className="text-foreground leading-relaxed mb-6 text-lg"
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
          className="flex items-center gap-3 text-primary hover:text-accent transition-colors duration-200 cursor-pointer group bg-secondary/50 hover:bg-secondary rounded-2xl px-4 py-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Patch Notes</span>
        </motion.button>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-right"
        >
          <div className="text-foreground font-medium text-lg">{note.date}</div>
          {note.author && (
            <div className="text-muted-foreground">
              Written by <span className="text-primary">@{note.author}</span>
            </div>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          {note.title}
        </motion.h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden mb-8 border-2 border-border/50 h-64"
      >
        {note.image ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${note.image})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10" />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card/50 border-2 border-border rounded-3xl p-8 backdrop-blur-sm"
      >
        <div className="prose prose-invert max-w-none">
          {renderContent(note.content)}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 pt-6 border-t border-border/50"
        >
          <div className="flex items-center gap-6 text-muted-foreground">
            {note.views && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-full"
              >
                <Eye className="w-5 h-5" />
                <span className="font-semibold">
                  {note.views.toLocaleString()} views
                </span>
              </motion.div>
            )}
            {note.author && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-full"
              >
                <User className="w-5 h-5" />
                <span className="font-semibold">@{note.author}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
