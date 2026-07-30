"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SignatureLoaderProps {
  /** The signature text or brand name to draw */
  text?: string;
  /** Duration (in seconds) for the handwriting draw animation */
  duration?: number;
  /** Callback fired when the intro animation completes */
  onComplete?: () => void;
}

export default function SignatureLoader({
  text = "Vivek Chaurasiya",
  duration = 2.5,
  onComplete,
}: SignatureLoaderProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Total display time: draw duration + brief delay before fading out
    const totalTime = (duration + 0.8) * 1000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, totalTime);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" },
          }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden"
        >
          {/* Blur background ambient light */}
          <div className="absolute w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative flex flex-col items-center justify-center">
            {/* SVG Signature Drawing Effect */}
            <svg
              className="w-[85vw] max-w-[600px] h-32 sm:h-40 overflow-visible"
              viewBox="0 0 600 120"
            >
              <defs>
                <linearGradient
                  id="signatureGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>

              {/* Animated Cursive Stroke Text */}
              <motion.text
                x="50%"
                y="50%"
                dominantBaseline="central"
                textAnchor="middle"
                fill="none"
                stroke="url(#signatureGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  fontFamily:
                    "'Caveat', 'Dancing Script', 'Brush Script MT', cursive",
                  fontSize: "72px",
                  fontWeight: "600",
                  letterSpacing: "2px",
                }}
                initial={{
                  strokeDasharray: 1000,
                  strokeDashoffset: 1000,
                  fillOpacity: 0,
                }}
                animate={{
                  strokeDashoffset: 0,
                  fillOpacity: [0, 0, 1],
                }}
                transition={{
                  strokeDashoffset: { duration: duration, ease: "easeInOut" },
                  fillOpacity: {
                    duration: 0.6,
                    delay: duration - 0.2,
                    ease: "easeIn",
                  },
                }}
              >
                {text}
              </motion.text>
            </svg>

            {/* Subtitle Accent */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: duration - 0.4, duration: 0.5 }}
              className="text-xs uppercase tracking-[0.3em] text-slate-400 font-mono mt-2"
            >
              Welcome to my portfolio
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
