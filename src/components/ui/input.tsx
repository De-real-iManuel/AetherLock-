import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border bg-primary-surface/50 backdrop-blur-sm px-3 py-1 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error 
            ? "border-status-failed focus-visible:ring-status-failed shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            : "border-primary-border focus-visible:ring-accent-electric focus-visible:border-accent-electric hover:border-accent-electric/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }