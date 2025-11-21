"use client";

import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Carousel3DProps {
  cards: ReactNode[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

const MAX_VISIBILITY = 2;

export default function Carousel3D({
  cards,
  activeIndex,
  onIndexChange,
}: Carousel3DProps) {
  const count = cards.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        onIndexChange(activeIndex - 1);
      } else if (e.key === "ArrowRight" && activeIndex < count - 1) {
        onIndexChange(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, count, onIndexChange]);

  return (
    // Reduced vertical padding for better screen fit
    <div className="relative w-full flex items-center justify-center py-4">
      {/* 3D Carousel Container (width only, height is auto) */}
      <div
        className="relative w-[850px] max-w-[90vw]"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        {cards.map((card, i) => {
          const offset = activeIndex - i;
          const absOffset = Math.abs(offset);
          const direction = Math.sign(offset);
          const isActive = i === activeIndex;

          if (absOffset >= 2) {
            return null;
          }

          return (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-300 ease-out"
              style={{
                pointerEvents: isActive ? "auto" : "none",
                opacity: absOffset >= MAX_VISIBILITY ? 0 : 1,
                display: absOffset > MAX_VISIBILITY ? "none" : "block",
                transform: `
                  rotateY(${offset * 40}deg)
                  translateZ(${absOffset * -25}rem)
                  translateX(${direction * -4}rem)
                  scaleY(${1 + absOffset * -0.3})
                `,
                filter: `blur(${absOffset * 0.8}rem)`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Card wrapper – height is driven by content */}
              <div className="w-full rounded-2xl shadow-2xl bg-white overflow-hidden transition-all duration-300 ease-out">
                <div
                  className="w-full h-full transition-opacity duration-300"
                  style={{ opacity: isActive ? 1 : 0.4 }}
                >
                  {card}
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Buttons - Positioned outside card area */}
        {activeIndex > 0 && (
          <button
            onClick={() => onIndexChange(activeIndex - 1)}
            className="absolute top-[275px] -left-28 transform -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center hover:bg-primary transition-colors duration-200 shadow-2xl backdrop-blur-sm border-2 border-white/20"
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ChevronLeft className="w-8 h-8" strokeWidth={3} />
            </motion.div>
          </button>
        )}

        {activeIndex < count - 1 && (
          <button
            onClick={() => onIndexChange(activeIndex + 1)}
            className="absolute top-[275px] -right-28 transform -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center hover:bg-primary transition-colors duration-200 shadow-2xl backdrop-blur-sm border-2 border-white/20"
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ChevronRight className="w-8 h-8" strokeWidth={3} />
            </motion.div>
          </button>
        )}
      </div>
    </div>
  );
}
