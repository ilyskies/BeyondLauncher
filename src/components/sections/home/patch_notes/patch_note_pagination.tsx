"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PatchNotePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  unreadCount: number;
}

export function PatchNotePagination({
  currentPage,
  totalPages,
  onPageChange,
  unreadCount,
}: PatchNotePaginationProps) {
  return (
    <div className="flex items-center justify-end gap-4 mt-6">
      {unreadCount > 0 && (
        <div className="text-sm text-muted-foreground mr-4">
          <span className="font-medium text-foreground">{unreadCount}</span>
          <span className="ml-1">unread</span>
        </div>
      )}

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(139, 92, 246, 0.1)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-foreground rounded-md hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <div className="text-sm text-foreground font-medium px-2 min-w-[40px] text-center">
          {currentPage}/{totalPages}
        </div>

        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(139, 92, 246, 0.1)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-foreground rounded-md hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
