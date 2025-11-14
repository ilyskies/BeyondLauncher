"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSocketStore } from "@/lib/socket";
import { NewsItem } from "@/types/socket";

const defaultNewsItems: NewsItem[] = [
  {
    id: "default",
    title: "ANORA",
    subtitle: "Welcome to Anora",
    description:
      "Experience the legacy of Fortnite with enhanced gameplay and exclusive content.",
    backgroundImage:
      "https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/01/Fortnite-Season-5.jpg",
  },
];

export function NewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(defaultNewsItems);
  const { send, on, off, isConnected } = useSocketStore();
  const newsUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNewsDataRef = useRef<string>("");
  const imageLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isConnected) {
      send("request_news", undefined);

      newsUpdateIntervalRef.current = setInterval(() => {
        send("request_news", undefined);
      }, 60000);

      return () => {
        if (newsUpdateIntervalRef.current) {
          clearInterval(newsUpdateIntervalRef.current);
          newsUpdateIntervalRef.current = null;
        }
      };
    } else {
      if (newsUpdateIntervalRef.current) {
        clearInterval(newsUpdateIntervalRef.current);
        newsUpdateIntervalRef.current = null;
      }
    }
  }, [isConnected, send]);

  useEffect(() => {
    const handleNewsUpdate = (data: { news: NewsItem[] }) => {
      const newNewsString = JSON.stringify(data.news);
      if (newNewsString !== lastNewsDataRef.current) {
        console.log("[NewsSection] News updated:", data.news);
        lastNewsDataRef.current = newNewsString;

        setNewsItems(data.news);

        if (currentIndex >= data.news.length) {
          setCurrentIndex(0);
        }
      }
    };

    on("news_update", handleNewsUpdate);

    return () => {
      off("news_update", handleNewsUpdate);
    };
  }, [on, off, currentIndex]);

  useEffect(() => {
    const hasMultipleItems = newsItems.length > 1;
    if (!hasMultipleItems || isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % newsItems.length);
        setIsTransitioning(false);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, newsItems.length]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentNews = newsItems[currentIndex];
      if (!currentNews) return;

      const timer = setTimeout(() => {
        setImageLoaded(false);
      }, 0);

      const img = new window.Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true);
      img.src = currentNews.backgroundImage;

      return () => {
        clearTimeout(timer);
        if (imageLoadTimeoutRef.current) {
          clearTimeout(imageLoadTimeoutRef.current);
        }
      };
    }
  }, [currentIndex, newsItems]);

  const handleDotClick = (index: number) => {
    const hasMultipleItems = newsItems.length > 1;
    if (index === currentIndex || !hasMultipleItems) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const currentNews = newsItems[currentIndex];
  const hasMultipleItems = newsItems.length > 1;

  useEffect(() => {
    return () => {
      if (newsUpdateIntervalRef.current) {
        clearInterval(newsUpdateIntervalRef.current);
      }
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
    };
  }, []);

  if (!currentNews) {
    return (
      <section className="news-section relative">
        <div className="bg-card border-border/80 overflow-hidden border rounded-xl h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading news...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="news-section relative">
      <div
        className={`bg-card border-border/80 overflow-hidden group 
        transition-all duration-500 shadow-xl hover:shadow-2xl 
        relative border rounded-xl hover:border-primary/40
        backdrop-blur-sm`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative h-96 overflow-hidden">
          <div
            className={`absolute inset-0 transition-all duration-500 ${
              isTransitioning || !imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          >
            <Image
              src={currentNews.backgroundImage}
              alt={currentNews.title}
              fill
              className="object-cover object-center"
              style={{
                filter: "brightness(0.7) contrast(1.1) saturate(1.1)",
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </div>

          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-card to-primary/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-primary/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-primary/5 to-transparent" />

          <div className="absolute inset-0 ring-1 ring-primary/20 pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <div
              className={`transition-all duration-500 ${
                isTransitioning
                  ? "opacity-0 translate-y-2"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <div className="max-w-lg">
                <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wide">
                  {currentNews.title}
                </h2>
                <h3 className="text-lg text-primary/90 font-bold mb-3">
                  {currentNews.subtitle}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-md">
                  {currentNews.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasMultipleItems && (
        <div className="flex justify-center gap-2 mt-4">
          {newsItems.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`cursor-pointer transition-all duration-200 rounded-full ${
                index === currentIndex
                  ? "w-6 h-2 bg-primary shadow-sm shadow-primary/30"
                  : "w-2 h-2 bg-muted-foreground/40 hover:bg-primary/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
