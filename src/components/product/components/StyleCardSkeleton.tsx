
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StyleCardSkeletonProps {
  aspectRatio?: number;
}

const StyleCardSkeleton = memo(({ aspectRatio = 1 }: StyleCardSkeletonProps) => {
  return (
    <Card className="overflow-hidden">
      <div 
        className="relative"
        style={{ aspectRatio: aspectRatio }}
      >
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    </Card>
  );
});

StyleCardSkeleton.displayName = 'StyleCardSkeleton';

export default StyleCardSkeleton;
