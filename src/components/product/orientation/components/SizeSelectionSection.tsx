
import { forwardRef } from "react";
import SizeHeader from "./SizeHeader";
import PsychologyOptimizedSizeGrid from "./PsychologyOptimizedSizeGrid";
import SizeTransitionIndicator from "./SizeTransitionIndicator";
import PriceUpdateDisplay from "./PriceUpdateDisplay";
import { SizeOption } from "../types";

interface SizeSelectionSectionProps {
  selectedOrientation: string;
  selectedSize: string;
  recommendedSize: string;
  currentSizeOption: SizeOption | null;
  onSizeSelect: (size: string) => void;
  onContinueWithSize: (size: string, e: React.MouseEvent) => void;
}

const SizeSelectionSection = forwardRef<HTMLDivElement, SizeSelectionSectionProps>(
  ({ selectedOrientation, selectedSize, currentSizeOption, onSizeSelect, onContinueWithSize }, ref) => {
    return (
      <>
        {/* Smooth transition indicator */}
        <SizeTransitionIndicator selectedOrientation={selectedOrientation} />

        {/* Size Selection Section - Psychology Optimized */}
        {selectedOrientation && (
          <>
            <SizeHeader />
            <div ref={ref}>
              <PsychologyOptimizedSizeGrid
                selectedOrientation={selectedOrientation}
                selectedSize={selectedSize}
                userImageUrl={null}
                onSizeSelect={onSizeSelect}
                onContinueWithSize={onContinueWithSize}
              />
            </div>

            {/* Real-time Price Update */}
            <PriceUpdateDisplay
              selectedSize={selectedSize}
              currentSizeOption={currentSizeOption}
            />
          </>
        )}
      </>
    );
  }
);

SizeSelectionSection.displayName = "SizeSelectionSection";

export default SizeSelectionSection;
