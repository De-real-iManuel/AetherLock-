import { Variants } from "framer-motion"

// Page transition animations
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30
}

// Card animations
export const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

// Stagger animations for lists
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Glow effect animation
export const glowVariants: Variants = {
  initial: { boxShadow: "0 0 5px rgba(0, 212, 170, 0.3)" },
  animate: { 
    boxShadow: [
      "0 0 5px rgba(0, 212, 170, 0.3)",
      "0 0 20px rgba(0, 212, 170, 0.6)",
      "0 0 5px rgba(0, 212, 170, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Pulse animation for status indicators
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}