
import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check, Circle } from "lucide-react"

interface MobileProgressProps {
  currentStep: number
  totalSteps: number
  completedSteps?: number[]
  showLabels?: boolean
  variant?: 'dots' | 'bar' | 'steps'
  size?: 'sm' | 'md' | 'lg'
}

const MobileProgress = React.forwardRef<HTMLDivElement, MobileProgressProps>(
  ({ 
    currentStep, 
    totalSteps, 
    completedSteps = [], 
    showLabels = false,
    variant = 'dots',
    size = 'md',
    ...props 
  }, ref) => {
    const progress = (currentStep / totalSteps) * 100

    if (variant === 'bar') {
      return (
        <div ref={ref} className="w-full space-y-2" {...props}>
          <Progress 
            value={progress} 
            className={cn(
              "w-full",
              size === 'sm' && "h-1",
              size === 'md' && "h-2", 
              size === 'lg' && "h-3"
            )}
          />
          {showLabels && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep}</span>
              <span>{totalSteps} steps</span>
            </div>
          )}
        </div>
      )
    }

    if (variant === 'steps') {
      return (
        <div ref={ref} className="flex items-center justify-between w-full" {...props}>
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1
            const isCompleted = completedSteps.includes(stepNumber)
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep

            return (
              <React.Fragment key={stepNumber}>
                <div className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-300",
                  size === 'sm' && "w-6 h-6 text-xs",
                  size === 'md' && "w-8 h-8 text-sm",
                  size === 'lg' && "w-10 h-10 text-base",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-blue-500 text-white ring-2 ring-blue-200",
                  isUpcoming && "bg-gray-200 text-gray-500"
                )}>
                  {isCompleted ? (
                    <Check className={cn(
                      size === 'sm' && "w-3 h-3",
                      size === 'md' && "w-4 h-4", 
                      size === 'lg' && "w-5 h-5"
                    )} />
                  ) : (
                    stepNumber
                  )}
                </div>
                {i < totalSteps - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2",
                    stepNumber < currentStep ? "bg-green-500" : "bg-gray-200"
                  )} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      )
    }

    // Default dots variant
    return (
      <div ref={ref} className="flex items-center justify-center space-x-2" {...props}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1
          const isCompleted = completedSteps.includes(stepNumber)
          const isCurrent = stepNumber === currentStep

          return (
            <Circle
              key={stepNumber}
              className={cn(
                "transition-all duration-300",
                size === 'sm' && "w-2 h-2",
                size === 'md' && "w-3 h-3",
                size === 'lg' && "w-4 h-4",
                isCompleted && "fill-green-500 text-green-500",
                isCurrent && "fill-blue-500 text-blue-500 scale-125",
                !isCompleted && !isCurrent && "fill-gray-300 text-gray-300"
              )}
            />
          )
        })}
      </div>
    )
  }
)
MobileProgress.displayName = "MobileProgress"

export { MobileProgress }
