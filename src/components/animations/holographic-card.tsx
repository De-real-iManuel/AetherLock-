import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface HolographicCardProps {
  children: React.ReactNode
  className?: string
}

export const HolographicCard = ({ children, className = "" }: HolographicCardProps) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`relative group ${className}`}
    >
      <div
        style={{
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-xl border border-cyberpunk-500/30 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm shadow-2xl"
      >
        {/* Holographic overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyberpunk-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyberpunk-500/20 to-purple-500/20 blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  )
}