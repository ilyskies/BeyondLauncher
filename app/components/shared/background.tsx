"use client";

import { useEffect, useRef } from "react";

export function Background() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 - 50 + "%";
      particle.style.animationDuration = 8 + Math.random() * 4 + "s";
      particle.style.animationDelay = Math.random() * 2 + "s";
      container.appendChild(particle);
    }
  }, []);

  return <div ref={containerRef} className="background" />;
}
