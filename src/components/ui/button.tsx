import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  default: "bg-[#4b49ac] text-white hover:bg-[#3a3a8a]",
  destructive: "bg-[#f3797e] text-white hover:bg-[#e06a6f]",
  outline: "border border-[#e8e8e8] bg-white hover:bg-[#f5f6fa] hover:text-[#4b49ac]",
  secondary: "bg-[#f5f6fa] text-[#3f4a59] hover:bg-[#e8e8e8]",
  ghost: "hover:bg-[#f5f6fa] hover:text-[#4b49ac]",
  link: "text-[#4b49ac] underline-offset-4 hover:underline",
}

const buttonSizes = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b49ac]/30 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }