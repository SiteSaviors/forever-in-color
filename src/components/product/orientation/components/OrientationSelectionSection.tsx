
import { forwardRef } from "react";
import OrientationGrid from "./OrientationGrid";
import SmartRecommendations from "./SmartRecommendations";

interface OrientationSelectionSectionProps {
  selectedOrientation: string;
  userImageUrl: string | null;
  recommendedOrientation: string;
  onOrientationSelect: (orientation: string) => void;
}

const OrientationSelectionSection = forwardRef<HTMLDivElement, OrientationSelectionSectionProps>(
  ({ selectedOrientation, userImageUrl, recommendedOrientation, onOrientationSelect }, ref) => {
    return (
      <>
        {/* Smart Recommendations Panel */}
        {userImageUrl && (
          <div className="relative">
            <SmartRecommendations selectedOrientation={selectedOrientation} userImageUrl={userImageUrl} />
          </div>
        )}

        {/* Orientation Selection Section */}
        <div ref={ref}>
          <OrientationGrid
            selectedOrientation={selectedOrientation}
            userImageUrl={userImageUrl}
            onOrientationSelect={onOrientationSelect}
            recommendedOrientation={recommendedOrientation}
          />
        </div>
      </>
    );
  }
);

OrientationSelectionSection.displayName = "OrientationSelectionSection";

export default OrientationSelectionSection;
