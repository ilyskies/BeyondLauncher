"use client";

import { useState, useEffect } from "react";

export default function Updater() {
  const [progress, setProgress] = useState(0);
  const [displayedProgress, setDisplayedProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setDisplayedProgress((prev) => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.5) return progress;
        return prev + diff * 0.2;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [progress]);

  return (
    <div
      className="h-screen w-screen relative flex flex-col items-center justify-center text-white overflow-hidden select-none"
      style={{
        backgroundImage: "url('/bg/splash.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        imageRendering: "auto",
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <div className="text-lg text-yellow-100/80 mb-6">
          {Math.floor(displayedProgress)}%
        </div>
      </div>
    </div>
  );
}
