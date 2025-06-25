
interface StyleCardSelectionOverlayProps {
  isSelected: boolean;
}

const StyleCardSelectionOverlay = ({
  isSelected
}: StyleCardSelectionOverlayProps) => {
  if (!isSelected) return null;

  return (
    <>
      {/* Selection Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <div className="absolute inset-0 rounded-t-xl ring-4 ring-purple-500 shadow-lg transition-all duration-200"></div>
        <div className="absolute inset-0 bg-purple-50/20 rounded-t-xl transition-all duration-200"></div>
      </div>

      {/* Selection confirmation text */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-purple-50/90 text-purple-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white">
          ✓ SELECTED
        </div>
      </div>
    </>
  );
};

export default StyleCardSelectionOverlay;
