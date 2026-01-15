"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

interface BannerItem {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  glowColor: string;
}

const defaultBanners: BannerItem[] = [
  {
    id: "1",
    subtitle: "Chapter 1 Season X",
    title: "OUT OF TIME",
    description:
      "Time is fractured. Classic locations return with a twist as rifts in reality bring chaos to the island. Experience the end of Chapter 1 with new zones, missions, and the looming Black Hole event.",
    image: "https://i.ytimg.com/vi/n6btWu7bY74/maxresdefault.jpg",
    buttonText: "Play Now",
    glowColor: "rgba(120, 100, 255, 0.3)",
  },
];

export function BannerSection({
  onTabChange,
}: {
  onTabChange: (tab: "home" | "library" | "settings") => void;
}) {
  const [banners] = useState<BannerItem[]>(defaultBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const duration = 8000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const newProgress = (elapsed / duration) * 100;

      if (newProgress >= 100) {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
        setProgress(0);
        elapsed = 0;
      } else {
        setProgress(newProgress);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [banners.length, currentIndex]);

  const currentBanner = banners[currentIndex];

  return (
    <div
      className="relative w-full h-[300px] rounded-xl overflow-hidden backdrop-blur-lg border border-white/10 animate-in fade-in slide-in-from-left-4 duration-500 delay-100 bg-[#0a0e1a]/70"
      style={{
        boxShadow: `0 0 30px 5px ${
          currentBanner.glowColor
        }, 0 0 60px 10px ${currentBanner.glowColor.replace("0.3", "0.15")}`,
        transition: "box-shadow 0.8s ease",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={currentBanner.image}
            alt={currentBanner.title}
            fill
            className="object-cover brightness-[0.4]"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      <div className="relative h-full flex flex-col justify-end p-8">
        <motion.div
          key={`content-${currentIndex}`}
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-3 mb-4"
        >
          <p className="text-xs font-bold text-white/70 tracking-widest uppercase">
            {currentBanner.subtitle}
          </p>
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            {currentBanner.title}
          </h1>
          <p className="text-sm text-white/85 max-w-2xl leading-relaxed">
            {currentBanner.description}
          </p>
        </motion.div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => onTabChange("library")}
            className="px-6 py-2 bg-white/10 cursor-pointer hover:bg-white/20 border border-white/20 text-white rounded-md font-semibold text-sm transition-all flex items-center gap-2 backdrop-blur-sm hover:scale-105 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {currentBanner.buttonText}
          </button>

          {banners.length > 1 && (
            <div className="flex items-center gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setProgress(0);
                  }}
                  className="relative"
                >
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      index === currentIndex
                        ? "w-8 bg-white/50"
                        : "w-4 bg-white/30"
                    }`}
                  />
                  {index === currentIndex && (
                    <div
                      className="absolute top-0 left-0 h-1 bg-white rounded-full"
                      style={{
                        width: `${progress}%`,
                        transition: "width 0.05s linear",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
