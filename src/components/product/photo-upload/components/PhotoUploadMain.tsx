
import { Upload, Image, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useFileInputTrigger } from "../../hooks/useFileInputTrigger";

interface PhotoUploadMainProps {
  isDragOver: boolean;
  isUploading: boolean;
  uploadProgress: number;
  processingStage: string;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhotoUploadMain = ({
  isDragOver,
  isUploading,
  uploadProgress,
  processingStage,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  onFileChange
}: PhotoUploadMainProps) => {
  const { fileInputRef, triggerFileInput } = useFileInputTrigger();

  // Handle the onClick to ensure it works via normal clicking
  const handleDropzoneClick = () => {
    console.log('🎯 Dropzone clicked, triggering file input');
    triggerFileInput();
    onClick();
  };

  return (
    <Card className="w-full">
      <div
        data-upload-dropzone
        className={`relative p-12 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-gray-300 hover:border-purple-300 hover:bg-purple-25'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={handleDropzoneClick}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {processingStage || "Processing your photo..."}
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              {isDragOver ? (
                <Upload className="w-8 h-8 text-purple-600" />
              ) : (
                <Image className="w-8 h-8 text-purple-600" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {isDragOver ? "Drop your photo here" : "Upload Your Photo"}
              </h3>
              <p className="text-gray-600">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, WEBP • Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PhotoUploadMain;
