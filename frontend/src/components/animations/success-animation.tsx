import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface SuccessAnimationProps {
  onComplete?: () => void
  size?: "sm" | "md" | "lg"
}

export const SuccessAnimation = ({ onComplete, size = "md" }: SuccessAnimationProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  }

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  }

  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center relative`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          duration: 0.6
        }}
      >
        {/* Glow effect */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-400 opacity-30 blur-lg`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Check icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        >
          <Check className={`${iconSizes[size]} text-white`} />
        </motion.div>
        
        {/* Ripple effect */}
        <motion.div
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-green-400`}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.div>
      
      {/* Success particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-400 rounded-full"
          initial={{ 
            scale: 0,
            x: 0,
            y: 0
          }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos(i * 45 * Math.PI / 180) * 60,
            y: Math.sin(i * 45 * Math.PI / 180) * 60,
          }}
          transition={{
            duration: 1.5,
            delay: 0.8,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}