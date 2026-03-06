"use client";

import { motion } from "framer-motion";

const petals = [
  { left: "6%", top: "18%", delay: 0.2, duration: 7.5, size: 10 },
  { left: "14%", top: "68%", delay: 1.1, duration: 8.4, size: 14 },
  { left: "24%", top: "34%", delay: 0.7, duration: 6.8, size: 12 },
  { left: "38%", top: "12%", delay: 1.7, duration: 9.1, size: 9 },
  { left: "48%", top: "78%", delay: 0.4, duration: 7.2, size: 13 },
  { left: "61%", top: "44%", delay: 1.5, duration: 8.6, size: 11 },
  { left: "73%", top: "22%", delay: 0.9, duration: 6.9, size: 10 },
  { left: "82%", top: "64%", delay: 1.9, duration: 8.9, size: 15 },
  { left: "90%", top: "36%", delay: 0.5, duration: 7.7, size: 10 },
];

export function FestiveOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 90, ease: "linear" }}
      />

      <motion.div
        className="absolute -bottom-24 right-8 h-72 w-72 rounded-full border border-amber-400/20"
        animate={{ rotate: -360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 120, ease: "linear" }}
      />

      {petals.map((petal, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-gradient-to-br from-amber-300/55 to-primary/55 shadow-[0_0_18px_rgba(240,171,0,0.35)]"
          style={{
            left: petal.left,
            top: petal.top,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
          }}
          animate={{
            y: [0, -16, 0, 12, 0],
            x: [0, 6, 0, -5, 0],
            rotate: [0, 25, -20, 0],
            opacity: [0.3, 0.75, 0.55, 0.8, 0.3],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent"
        animate={{ opacity: [0.2, 0.7, 0.2], scaleX: [0.8, 1, 0.8] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4.5, ease: "easeInOut" }}
      />
    </div>
  );
}
