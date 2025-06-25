
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
  disabled = false
}: LayoutSelectionProps) => {
  const getRecommendedOrientation = () => {
    if (!userImageUrl) return 'square';
    return 'square'; // Smart recommendation logic can be enhanced here
  };

  const recommendedOrientation = getRecommendedOrientation();

  return (
    <>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {orientationOptions.map(orientation => (
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
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default LayoutSelectionSection;
