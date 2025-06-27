
import StyleCardSkeleton from "./StyleCardSkeleton";

interface StyleGridSkeletonProps {
  count?: number;
  aspectRatio?: number;
  className?: string;
}

const StyleGridSkeleton = ({ 
  count = 9, 
  aspectRatio = 1,
  className = ""
}: StyleGridSkeletonProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: count }, (_, index) => (
          <StyleCardSkeleton
            key={index}
            aspectRatio={aspectRatio}
            showActions={index < 3} // Show actions for first few cards
          />
        ))}
      </div>
    </div>
  );
};

export default StyleGridSkeleton;
