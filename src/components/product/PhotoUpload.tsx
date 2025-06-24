
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";
import { validateImageFile } from "@/utils/fileValidation";

interface PhotoUploadProps {
  onImageUpload: (imageUrl: string) => void;
}

const PhotoUpload = ({ onImageUpload }: PhotoUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    const validationResult = await validateImageFile(file);
    if (!validationResult.isValid) {
      console.error('File validation failed:', validationResult.error);
      return;
    }

    if (validationResult.warnings) {
      console.warn('File validation warnings:', validationResult.warnings);
    }

    setIsUploading(true);
    try {
      // Create object URL for the uploaded file
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      onImageUpload(imageUrl);
      console.log('Photo upload completed successfully:', imageUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Show success state if image is uploaded
  if (uploadedImage) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 rounded-full">
                <ImageIcon className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Photo Uploaded Successfully!
              </h3>
              <p className="text-gray-600">
                Your image is ready. Choose an art style below to see the magic happen.
              </p>
            </div>

            <div className="mt-6">
              <img 
                src={uploadedImage} 
                alt="Uploaded photo" 
                className="max-w-xs max-h-48 mx-auto rounded-lg shadow-md object-cover"
              />
            </div>
            
            <Button
              onClick={() => {
                setUploadedImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              variant="outline"
              className="mt-4"
            >
              Upload Different Photo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-8">
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
            ${isDragOver 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50/50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-purple-100 rounded-full">
                {isUploading ? (
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 text-purple-600" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {isUploading ? 'Uploading...' : 'Upload Your Photo'}
              </h3>
              <p className="text-gray-600">
                Drag and drop your image here, or click to browse
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" />
                JPG, PNG, WebP
              </div>
              <div className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                Max 10MB
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Button
            onClick={handleClick}
            disabled={isUploading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isUploading ? 'Uploading...' : 'Choose File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
