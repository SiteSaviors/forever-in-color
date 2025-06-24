
import OrientationCard from "./orientation/components/OrientationCard";
import PremiumSizeCard from "./orientation/components/PremiumSizeCard";
import OrientationHeader from "./orientation/components/OrientationHeader";
import SizeHeader from "./orientation/components/SizeHeader";
import SmartRecommendations from "./orientation/components/SmartRecommendations";
import { orientationOptions } from "./orientation/data/orientationOptions";
import { sizeOptions } from "./orientation/data/sizeOptions";
import { OrientationSelectorProps } from "./orientation/types";

interface ExtendedOrientationSelectorProps extends OrientationSelectorProps {
  userImageUrl?: string | null;
}

const OrientationSelector = ({ 
  selectedOrientation, 
  selectedSize,
  userImageUrl = null,
  onOrientationChange, 
  onSizeChange,
  onContinue
}: ExtendedOrientationSelectorProps) => {
  
  const handleOrientationSelect = (orientation: string) => {
    onOrientationChange(orientation);
    // Reset size when orientation changes
    onSizeChange("");
  };

  const handleSizeSelect = (size: string) => {
    onSizeChange(size);
  };

  const handleContinueWithSize = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSizeChange(size);
    if (onContinue) {
      onContinue();
    }
  };

  // Smart recommendation logic - for demo, recommend square as most versatile
  const getRecommendedOrientation = () => {
    if (!userImageUrl) return 'square';
    // This would analyze the image aspect ratio in a real implementation
    return 'square';
  };

  // Smart size recommendation based on orientation
  const getRecommendedSize = (orientation: string) => {
    const recommendations = {
      'square': '16" x 16"',
      'horizontal': '18" x 24"', 
      'vertical': '16" x 20"'
    };
    return recommendations[orientation as keyof typeof recommendations] || '';
  };

  const recommendedOrientation = getRecommendedOrientation();
  const recommendedSize = getRecommendedSize(selectedOrientation);

  return (
    <div className="space-y-10">
      <OrientationHeader selectedOrientation={selectedOrientation} />

      {/* Smart Recommendations Panel */}
      {userImageUrl && (
        <SmartRecommendations 
          selectedOrientation={selectedOrientation}
          userImageUrl={userImageUrl}
        />
      )}

      {/* Premium Orientation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orientationOptions.map((orientation) => (
          <OrientationCard
            key={orientation.id}
            orientation={orientation}
            isSelected={selectedOrientation === orientation.id}
            isRecommended={orientation.id === recommendedOrientation}
            userImageUrl={userImageUrl}
            onClick={() => handleOrientationSelect(orientation.id)}
          />
        ))}
      </div>

      {/* Premium Size Selection */}
      {selectedOrientation && (
        <>
          <SizeHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sizeOptions[selectedOrientation]?.map((option) => (
              <PremiumSizeCard
                key={option.size}
                option={option}
                orientation={selectedOrientation}
                isSelected={selectedSize === option.size}
                isRecommended={option.size === recommendedSize}
                userImageUrl={userImageUrl}
                onClick={() => handleSizeSelect(option.size)}
                onContinue={(e) => handleContinueWithSize(option.size, e)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrientationSelector;
