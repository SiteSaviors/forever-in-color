
import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileTypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'overline'
  component?: React.ElementType
}

const typographyVariants = {
  h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight",
  h2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight",
  h3: "text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-tight tracking-tight",
  h4: "text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-tight tracking-tight",
  body: "text-base sm:text-base md:text-lg leading-relaxed",
  caption: "text-sm sm:text-sm md:text-base leading-relaxed text-muted-foreground",
  overline: "text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground"
}

const getDefaultElement = (variant: keyof typeof typographyVariants): React.ElementType => {
  switch (variant) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
      return variant;
    case 'body':
      return 'p';
    case 'caption':
    case 'overline':
      return 'span';
    default:
      return 'p';
  }
}

const MobileTypography = React.forwardRef<HTMLElement, MobileTypographyProps>(
  ({ className, variant = 'body', component, children, ...props }, ref) => {
    const Component = component || getDefaultElement(variant)
    
    return (
      <Component
        ref={ref}
        className={cn(typographyVariants[variant], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
MobileTypography.displayName = "MobileTypography"

export { MobileTypography,}
