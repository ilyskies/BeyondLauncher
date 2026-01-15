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
      <div className="flex items-center gap-2 bg-[#0C0E12] border-2 border-[#2a2a2a] rounded-md p-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-white/70 rounded-md hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <div className="text-sm text-white/80 font-semibold px-3 min-w-[50px] text-center">
          {currentPage} / {totalPages}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-white/70 rounded-md hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
