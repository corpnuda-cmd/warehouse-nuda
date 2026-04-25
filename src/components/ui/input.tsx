import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[#e8e8e8] bg-white px-3 py-1 text-sm text-[#3f4a59] transition-colors placeholder:text-[#898989] focus:outline-none focus:ring-2 focus:ring-[#4b49ac]/30 focus:border-[#4b49ac] disabled:cursor-not-allowed disabled:opacity-50",
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