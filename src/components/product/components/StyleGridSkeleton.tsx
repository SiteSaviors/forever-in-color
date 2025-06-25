
import { SkeletonCard } from "@/components/ui/skeleton-loader";
import { useIsMobile } from "@/hooks/use-mobile";

interface StyleGridSkeletonProps {
  count?: number;
}

/**
 * StyleGridSkeleton Component
 * 
 * Provides skeleton loading state for the style grid while content is loading.
 * Optimized for different screen sizes and maintains consistent layout.
 */
const StyleGridSkeleton = ({ count = 8 }: StyleGridSkeletonProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      {/* Grid with responsive columns matching actual StyleGrid */}
      <div 
        className="grid gap-4 sm:gap-6"
        style={{
          gridTemplateColumns: isMobile 
            ? '1fr' 
            : 'repeat(auto-fit, minmax(320px, 1fr))'
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard 
            key={index} 
            className={isMobile ? "h-96" : "h-80"}
          />
        ))}
      </div>
    </div>
  );
};

export default StyleGridSkeleton;
