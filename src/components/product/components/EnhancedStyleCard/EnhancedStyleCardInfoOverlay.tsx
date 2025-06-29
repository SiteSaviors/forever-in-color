
import { memo } from "react";
import { Info } from "lucide-react";

interface EnhancedStyleCardInfoOverlayProps {
  styleName: string;
  description: string;
  isVisible: boolean;
}

const EnhancedStyleCardInfoOverlay = memo(({
  styleName,
  description,
  isVisible
}: EnhancedStyleCardInfoOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 rounded-lg">
      <div className="text-center text-white space-y-2">
        <Info className="w-8 h-8 mx-auto mb-2" />
        <h4 className="font-semibold text-lg">{styleName}</h4>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </div>
  );
});

EnhancedStyleCardInfoOverlay.displayName = 'EnhancedStyleCardInfoOverlay';

export default EnhancedStyleCardInfoOverlay;
