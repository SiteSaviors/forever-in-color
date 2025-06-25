
import GlassMorphismSizeCard from "./GlassMorphismSizeCard";
import SizeHeader from "./SizeHeader";
import ValidationMessage from "./ValidationMessage";
import { sizeOptions } from "../data/sizeOptions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDown, DollarSign } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { SizeSelectionProps } from "../types/interfaces";

const SizeSelectionSection = ({
  selectedOrientation,
  selectedSize,
  userImageUrl,
  onSizeChange,
  onContinue,
  isUpdating,
  disabled = false,
  validationErrors = [],
  showErrors = false
}: SizeSelectionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getRecommendedSize = useMemo(() => {
    const recommendations = {
      'square': '24" x 24"',
      'horizontal': '24" x 18"',
      'vertical': '18" x 24"'
    };
    return recommendations[selectedOrientation as keyof typeof recommendations] || '';
  }, [selectedOrientation]);

  const getSizePrice = useCallback((size: string) => {
    switch (size) {
      case "16\" x 12\"": return 99.99;
      case "24\" x 18\"": return 149.99;
      case "36\" x 24\"": return 199.99;
      case "40\" x 30\"": return 269.99;
      case "48\" x 32\"": return 349.99;
      case "60\" x 40\"": return 499.99;
      case "12\" x 16\"": return 99.99;
      case "18\" x 24\"": return 149.99;
      case "24\" x 36\"": return 199.99;
      case "30\" x 40\"": return 269.99;
      case "32\" x 48\"": return 349.99;
      case "40\" x 60\"": return 499.99;
      case "16\" x 16\"": return 99.99;
      case "24\" x 24\"": return 149.99;
      case "32\" x 32\"": return 199.99;
      case "36\" x 36\"": return 269.99;
      default: return 99.99;
    }
  }, []);

  const handleSizeSelect = useCallback((size: string) => {
    if (isUpdating || isProcessing || disabled) return;
    
    setIsProcessing(true);
    
    // Single debounced update
    setTimeout(() => {
      onSizeChange(size);
      setIsProcessing(false);
    }, 50);
  }, [onSizeChange, isUpdating, isProcessing, disabled]);
  
  const handleContinueWithSize = useCallback((size: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (isUpdating || isProcessing || disabled) return;
    
    setIsProcessing(true);
    onSizeChange(size);
    
    if (onContinue) {
      setTimeout(() => {
        onContinue();
        setIsProcessing(false);
      }, 100);
    } else {
      setIsProcessing(false);
    }
  }, [onSizeChange, onContinue, isUpdating, isProcessing, disabled]);

  const recommendedSize = getRecommendedSize;
  const availableSizes = useMemo(() => sizeOptions[selectedOrientation] || [], [selectedOrientation]);
  const isInteractionDisabled = isUpdating || isProcessing || disabled;
  const hasSizeError = validationErrors.some(error => error.field === 'size' && error.type === 'error');

  if (!selectedOrientation) return null;

  // Debug log to check userImageUrl
  console.log('🖼️ SizeSelectionSection userImageUrl:', userImageUrl);

  return (
    <section className="space-y-6" aria-labelledby="size-selection-heading">
      {/* Transition indicator */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-purple-600 animate-bounce">
          <ArrowDown className="w-4 h-4" />
          <span className="text-sm font-medium">Now choose your size</span>
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>

      <SizeHeader />

      {/* Validation Messages */}
      <ValidationMessage 
        errors={validationErrors.filter(error => error.field === 'size')}
        showErrors={showErrors}
        className="mb-4"
      />

      {/* Size Selection Fieldset */}
      <fieldset 
        className="space-y-6"
        data-size-group
        aria-labelledby="size-selection-heading"
        aria-describedby="size-selection-description"
      >
        <legend className="sr-only">Choose your canvas size</legend>
        
        <div>
          <h3 id="size-selection-heading" className="text-xl font-semibold text-gray-900 mb-2">
            Select Your Size
          </h3>
          <p id="size-selection-description" className="text-gray-600 mb-4">
            Choose the perfect size for your space and budget
          </p>
        </div>

        {/* Size Cards Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          role="radiogroup"
          aria-labelledby="size-selection-heading"
          aria-required="true"
          aria-invalid={hasSizeError}
        >
          {availableSizes.map((option, index) => (
            <div 
              key={option.size} 
              className={`transform transition-transform duration-200 will-change-transform ${
                isInteractionDisabled ? 'pointer-events-none opacity-60' : 'hover:-translate-y-1'
              }`}
            >
              <GlassMorphismSizeCard 
                option={option} 
                orientation={selectedOrientation}
                isSelected={selectedSize === option.size} 
                isRecommended={option.size === recommendedSize}
                userImageUrl={userImageUrl} 
                onClick={() => handleSizeSelect(option.size)} 
                onContinue={e => handleContinueWithSize(option.size, e)} 
                disabled={isInteractionDisabled}
                // Accessibility props
                role="radio"
                aria-checked={selectedSize === option.size}
                aria-labelledby={`size-${option.size}-label`}
                tabIndex={selectedSize === option.size ? 0 : -1}
                data-size={option.size}
                // Mobile-optimized touch target
                className="min-h-[48px] touch-manipulation"
              />
            </div>
          ))}
        </div>

        {/* Keyboard navigation hint for screen readers */}
        <div className="sr-only" aria-live="polite">
          Use up and down arrow keys to navigate between size options. Press Enter or Space to select.
        </div>
      </fieldset>

      {/* Real-time Price Update */}
      {selectedSize && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <DollarSign className="w-5 h-5" />
            <span className="text-lg font-semibold">
              Starting at ${getSizePrice(selectedSize)} for {selectedSize} canvas
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Final price will be calculated with your customizations
          </p>
        </div>
      )}
    </section>
  );
};

export default SizeSelectionSection;
