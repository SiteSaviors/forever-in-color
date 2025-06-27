
import PsychologyOptimizedSizeCard from "./PsychologyOptimizedSizeCard";
import { sizeOptions } from "../data/sizeOptions";
import { usePsychologicalOptimization } from "../hooks/usePsychologicalOptimization";
import { useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Sparkles } from "lucide-react";

interface PsychologyOptimizedSizeGridProps {
  selectedOrientation: string;
  selectedSize: string;
  userImageUrl: string | null;
  onSizeSelect: (size: string) => void;
  onContinueWithSize: (size: string, e: React.MouseEvent) => void;
}

const PsychologyOptimizedSizeGrid = ({
  selectedOrientation,
  selectedSize,
  userImageUrl,
  onSizeSelect,
  onContinueWithSize
}: PsychologyOptimizedSizeGridProps) => {
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

  // Auto-select smart default if no size is selected
  useEffect(() => {
    if (!selectedSize && goldilocksSizes.length > 0) {
      const smartDefault = getSmartDefault();
      if (smartDefault) {
        onSizeSelect(smartDefault);
      }
    }
  }, [selectedSize, goldilocksSizes, getSmartDefault, onSizeSelect]);

  const handleSizeSelect = useCallback((size: string) => {
    onSizeSelect(size);
  }, [onSizeSelect]);

  const handleContinueWithSize = useCallback((size: string, e: React.MouseEvent) => {
    onContinueWithSize(size, e);
  }, [onContinueWithSize]);

  if (!orientationOptions.length) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Social Proof Header */}
      <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-purple-900 font-poppins tracking-extra-tight drop-shadow-sm">
            Customer Favorites
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700 font-poppins drop-shadow-sm">74%</div>
            <div className="text-sm text-purple-600 font-medium font-poppins">Choose Medium Sizes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700 font-poppins drop-shadow-sm">4.9★</div>
            <div className="text-sm text-purple-600 font-medium font-poppins">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700 font-poppins drop-shadow-sm">12K+</div>
            <div className="text-sm text-purple-600 font-medium font-poppins">Happy Customers</div>
          </div>
        </div>
      </div>

      {/* Goldilocks Method: Core Options */}
      <div className="space-y-6">
        <div className="text-center">
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-4 py-2 shadow-lg mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Recommended Sizes for You
          </Badge>
          <p className="text-gray-600 font-poppins tracking-tight">
            Based on thousands of customer choices and your photo analysis
          </p>
        </div>

        <div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          data-size-section
          role="radiogroup"
          aria-label="Canvas size options"
        >
          {goldilocksSizes.map(option => (
            <div key={option.size} className="transform transition-all duration-300">
              <PsychologyOptimizedSizeCard 
                option={option} 
                orientation={selectedOrientation}
                isSelected={selectedSize === option.size} 
                userImageUrl={userImageUrl}
                confidenceData={getConfidenceData(option.size)}
                urgencyData={getUrgencyElements(option.size)}
                emotionalTriggers={getEmotionalTriggers(option.size, selectedSize === option.size)}
                onClick={() => handleSizeSelect(option.size)} 
                onContinue={e => handleContinueWithSize(option.size, e)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Progressive Disclosure: Additional Options */}
      {orientationOptions.length > goldilocksSizes.length && (
        <div className="text-center">
          <details className="group">
            <summary className="cursor-pointer inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold font-poppins tracking-tight transition-colors">
              <Users className="w-4 h-4" />
              View All Size Options ({orientationOptions.length - goldilocksSizes.length} more)
              <span className="transform group-open:rotate-180 transition-transform duration-200">↓</span>
            </summary>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {orientationOptions
                .filter(option => !goldilocksSizes.find(g => g.size === option.size))
                .map(option => (
                  <div key={option.size} className="transform transition-all duration-300 opacity-80 hover:opacity-100">
                    <PsychologyOptimizedSizeCard 
                      option={option} 
                      orientation={selectedOrientation}
                      isSelected={selectedSize === option.size} 
                      userImageUrl={userImageUrl}
                      confidenceData={getConfidenceData(option.size)}
                      urgencyData={getUrgencyElements(option.size)}
                      emotionalTriggers={getEmotionalTriggers(option.size, selectedSize === option.size)}
                      onClick={() => handleSizeSelect(option.size)} 
                      onContinue={e => handleContinueWithSize(option.size, e)} 
                    />
                  </div>
                ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default PsychologyOptimizedSizeGrid;
