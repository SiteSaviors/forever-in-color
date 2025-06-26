
import { useRef, useState } from "react";
import { Upload, Image, Sparkles } from "lucide-react";

interface UploadDropzoneProps {
  onImageUpload: (file: File) => Promise<void>;
  initialImage?: string | null;
}

const UploadDropzone = ({ onImageUpload, initialImage }: UploadDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      setIsUploading(true);
      await onImageUpload(imageFile);
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      await onImageUpload(file);
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer 
        transition-all duration-300 ease-out group hover:scale-[1.02]
        ${isDragOver 
          ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }
        ${isUploading ? 'pointer-events-none opacity-75' : ''}
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
        {/* Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-lg">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            ) : (
              <Upload className="h-8 w-8 text-purple-600" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900">
            {isUploading ? 'Processing your image...' : 'Upload Your Photo'}
          </h3>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {isUploading 
              ? 'Optimizing and preparing your image for AI transformation'
              : 'Drag & drop your image here or click to browse'
            }
          </p>
        </div>

        {/* Features */}
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Image className="h-4 w-4" />
            <span>JPG, PNG, WebP</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Auto-enhanced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDropzone;
