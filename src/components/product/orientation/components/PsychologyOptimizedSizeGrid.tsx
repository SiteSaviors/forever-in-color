
import React, { Suspense, useMemo } from "react";
import MobileOptimizedSizeCard from "./MobileOptimizedSizeCard";
import SizeCardSkeleton from "./SizeCardSkeleton";
import SizeSelectionErrorBoundary from "./SizeSelectionErrorBoundary";
import { sizeOptions } from "../data/sizeOptions";
import { usePsychologicalOptimization } from "../hooks/usePsychologicalOptimization";
import { useSizeSelection } from "../contexts/SizeSelectionContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Sparkles } from "lucide-react";

interface PsychologyOptimizedSizeGridProps {
  selectedOrientation: string;
  selectedSize: string;
  userImageUrl: string | null;
  onSizeSelect: (size: string) => void;
  onContinueWithSize: (size: string, e: React.MouseEvent) => void;
}

const PsychologyOptimizedSizeGrid: React.FC<PsychologyOptimizedSizeGridProps> = ({
  selectedOrientation,
  selectedSize,
  userImageUrl,
  onSizeSelect,
  onContinueWithSize
}) => {
  const isMobile = useIsMobile();
  const { state, actions } = useSizeSelection();
  const orientationOptions = sizeOptions[selectedOrientation] || [];
  
  const {
    goldilocksSizes,
    getConfidenceData,
    getEmotionalTriggers,
    getSmartDefault,
    getUrgencyElements
  } = usePsychologicalOptimization({
    sizeOptions: orientationOptions,
    selectedSize,
    userImageUrl
  });

  // Memoize enhanced options for performance
  const enhancedOptions = useMemo(() => {
    return goldilocksSizes.map((option, index) => ({
      ...option,
      tier: index === 0 ? 'best' : index === 1 ? 'better' : 'good',
      label: index === 0 ? 'Most Popular' : index === 1 ? 'Best Value' : 'Great Choice',
      isRecommended: index === 1, // Middle option as recommended
      popularity: index === 0 ? 74 : index === 1 ? 68 : 52
    }));
  }, [goldilocksSizes]);

  const handleSizeSelect = (size: string) => {
    // Optimistic update
    actions.setOptimisticSize(size);
    
    try {
      onSizeSelect(size);
      // Confirm the selection
      actions.setSize(size);
    } catch (error) {
      // Rollback on error
      actions.rollbackOptimistic();
      actions.setError(error instanceof Error ? error.message : 'Failed to select size');
    }
  };

  const handleContinueWithSize = (size: string, e: React.MouseEvent) => {
    try {
      onContinueWithSize(size, e);
    } catch (error) {
      actions.setError(error instanceof Error ? error.message : 'Failed to continue with size');
    }
  };

  const handleRetry = () => {
    actions.setError(null);
    actions.rollbackOptimistic();
  };

  const handleReset = () => {
    actions.resetState();
  };

  if (!orientationOptions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 font-poppins">No size options available for this orientation.</p>
      </div>
    );
  }

  return (
    <SizeSelectionErrorBoundary onRetry={handleRetry} onReset={handleReset}>
      <div className="space-y-6">
        {/* Social Proof Header - Mobile Optimized */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6 border border-purple-100">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-purple-900 font-poppins tracking-tight">
              Customer Favorites
            </h3>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-4'}`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 font-poppins">74%</div>
              <div className="text-sm text-purple-600 font-medium font-poppins">
                Choose Medium Sizes
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 font-poppins">4.9★</div>
              <div className="text-sm text-purple-600 font-medium font-poppins">
                Average Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 font-poppins">12K+</div>
              <div className="text-sm text-purple-600 font-medium font-poppins">
                Happy Customers
              </div>
            </div>
          </div>
        </div>

        {/* Core Size Options */}
        <div className="space-y-4">
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-4 py-2 shadow-lg mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Recommended Sizes for You
            </Badge>
            <p className="text-gray-600 font-poppins text-sm md:text-base">
              Based on thousands of customer choices and your photo analysis
            </p>
          </div>

          <Suspense fallback={<SizeCardSkeleton count={3} isMobile={isMobile} />}>
            <div 
              className={`
                grid gap-4 max-w-6xl mx-auto
                ${isMobile ? 'grid-cols-1 px-2' : 'grid-cols-1 lg:grid-cols-3'}
              `}
              role="radiogroup"
              aria-label="Canvas size options"
            >
              {enhancedOptions.map(option => (
                <MobileOptimizedSizeCard
                  key={option.size}
                  option={option}
                  orientation={selectedOrientation}
                  isSelected={
                    (state.optimisticSelection || selectedSize) === option.size
                  }
                  userImageUrl={userImageUrl}
                  onSelect={() => handleSizeSelect(option.size)}
                  onContinue={(e) => handleContinueWithSize(option.size, e)}
                />
              ))}
            </div>
          </Suspense>
        </div>

        {/* Progressive Disclosure: Additional Options */}
        {orientationOptions.length > goldilocksSizes.length && (
          <div className="text-center">
            <details className="group">
              <summary className="cursor-pointer inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold font-poppins transition-colors min-h-[44px] p-2">
                <Users className="w-4 h-4" />
                View All Size Options ({orientationOptions.length - goldilocksSizes.length} more)
                <span className="transform group-open:rotate-180 transition-transform duration-200">
                  ↓
                </span>
              </summary>
              
              <Suspense fallback={<SizeCardSkeleton count={2} isMobile={isMobile} />}>
                <div className={`
                  mt-6 grid gap-4 animate-fade-in
                  ${isMobile ? 'grid-cols-1 px-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}
                `}>
                  {orientationOptions
                    .filter(option => !goldilocksSizes.find(g => g.size === option.size))
                    .map(option => (
                      <MobileOptimizedSizeCard
                        key={option.size}
                        option={{
                          ...option,
                          tier: 'standard',
                          label: 'Alternative Size',
                          popularity: 35
                        }}
                        orientation={selectedOrientation}
                        isSelected={
                          (state.optimisticSelection || selectedSize) === option.size
                        }
                        userImageUrl={userImageUrl}
                        onSelect={() => handleSizeSelect(option.size)}
                        onContinue={(e) => handleContinueWithSize(option.size, e)}
                      />
                    ))}
                </div>
              </Suspense>
            </details>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-poppins">{state.error}</p>
          </div>
        )}
      </div>
    </SizeSelectionErrorBoundary>
  );
};

export default PsychologyOptimizedSizeGrid;
