
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload, RotateCcw, Crop } from "lucide-react";

interface CropperActionsProps {
  onChangePhoto?: () => void;
  onAutoCenterCrop: () => void;
  onCropSave: () => void;
  croppedAreaPixels: any;
}

const CropperActions = ({
  onChangePhoto,
  onAutoCenterCrop,
  onCropSave,
  croppedAreaPixels
}: CropperActionsProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
      {onChangePhoto && (
        <Button 
          variant="outline" 
          onClick={onChangePhoto} 
          className="text-sm flex items-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <Upload className="w-4 h-4" />
          Change Photo
        </Button>
      )}
      <Button 
        variant="outline" 
        onClick={onAutoCenterCrop} 
        className="text-sm flex items-center gap-2 border-purple-200 hover:bg-purple-50"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Crop Position
      </Button>
      <Button 
        onClick={onCropSave} 
        disabled={!croppedAreaPixels} 
        className="bg-purple-600 hover:bg-purple-700 text-sm font-medium px-8 py-3"
      >
        <Crop className="w-4 h-4 mr-2" />
        Apply Canvas & Crop
      </Button>
    </div>
  );
};

export default CropperActions;
