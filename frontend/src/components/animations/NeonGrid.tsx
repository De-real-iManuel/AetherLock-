import * as React from "react";
import { motion } from "framer-motion";

interface NeonGridProps {
  className?: string;
  gridSize?: number;
  glowColor?: string;
}

export const NeonGrid = ({ 
  className = "", 
  gridSize = 50,
  glowColor = "rgba(0, 212, 170, 0.3)"
}: NeonGridProps) => {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 3D Perspective Container */}
      <div 
        className="absolute inset-0"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%"
        }}
      >
        {/* Animated Grid */}
        <motion.div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(60deg) translateZ(-100px)"
          }}
          animate={{
            transform: [
              "rotateX(60deg) translateZ(-100px)",
              "rotateX(60deg) translateZ(-50px)",
              "rotateX(60deg) translateZ(-100px)"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Horizontal Lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ transform: "translateZ(0)" }}
          >
            <defs>
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={glowColor} stopOpacity="0" />
                <stop offset="50%" stopColor={glowColor} stopOpacity="1" />
                <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Horizontal grid lines */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.line
                key={`h-${i}`}
                x1="0"
                y1={i * gridSize}
                x2="100%"
                y2={i * gridSize}
                stroke="url(#gridGradient)"
                strokeWidth="1"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: i * 0.1 }}
              />
            ))}
            
            {/* Vertical grid lines */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.line
                key={`v-${i}`}
                x1={i * gridSize}
                y1="0"
                x2={i * gridSize}
                y2="100%"
                stroke="url(#gridGradient)"
                strokeWidth="1"
                filter="url(#glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: i * 0.05 }}
              />
            ))}
          </svg>
        </motion.div>
        
        {/* Horizon Glow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${glowColor}, transparent)`
          }}
        />
      </div>
      
      {/* Overlay gradient for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%)"
        }}
      />
    </div>
  );
};
