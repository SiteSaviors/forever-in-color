
import * as React from "react"
import { cn } from "@/lib/utils"

interface TouchTargetProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const touchTargetVariants = {
  sm: "min-h-[44px] min-w-[44px] p-2",
  md: "min-h-[48px] min-w-[48px] p-3", 
  lg: "min-h-[56px] min-w-[56px] p-4"
}

const TouchTarget = React.forwardRef<HTMLDivElement, TouchTargetProps>(
  ({ className, size = 'md', interactive = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          touchTargetVariants[size],
          interactive && "touch-manipulation select-none cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TouchTarget.displayName = "TouchTarget"

export { TouchTarget, touchTargetVariants }
