
import { CardSkeleton, ImageSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface StyleCardSkeletonProps {
  aspectRatio?: number;
  showActions?: boolean;
  className?: string;
}

const StyleCardSkeleton = ({ 
  aspectRatio = 1, 
  showActions = false,
  className = ""
}: StyleCardSkeletonProps) => {
  return (
    <div className={`relative p-1 sm:p-2 md:p-3 group w-full ${className}`}>
      {/* Background skeleton */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 opacity-60 animate-pulse" />
      
      <Card className="group cursor-pointer transition-all duration-500 ease-out relative z-10 bg-white/98 border-0 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-sm min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[420px] flex flex-col w-full">
        <CardContent className="p-0 overflow-hidden rounded-2xl sm:rounded-3xl h-full flex flex-col relative">
          {/* Hero Image Section Skeleton */}
          <div className="flex-shrink-0 relative">
            <AspectRatio ratio={aspectRatio} className="relative overflow-hidden rounded-lg">
              <ImageSkeleton className="w-full h-full" aspectRatio={aspectRatio} />
              
              {/* Indicators skeleton */}
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </AspectRatio>
          </div>

          {/* Info Section Skeleton */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            {showActions && (
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleCardSkeleton;
