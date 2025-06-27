
import { memo, Suspense } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import StyleCardSkeleton from './StyleCardSkeleton';

interface LazyStyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  isPopular: boolean;
  cropAspectRatio: number;
  selectedOrientation?: string;
  showContinueButton?: boolean;
  shouldBlur?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

// Lazy import the actual StyleCard component
const StyleCard = memo(
  ({ ...props }: LazyStyleCardProps) => 
    import('../StyleCard').then(module => module.default)
);

const LazyStyleCard = memo(({
  style,
  croppedImage,
  selectedStyle,
  isPopular,
  cropAspectRatio,
  selectedOrientation = "square",
  showContinueButton = true,
  shouldBlur = false,
  onStyleClick,
  onContinue
}: LazyStyleCardProps) => {
  const { ref, shouldRender } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px', // Load cards before they're visible
    triggerOnce: true
  });

  return (
    <div ref={ref} className="w-full">
      {shouldRender ? (
        <Suspense 
          fallback={
            <StyleCardSkeleton 
              count={1} 
              aspectRatio={cropAspectRatio}
            />
          }
        >
          <StyleCard
            style={style}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            isPopular={isPopular}
            cropAspectRatio={cropAspectRatio}
            selectedOrientation={selectedOrientation}
            showContinueButton={showContinueButton}
            shouldBlur={shouldBlur}
            onStyleClick={onStyleClick}
            onContinue={onContinue}
          />
        </Suspense>
      ) : (
        <StyleCardSkeleton 
          count={1} 
          aspectRatio={cropAspectRatio}
        />
      )}
    </div>
  );
});

LazyStyleCard.displayName = 'LazyStyleCard';

export default LazyStyleCard;
