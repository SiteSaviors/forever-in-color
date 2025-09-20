
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Enhanced skeleton variants for specific use cases
function ImageSkeleton({
  className,
  aspectRatio = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  aspectRatio?: number;
}) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-lg",
        className
      )}
      style={{ aspectRatio }}
      {...props}
    />
  )
}

function CardSkeleton({
  className,
  showHeader = true,
  showContent = true,
  showActions = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  showHeader?: boolean;
  showContent?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className={cn("space-y-4 p-4 border rounded-lg bg-white", className)} {...props}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      {showContent && (
        <div className="space-y-3">
          <ImageSkeleton className="w-full h-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      )}
      {showActions && (
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
    </div>
  )
}

export { Skeleton, ImageSkeleton, CardSkeleton }
