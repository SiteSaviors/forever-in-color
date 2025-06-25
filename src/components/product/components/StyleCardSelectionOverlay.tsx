
import { getZIndexClass } from "@/utils/zIndexLayers";

interface StyleCardSelectionOverlayProps {
  isSelected: boolean;
}

/**
 * StyleCardSelectionOverlay Component
 * 
 * Provides visual feedback when a style card is selected by the user.
 * Uses a layered approach with ring borders and background tints.
 * 
 * Visual Design:
 * - Purple ring border to indicate selection state
 * - Subtle background tint for additional visual feedback
 * - Confirmation badge positioned outside card bounds
 * 
 * Z-Index Strategy:
 * - Base overlay uses STYLE_CARD_OVERLAYS layer
 * - Selection badge uses higher z-index for visibility
 * - Ensures selection state is clearly visible above all card content
 */
const StyleCardSelectionOverlay = ({
  isSelected
}: StyleCardSelectionOverlayProps) => {
  if (!isSelected) return null;

  return (
    <>
      {/* Main selection overlay with ring border and background tint */}
      <div className={`absolute inset-0 pointer-events-none ${getZIndexClass('STYLE_CARD_OVERLAYS', 3)}`}>
        <div className="absolute inset-0 rounded-t-xl ring-4 ring-purple-500 shadow-lg transition-all duration-200"></div>
        <div className="absolute inset-0 bg-purple-50/20 rounded-t-xl transition-all duration-200"></div>
      </div>

      {/* Selection confirmation badge positioned outside card bounds */}
      <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${getZIndexClass('STYLE_CARD_OVERLAYS', 4)}`}>
        <div className="bg-purple-50/90 text-purple-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
          ✓ SELECTED
        </div>
      </div>
    </>
  );
};

export default StyleCardSelectionOverlay;
