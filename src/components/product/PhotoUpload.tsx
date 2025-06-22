
import { useState, useCallback } from "react";
import { Upload, Check, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface PhotoUploadProps {
  onFileSelect: (file: File, previewUrl: string) => void;
  uploadedFile: File | null;
  previewUrl: string | null;
  onRemoveFile: () => void;
}

const PhotoUpload = ({ onFileSelect, uploadedFile, previewUrl, onRemoveFile }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      onFileSelect(file, imageUrl);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  if (uploadedFile && previewUrl) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <AspectRatio ratio={1} className="w-24 rounded-xl overflow-hidden shadow-lg">
              <img 
                src={previewUrl} 
                alt="Uploaded preview" 
                className="w-full h-full object-cover"
              />
            </AspectRatio>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600" />
                  {uploadedFile.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for cropping
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveFile}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-4 h-4" />
                <span className="font-medium text-sm">Photo uploaded successfully!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer
        ${isDragging 
          ? 'border-purple-400 bg-purple-50 scale-105' 
          : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-4">
        <div className={`
          w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300
          ${isDragging ? 'bg-purple-200' : 'bg-gray-100'}
        `}>
          <Upload className={`w-8 h-8 ${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
        </div>
        
        <div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Drop your photo here, or click to browse
          </h4>
          <p className="text-gray-500">
            Supports JPG, PNG, HEIC • Max 10MB
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="mt-4 bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
        >
          Choose File
        </Button>
      </div>
    </div>
  );
};

export default PhotoUpload;
