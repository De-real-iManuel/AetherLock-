import * as React from "react"
import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
  text?: string
}

export const LoadingSpinner = ({ 
  size = "md", 
  color = "#00d4aa", 
  text 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12", 
    lg: "w-20 h-20"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-transparent`}
          style={{ 
            borderTopColor: color,
            borderRightColor: `${color}40`
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner ring */}
        <motion.div
          className={`absolute inset-2 rounded-full border-2 border-transparent`}
          style={{ 
            borderBottomColor: color,
            borderLeftColor: `${color}40`
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center dot */}
        <div 
          className="absolute inset-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: color }}
        />
        
        {/* Glow effect */}
        <div 
          className={`absolute inset-0 ${sizeClasses[size]} rounded-full opacity-20 blur-sm`}
          style={{ backgroundColor: color }}
        />
      </div>
      
      {text && (
        <motion.p 
          className="text-white text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}