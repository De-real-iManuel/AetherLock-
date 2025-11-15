import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
  
  const variantStyles = {
    default: "bg-primary-100 text-primary-700 border border-primary-200",
    secondary: "bg-neutral-100 text-neutral-700 border border-neutral-200",
    destructive: "bg-red-100 text-red-700 border border-red-200",
    outline: "bg-white text-neutral-700 border border-neutral-300"
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`} {...props} />
  )
}

export { Badge }
