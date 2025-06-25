
import { Button } from "@/components/ui/button";
import { Crop, RotateCcw } from "lucide-react";

interface CropperActionsProps {
  onAutoCenterCrop: () => void;
  onCropSave: () => void;
  disabled: boolean;
}

const CropperActions = ({ onAutoCenterCrop, onCropSave, disabled }: CropperActionsProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
      <Button
        variant="outline"
        onClick={onAutoCenterCrop}
        className="text-sm flex items-center gap-2 border-purple-200 hover:bg-purple-50"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Position
      </Button>
      <Button
        onClick={onCropSave}
        disabled={disabled}
        className="bg-purple-600 hover:bg-purple-700 text-sm font-medium px-6 py-2"
      >
        <Crop className="w-4 h-4 mr-2" />
        Apply Crop & Continue
      </Button>
    </div>
  );
};

export default CropperActions;
