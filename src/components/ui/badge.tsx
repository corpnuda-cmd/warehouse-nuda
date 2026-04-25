import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-[#4b49ac] text-white shadow": variant === "default",
          "border-transparent bg-[#f5f6fa] text-[#3f4a59]": variant === "secondary",
          "border-transparent bg-[#f3797e] text-white shadow": variant === "destructive",
          "border-transparent bg-[#7da0fa] text-white shadow": variant === "success",
          "border-transparent bg-[#f3797e]/20 text-[#f3797e]": variant === "warning",
          "border-transparent bg-[#7978e9] text-white": variant === "info",
          "border border-[#e8e8e8] text-[#3f4a59]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }