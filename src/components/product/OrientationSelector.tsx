
import OrientationCard from "./orientation/components/OrientationCard";
import SizeCard from "./orientation/components/SizeCard";
import OrientationHeader from "./orientation/components/OrientationHeader";
import SizeHeader from "./orientation/components/SizeHeader";
import { orientationOptions } from "./orientation/data/orientationOptions";
import { sizeOptions } from "./orientation/data/sizeOptions";
import { OrientationSelectorProps } from "./orientation/types";

const OrientationSelector = ({ 
  selectedOrientation, 
  selectedSize,
  onOrientationChange, 
  onSizeChange,
  onContinue
}: OrientationSelectorProps) => {
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

  return (
    <div className="space-y-10">
      <OrientationHeader selectedOrientation={selectedOrientation} />

      {/* Premium Orientation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orientationOptions.map((orientation) => (
          <OrientationCard
            key={orientation.id}
            orientation={orientation}
            isSelected={selectedOrientation === orientation.id}
            onClick={() => handleOrientationSelect(orientation.id)}
          />
        ))}
      </div>

      {/* Size Selection */}
      {selectedOrientation && (
        <>
          <SizeHeader />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sizeOptions[selectedOrientation]?.map((option, index) => (
              <SizeCard
                key={option.size}
                option={option}
                orientation={selectedOrientation}
                isSelected={selectedSize === option.size}
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
