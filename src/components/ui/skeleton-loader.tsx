
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  lines?: number;
}

/**
 * Skeleton Component
 * 
 * Provides skeleton loading states for better perceived performance.
 * Shows placeholder content while actual content is loading.
 * 
 * Variants:
 * - default: Basic rectangular skeleton
 * - card: Card-shaped skeleton with rounded corners
 * - text: Text line skeleton with natural width variation
 * - avatar: Circular skeleton for profile pictures
 * - button: Button-shaped skeleton
 * 
 * Features:
 * - Smooth shimmer animation
 * - Responsive sizing
 * - Multiple predefined variants
 * - Customizable with className prop
 */
const Skeleton = ({ className, variant = 'default', lines = 1 }: SkeletonProps) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]";
  
  const variantClasses = {
    default: "rounded",
    card: "rounded-xl",
    text: "rounded h-4",
    avatar: "rounded-full",
    button: "rounded-lg h-10"
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              // Vary width for more natural appearance
              index === lines - 1 ? 'w-3/4' : 'w-full',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );
};

/**
 * Predefined skeleton components for common use cases
 */
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <Skeleton variant="card" className="h-48" />
    <div className="space-y-2">
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <Skeleton variant="text" lines={lines} className={className} />
);

export const SkeletonButton = ({ className }: { className?: string }) => (
  <Skeleton variant="button" className={cn("w-24", className)} />
);

export const SkeletonAvatar = ({ size = "default", className }: { 
  size?: "sm" | "default" | "lg"; 
  className?: string; 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    default: "w-12 h-12", 
    lg: "w-16 h-16"
  };
  
  return (
    <Skeleton 
      variant="avatar" 
      className={cn(sizeClasses[size], className)} 
    />
  );
};

export default Skeleton;
