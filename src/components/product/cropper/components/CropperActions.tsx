
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RotateCcw, Crop } from "lucide-react";
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
      } else {
        console.error('File validation failed:', validationResult.error);
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
            className="text-sm flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Change Photo
          </Button>
        </>
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
        Apply Crop
      </Button>
    </div>
  );
};

export default CropperActions;
