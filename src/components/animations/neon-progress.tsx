import * as React from "react"
import { motion } from "framer-motion"

interface NeonProgressProps {
  progress: number
  label?: string
  color?: string
  className?: string
}

export const NeonProgress = ({ 
  progress, 
  label, 
  color = "#00d4aa", 
  className = "" 
}: NeonProgressProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-white font-medium">{label}</span>
          <span className="text-cyberpunk-400">{Math.round(progress)}%</span>
        </div>
      )}
      
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        {/* Background glow */}
        <div 
          className="absolute inset-0 rounded-full opacity-30"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
            animation: "pulse 2s ease-in-out infinite"
          }}
        />
        
        {/* Progress bar */}
        <motion.div
          className="h-full rounded-full relative"
          style={{ 
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Animated shine effect */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
              animation: "shine 2s ease-in-out infinite"
            }}
          />
        </motion.div>
        
        {/* Particle effects */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 w-1 h-1 rounded-full"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 4px ${color}`
            }}
            animate={{
              x: [0, 200, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  )
}