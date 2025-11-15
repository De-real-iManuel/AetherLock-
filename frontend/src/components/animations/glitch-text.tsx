import * as React from "react"
import { motion } from "framer-motion"

interface GlitchTextProps {
  text: string
  className?: string
}

export const GlitchText = ({ text, className = "" }: GlitchTextProps) => {
  const [isGlitching, setIsGlitching] = React.useState(false)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <motion.span
        className="relative z-10"
        animate={isGlitching ? {
          x: [0, -2, 2, -1, 1, 0],
          textShadow: [
            "0 0 0 transparent",
            "2px 0 0 #ff0000, -2px 0 0 #00ffff",
            "-2px 0 0 #ff0000, 2px 0 0 #00ffff",
            "0 0 0 transparent"
          ]
        } : {}}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
      
      {isGlitching && (
        <>
          <span 
            className="absolute top-0 left-0 text-red-500 opacity-70"
            style={{ transform: "translate(-2px, 0)" }}
          >
            {text}
          </span>
          <span 
            className="absolute top-0 left-0 text-cyan-500 opacity-70"
            style={{ transform: "translate(2px, 0)" }}
          >
            {text}
          </span>
        </>
      )}
    </div>
  )
}