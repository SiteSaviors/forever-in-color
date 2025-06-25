
import OrientationCard from "./OrientationCard";
import { orientationOptions } from "../data/orientationOptions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye } from "lucide-react";
import { LayoutSelectionProps } from "../types/interfaces";

const LayoutSelectionSection = ({
  selectedOrientation,
  userImageUrl,
  onOrientationChange,
  isUpdating,
  disabled = false,
  validationErrors = [],
  showErrors = false
}: LayoutSelectionProps) => {
  const getRecommendedOrientation = () => {
    if (!userImageUrl) return 'square';
    return 'square'; // Smart recommendation logic can be enhanced here
  };

  const recommendedOrientation = getRecommendedOrientation();
  const hasOrientationError = validationErrors.some(error => error.field === 'orientation' && error.type === 'error');

  return (
    <fieldset 
      className="space-y-6"
      data-orientation-group
      aria-labelledby="layout-selection-heading"
      aria-describedby="layout-selection-description"
    >
      <legend className="sr-only">Choose your canvas layout orientation</legend>
      
      <div>
        <h3 id="layout-selection-heading" className="text-xl font-semibold text-gray-900 mb-2">
          Choose Your Layout
        </h3>
        <p id="layout-selection-description" className="text-gray-600 mb-4">
          Select the orientation that best fits your photo and space
        </p>
      </div>

      {/* Visual Connection Helper */}
      {userImageUrl && (
        <Alert className="border-blue-200 bg-blue-50">
          <Eye className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>✨ Live Preview:</strong> The canvases below show exactly how your photo will look in each orientation. This is your actual image positioned on the final product!
          </AlertDescription>
        </Alert>
      )}

      {/* Orientation Cards Grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
        role="radiogroup"
        aria-labelledby="layout-selection-heading"
        aria-required="true"
        aria-invalid={hasOrientationError}
      >
        {orientationOptions.map((orientation, index) => (
          <div 
            key={orientation.id} 
            className={`transform transition-transform duration-300 ${
              disabled ? 'pointer-events-none opacity-60' : 'hover:-translate-y-1'
            }`}
          >
            <OrientationCard 
              orientation={orientation} 
              isSelected={selectedOrientation === orientation.id} 
              isRecommended={orientation.id === recommendedOrientation}
              userImageUrl={userImageUrl} 
              onClick={() => {
                if (!isUpdating && !disabled) {
                  onOrientationChange(orientation.id);
                }
              }}
              // Accessibility props
              role="radio"
              aria-checked={selectedOrientation === orientation.id}
              aria-labelledby={`orientation-${orientation.id}-label`}
              tabIndex={selectedOrientation === orientation.id ? 0 : -1}
              data-orientation={orientation.id}
              // Mobile-optimized touch target
              className="min-h-[48px] touch-manipulation"
            />
          </div>
        ))}
      </div>

      {/* Keyboard navigation hint for screen readers */}
      <div className="sr-only" aria-live="polite">
        Use left and right arrow keys to navigate between layout options. Press Enter or Space to select.
      </div>
    </fieldset>
  );
};

export default LayoutSelectionSection;
