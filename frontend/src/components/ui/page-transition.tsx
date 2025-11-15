import * as React from "react"
import { motion } from "framer-motion"
import { pageVariants, pageTransition } from "@/lib/animations"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  )
}