import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface HolographicCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export const HolographicCard = ({ 
  children, 
  className = "",
  intensity = 1
}: HolographicCardProps) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })
  
  const rotateX = useTransform(
    mouseYSpring, 
    [-0.5, 0.5], 
    [`${17.5 * intensity}deg`, `-${17.5 * intensity}deg`]
  )
  const rotateY = useTransform(
    mouseXSpring, 
    [-0.5, 0.5], 
    [`-${17.5 * intensity}deg`, `${17.5 * intensity}deg`]
  )
  
  const gradientX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"])
  const gradientY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"])

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
        className="relative rounded-xl border border-accent-electric/30 bg-gradient-to-br from-primary-card/95 to-black/95 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        {/* Glassmorphism base */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Holographic shimmer overlay */}
        <motion.div 
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${gradientX} ${gradientY}, rgba(0, 212, 170, 0.2), rgba(147, 51, 234, 0.2), transparent 50%)`
          }}
        />
        
        {/* Animated border glow */}
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-accent-electric via-accent-cyan to-accent-purple opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50 -z-10" />
        
        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30"
          animate={{
            backgroundPosition: ["0% 0%", "0% 100%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(0, 212, 170, 0.3) 50%, transparent 100%)",
            backgroundSize: "100% 50px"
          }}
        />
        
        {/* Content */}
        <div 
          className="relative z-10"
          style={{
            transform: "translateZ(50px)",
            transformStyle: "preserve-3d"
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  )
}