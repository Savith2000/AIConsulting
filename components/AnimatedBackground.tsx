"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedBackground() {
  // Respect user's reduced motion preference
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
        animate={shouldReduceMotion ? {} : {
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        style={{ willChange: shouldReduceMotion ? 'auto' : 'transform' }}
        animate={shouldReduceMotion ? {} : {
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

