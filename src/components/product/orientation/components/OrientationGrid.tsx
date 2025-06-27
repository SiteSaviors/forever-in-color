
import OrientationCard from "./OrientationCard";
import { MobileGrid } from "@/components/ui/mobile-grid";
import { orientationOptions } from "../data/orientationOptions";
import { useCallback } from "react";

interface OrientationGridProps {
  selectedOrientation: string;
  userImageUrl: string | null;
  onOrientationSelect: (orientation: string) => void;
  recommendedOrientation: string;
}

const OrientationGrid = ({
  selectedOrientation,
  userImageUrl,
  onOrientationSelect,
  recommendedOrientation
}: OrientationGridProps) => {
  const handleOrientationSelect = useCallback((orientation: string) => {
    onOrientationSelect(orientation);
  }, [onOrientationSelect]);

  return (
    <MobileGrid
      responsive={{
        xs: 1,
        sm: 2,
        md: 3
      }}
      gap="lg"
      className="prevent-overflow"
      data-orientation-section
      role="radiogroup"
      aria-label="Canvas orientation options"
    >
      {orientationOptions.map(orientation => (
        <div 
          key={orientation.id} 
          className="transform transition-all duration-300 hover:-translate-y-1 prevent-overflow"
        >
          <OrientationCard 
            orientation={orientation} 
            isSelected={selectedOrientation === orientation.id} 
            isRecommended={orientation.id === recommendedOrientation}
            userImageUrl={userImageUrl} 
            onClick={() => handleOrientationSelect(orientation.id)} 
          />
        </div>
      ))}
    </MobileGrid>
  );
};

export default OrientationGrid;
