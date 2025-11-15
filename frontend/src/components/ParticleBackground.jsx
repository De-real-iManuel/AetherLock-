import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ParticleBackground = ({ 
  particleCount = 50, 
  interactive = false, 
  color = 'purple',
  className = '' 
}) => {
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Color variants for particles
  const colorVariants = {
    purple: ['#9333ea', '#a855f7', '#c084fc'],
    cyan: ['#06b6d4', '#22d3ee', '#67e8f9'],
    green: ['#10b981', '#34d399', '#6ee7b7'],
    mixed: ['#9333ea', '#06b6d4', '#10b981', '#f59e0b']
  };

  const colors = colorVariants[color] || colorVariants.purple;

  // Generate particle data
  const generateParticles = () => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
      direction: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * 2 + 1
    }));
  };

  useEffect(() => {
    particlesRef.current = generateParticles();
  }, [particleCount]);

  // Mouse tracking for interactive mode
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        mouseRef.current = {
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        };
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Floating particles */}
      {particlesRef.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`
          }}
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
          }}
          animate={{
            x: [
              `${particle.x}%`,
              `${particle.x + Math.cos(particle.direction) * 20}%`,
              `${particle.x}%`
            ],
            y: [
              `${particle.y}%`,
              `${particle.y + Math.sin(particle.direction) * 20}%`,
              `${particle.y}%`
            ],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity]
          }}
          transition={{
            duration: particle.pulse * 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Connection lines between nearby particles */}
      <svg className="absolute inset-0 w-full h-full">
        {particlesRef.current.map((particle, i) => 
          particlesRef.current.slice(i + 1).map((otherParticle, j) => {
            const distance = Math.sqrt(
              Math.pow(particle.x - otherParticle.x, 2) + 
              Math.pow(particle.y - otherParticle.y, 2)
            );
            
            // Only draw lines between nearby particles
            if (distance < 15) {
              return (
                <motion.line
                  key={`${i}-${j}`}
                  x1={`${particle.x}%`}
                  y1={`${particle.y}%`}
                  x2={`${otherParticle.x}%`}
                  y2={`${otherParticle.y}%`}
                  stroke={particle.color}
                  strokeWidth="0.5"
                  opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: Math.random() * 2 }}
                />
              );
            }
            return null;
          })
        )}
      </svg>

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-cyan-500/5"
        animate={{
          background: [
            'linear-gradient(45deg, transparent, rgba(147, 51, 234, 0.05), rgba(6, 182, 212, 0.05))',
            'linear-gradient(135deg, rgba(6, 182, 212, 0.05), transparent, rgba(147, 51, 234, 0.05))',
            'linear-gradient(225deg, rgba(147, 51, 234, 0.05), rgba(6, 182, 212, 0.05), transparent)',
            'linear-gradient(315deg, transparent, rgba(147, 51, 234, 0.05), rgba(6, 182, 212, 0.05))'
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default ParticleBackground;