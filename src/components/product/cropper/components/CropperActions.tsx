
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RotateCcw, Crop } from "@/components/ui/icons";
import { validateImageFile } from "@/utils/fileValidation";

interface CropperActionsProps {
  onChangePhoto?: (file: File) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onChangePhoto) {
      const file = files[0];
      const validationResult = await validateImageFile(file);
      if (validationResult.isValid) {
        onChangePhoto(file);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
      {onChangePhoto && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={handleChangePhotoClick} 
            className="text-sm flex items-center gap-2 border-gray-300/60 hover:bg-gray-50/80 text-gray-700 backdrop-blur-sm"
          >
            <Upload className="w-4 h-4" />
            Change Photo
          </Button>
        </>
      )}
      <Button 
        variant="outline" 
        onClick={onAutoCenterCrop} 
        className="text-sm flex items-center gap-2 border-cyan-200/60 hover:bg-cyan-50/80 text-cyan-700 backdrop-blur-sm"
      >
        <RotateCcw className="w-4 h-4" />
        Reset Crop Position
      </Button>
      <Button 
        onClick={onCropSave} 
        disabled={!croppedAreaPixels} 
        className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-600 hover:via-violet-600 hover:to-fuchsia-600 text-white text-sm font-medium px-8 py-3 shadow-2xl shadow-cyan-500/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
      >
        <Crop className="w-4 h-4 mr-2" />
        Apply Crop
      </Button>
    </div>
  );
};

export default CropperActions;
