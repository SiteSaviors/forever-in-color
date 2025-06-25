
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon } from "lucide-react";
import StyleCard from "./StyleCard";
import ErrorBoundary from "@/components/ui/error-boundary";
import { SkeletonCard } from "@/components/ui/skeleton-loader";
import { useStylePreview } from "./contexts/StylePreviewContext";
import { artStyles } from "@/data/artStyles";
import { useIsMobile } from "@/hooks/use-mobile";

interface StyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  selectedOrientation?: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

/**
 * StyleGrid Component
 * 
 * Enhanced grid component with better error handling, loading states, and mobile optimization.
 * 
 * Key Improvements:
 * - Error boundary protection for the entire grid
 * - Skeleton loading states for better perceived performance
 * - Enhanced mobile touch targets and spacing
 * - Improved accessibility with proper ARIA labels
 * - Better responsive design with optimized breakpoints
 */
const StyleGrid = ({ 
  croppedImage, 
  selectedStyle, 
  selectedOrientation = "square",
  onStyleSelect, 
  onComplete 
}: StyleGridProps) => {
  const isMobile = useIsMobile();
  
  // Popular styles that auto-generate: Classic Oil (2), Watercolor Dreams (4), Pastel Bliss (5)
  const popularStyleIds = [2, 4, 5];

  const handleStyleSelect = async (styleId: number, styleName: string) => {
    console.log('🎯 StyleGrid handleStyleSelect called:', styleId, styleName, 'with orientation:', selectedOrientation);
    onStyleSelect(styleId, styleName);
  };

  // Premium gradient backgrounds for each style
  const getStyleGradient = (styleId: number) => {
    const gradients = [
      'from-rose-400 via-orange-500 to-amber-500', // Original (ID: 1)
      'from-emerald-400 via-teal-500 to-cyan-600', // Classic Oil (ID: 2)
      'from-violet-400 via-purple-500 to-indigo-600', // Watercolor Dreams (ID: 4)
      'from-pink-300 via-rose-400 to-red-500', // Pastel Bliss (ID: 5)
      'from-lime-400 via-green-500 to-emerald-600', // Gemstone Poly (ID: 6)
      'from-sky-300 via-blue-400 to-indigo-500', // 3D Storybook (ID: 7)
      'from-amber-300 via-yellow-400 to-orange-500', // Artisan Charcoal (ID: 8)
      'from-fuchsia-400 via-pink-500 to-rose-600', // Pop Art Burst (ID: 9)
      'from-green-300 via-emerald-400 to-teal-500', // Neon Splash (ID: 10)
      'from-purple-300 via-violet-400 to-indigo-500', // Electric Bloom (ID: 11)
      'from-cyan-300 via-blue-400 to-indigo-500', // Abstract Fusion (ID: 13)
      'from-slate-400 via-gray-500 to-zinc-600', // Deco Luxe (ID: 15)
    ];
    
    const styleIdToIndex: { [key: number]: number } = {
      1: 0, 2: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 13: 10, 15: 11
    };
    
    return gradients[styleIdToIndex[styleId]] || gradients[0];
  };

  // Show placeholder thumbnails when no photo is uploaded
  if (!croppedImage) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Enhanced mobile-optimized grid with better spacing */}
          <div 
            className="grid gap-4 sm:gap-6"
            style={{
              gridTemplateColumns: isMobile 
                ? '1fr' 
                : 'repeat(auto-fit, minmax(280px, 1fr))'
            }}
            role="grid"
            aria-label="Art style selection grid"
          >
            {artStyles.map((style) => (
              <div
                key={style.id}
                className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500"
                style={{ aspectRatio: isMobile ? '4/5' : '1/1' }}
                role="gridcell"
                aria-label={`${style.name} style preview - upload photo to preview`}
              >
                {/* Premium glossy gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getStyleGradient(style.id)} opacity-90`}>
                  {/* Glossy overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20"></div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                </div>

                {/* Placeholder content - optimized for mobile touch */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                  <div className={`${isMobile ? 'w-16 h-16' : 'w-12 h-12'} bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 border border-white/30`}>
                    <ImageIcon className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
                  </div>
                  <p className={`${isMobile ? 'text-base' : 'text-sm'} text-white font-medium mb-1 drop-shadow-sm`}>
                    Upload Photo to
                  </p>
                  <p className={`${isMobile ? 'text-base' : 'text-sm'} text-white font-medium drop-shadow-sm`}>
                    Preview Style
                  </p>
                </div>

                {/* Style info overlay - mobile optimized */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 border-t border-white/20">
                  <h4 className={`font-semibold ${isMobile ? 'text-lg' : 'text-base'} text-white truncate`}>
                    {style.name}
                  </h4>
                  <p className={`${isMobile ? 'text-sm' : 'text-xs'} text-white/80 line-clamp-2`}>
                    {style.description}
                  </p>
                </div>

                {/* Enhanced upload prompt overlay with better touch targets */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
                  <div className={`bg-white/20 text-white ${isMobile ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'} rounded-full font-medium flex items-center gap-2 border border-white/30 backdrop-blur-sm min-h-[44px] touch-manipulation`}>
                    <Upload className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                    Upload First
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Show actual style cards when photo is uploaded - mobile optimized
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Responsive grid with enhanced mobile spacing and accessibility */}
        <div 
          className="grid gap-4 sm:gap-6"
          style={{
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(320px, 1fr))'
          }}
          role="grid"
          aria-label="Art style selection with photo previews"
        >
          {artStyles.map((style) => {
            const isPopularStyle = popularStyleIds.includes(style.id);
            const isOriginalImage = style.id === 1;
            // Only blur non-popular styles (excluding Original Image which should never be blurred)
            const shouldBlur = croppedImage && !isOriginalImage && !isPopularStyle;
            
            console.log(`🎨 Rendering StyleCard for ${style.name} with orientation: ${selectedOrientation}, shouldBlur: ${shouldBlur}, isPopular: ${isPopularStyle}`);
            
            return (
              <div 
                key={style.id} 
                role="gridcell"
                aria-label={`${style.name} art style ${isPopularStyle ? '(popular)' : ''}`}
              >
                <StyleCard
                  style={style}
                  croppedImage={croppedImage}
                  selectedStyle={selectedStyle}
                  isPopular={isPopularStyle}
                  selectedOrientation={selectedOrientation}
                  showContinueButton={false}
                  onStyleClick={() => handleStyleSelect(style.id, style.name)}
                  onContinue={onComplete}
                  shouldBlur={shouldBlur}
                />
              </div>
            );
          })}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StyleGrid;
