
import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: {
    xs?: 1 | 2 | 3 | 4
    sm?: 1 | 2 | 3 | 4
    md?: 1 | 2 | 3 | 4 | 5 | 6
    lg?: 1 | 2 | 3 | 4 | 5 | 6
    xl?: 1 | 2 | 3 | 4 | 5 | 6
  }
}

const gapVariants = {
  none: "gap-0",
  sm: "gap-2 sm:gap-3",
  md: "gap-3 sm:gap-4 md:gap-6",
  lg: "gap-4 sm:gap-6 md:gap-8",
  xl: "gap-6 sm:gap-8 md:gap-10"
}

const getResponsiveClasses = (responsive?: MobileGridProps['responsive']) => {
  if (!responsive) return ''
  
  const classes = []
  if (responsive.xs) classes.push(`grid-cols-${responsive.xs}`)
  if (responsive.sm) classes.push(`sm:grid-cols-${responsive.sm}`)
  if (responsive.md) classes.push(`md:grid-cols-${responsive.md}`)
  if (responsive.lg) classes.push(`lg:grid-cols-${responsive.lg}`)
  if (responsive.xl) classes.push(`xl:grid-cols-${responsive.xl}`)
  
  return classes.join(' ')
}

const MobileGrid = React.forwardRef<HTMLDivElement, MobileGridProps>(
  ({ className, cols = 1, gap = 'md', responsive, children, ...props }, ref) => {
    const responsiveClasses = responsive ? getResponsiveClasses(responsive) : `grid-cols-${cols}`
    
    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full",
          responsiveClasses,
          gapVariants[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileGrid.displayName = "MobileGrid"

interface MobileContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const containerVariants = {
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-4xl", 
  xl: "max-w-6xl",
  full: "max-w-full"
}

const paddingVariants = {
  none: "px-0",
  sm: "px-3 sm:px-4",
  md: "px-4 sm:px-6 md:px-8",
  lg: "px-6 sm:px-8 md:px-12"
}

const MobileContainer = React.forwardRef<HTMLDivElement, MobileContainerProps>(
  ({ className, size = 'lg', padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full",
          containerVariants[size],
          paddingVariants[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileContainer.displayName = "MobileContainer"

export { MobileGrid, MobileContainer }
