
import { useState, useCallback } from "react";
import { Upload, Check, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadProps {
  onUploadComplete: () => void;
}

const PhotoUpload = ({ onUploadComplete }: PhotoUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      setPreviewUrl(e.target?.result as string);
      setUploadedFile(file);
      setIsUploading(false);
      
      // Simulate upload delay then mark as complete
      setTimeout(() => {
        onUploadComplete();
      }, 500);
    };
    reader.readAsDataURL(file);
  }, [onUploadComplete]);

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

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Instructions */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-gray-900">
          Upload Your Photo
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose a clear photo with good lighting. No filters, please. We'll transform it into beautiful art while preserving every precious detail.
        </p>
      </div>

      {/* Upload Area */}
      {!uploadedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
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
      ) : (
        /* Preview Area */
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            {/* Image Preview */}
            <div className="relative">
              <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Uploaded preview" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Success Badge */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* File Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    {uploadedFile.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Photo uploaded successfully!</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Your photo looks great and is ready for artistic transformation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Tips for Best Results</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use high-resolution photos (at least 1000x1000px)</li>
          <li>• Ensure good lighting and clear facial features</li>
          <li>• Avoid heavily filtered or edited photos</li>
          <li>• Group photos work best with 2-4 people</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUpload;
