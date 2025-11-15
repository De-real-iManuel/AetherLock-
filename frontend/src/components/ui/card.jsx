import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

const MotionDiv = motion.div

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <MotionDiv
    ref={ref}
    whileHover={{ scale: 1.015, y: -4 }}
    whileTap={{ scale: 0.995 }}
    transition={{ type: 'spring', stiffness: 250, damping: 24 }}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }