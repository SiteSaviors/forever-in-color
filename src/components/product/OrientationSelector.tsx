import OrientationCard from "./orientation/components/OrientationCard";
import GlassMorphismSizeCard from "./orientation/components/GlassMorphismSizeCard";
import OrientationHeader from "./orientation/components/OrientationHeader";
import SizeHeader from "./orientation/components/SizeHeader";
import SmartRecommendations from "./orientation/components/SmartRecommendations";
import { orientationOptions } from "./orientation/data/orientationOptions";
import { sizeOptions } from "./orientation/data/sizeOptions";
import { OrientationSelectorProps } from "./orientation/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, ArrowDown } from "lucide-react";
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
  return <div className="space-y-10">
      <OrientationHeader selectedOrientation={selectedOrientation} />

      {/* Visual Connection Helper */}
      {userImageUrl && <Alert className="border-blue-200 bg-blue-50">
          <Eye className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>✨ Live Preview:</strong> The canvases below show exactly how your photo will look in each orientation. This is your actual image positioned on the final product!
          </AlertDescription>
        </Alert>}

      {/* Smart Recommendations Panel with Glass Effect */}
      {userImageUrl && <div className="relative">
          
          <SmartRecommendations selectedOrientation={selectedOrientation} userImageUrl={userImageUrl} />
        </div>}

      {/* Premium Orientation Cards with Enhanced Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {orientationOptions.map(orientation => <div key={orientation.id} className="transform transition-all duration-500 hover:-translate-y-2">
            <OrientationCard orientation={orientation} isSelected={selectedOrientation === orientation.id} isRecommended={orientation.id === recommendedOrientation} userImageUrl={userImageUrl} onClick={() => handleOrientationSelect(orientation.id)} />
          </div>)}
      </div>

      {/* Smooth transition indicator */}
      {selectedOrientation && <div className="flex justify-center">
          <div className="flex items-center gap-2 text-purple-600 animate-bounce">
            <ArrowDown className="w-4 h-4" />
            <span className="text-sm font-medium">Now choose your size</span>
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>}

      {/* Premium Size Selection with Glass Morphism */}
      {selectedOrientation && <>
          <SizeHeader />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sizeOptions[selectedOrientation]?.map(option => <div key={option.size} className="transform transition-all duration-500 hover:-translate-y-2">
                <GlassMorphismSizeCard option={option} orientation={selectedOrientation} isSelected={selectedSize === option.size} isRecommended={option.size === recommendedSize} userImageUrl={userImageUrl} onClick={() => handleSizeSelect(option.size)} onContinue={e => handleContinueWithSize(option.size, e)} />
              </div>)}
          </div>
        </>}
    </div>;
};
export default OrientationSelector;