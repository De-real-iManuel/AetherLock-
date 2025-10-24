import * as React from "react"
import { motion } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
}

interface ParticleFieldProps {
  particleCount?: number
  className?: string
}

export const ParticleField = ({ particleCount = 50, className }: ParticleFieldProps) => {
  const [particles, setParticles] = React.useState<Particle[]>([])

  React.useEffect(() => {
    const colors = ['#00d4aa', '#9333ea', '#06b6d4', '#10b981']
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 20 + 10
    }))
    
    setParticles(newParticles)
  }, [particleCount])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
        />
      ))}
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.slice(0, 10).map((particle, i) => {
          const nextParticle = particles[(i + 1) % 10]
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${particle.x}%`}
              y1={`${particle.y}%`}
              x2={`${nextParticle?.x}%`}
              y2={`${nextParticle?.y}%`}
              stroke="rgba(0, 212, 170, 0.2)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 2, delay: i * 0.2 }}
            />
          )
        })}
      </svg>
    </div>
  )
}