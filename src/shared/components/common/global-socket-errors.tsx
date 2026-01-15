"use client";

import { useSocketErrors } from "@/shared/hooks/useSocketErrors";

export const GlobalSocketErrorHandler = () => {
  useSocketErrors();
  return null;
};
