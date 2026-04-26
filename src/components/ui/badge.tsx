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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-[#4b49ac]/10 text-[#4b49ac]": variant === "default",
          "bg-[#f3f4f6] text-[#6b7280]": variant === "secondary",
          "bg-[#fee2e2] text-[#dc2626]": variant === "destructive",
          "bg-[#d1fae5] text-[#059669]": variant === "success",
          "bg-[#fef3c7] text-[#d97706]": variant === "warning",
          "bg-[#dbeafe] text-[#2563eb]": variant === "info",
          "border border-[#e5e7eb] text-[#6b7280]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }