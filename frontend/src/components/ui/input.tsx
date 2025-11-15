import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
  label?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, label, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {label}
          </label>
        )}
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-primary-surface/50 backdrop-blur-sm px-4 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            error 
              ? "border-status-failed focus-visible:ring-status-failed focus-visible:border-status-failed shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              : success
              ? "border-status-verified focus-visible:ring-status-verified focus-visible:border-status-verified shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              : "border-primary-border focus-visible:ring-accent-electric focus-visible:border-accent-electric hover:border-accent-electric/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-status-failed" : success ? "text-status-verified" : "text-slate-400"
          )}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }