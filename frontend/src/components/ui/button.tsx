import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-electric disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-cyberpunk-500 text-black hover:bg-cyberpunk-400 shadow-neon hover:shadow-neon-lg",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline: "border border-cyberpunk-500 text-cyberpunk-500 hover:bg-cyberpunk-500 hover:text-black",
        secondary: "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.5)]",
        ghost: "text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300",
        cyber: "bg-gradient-to-r from-cyberpunk-500 to-cyan-400 text-black font-display tracking-wider hover:scale-105 shadow-cyber-lg"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }