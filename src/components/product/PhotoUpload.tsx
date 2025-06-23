
import { useState, useCallback } from "react";
import { Upload, Check, X, ImageIcon, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateImageFile } from "@/utils/fileValidation";

interface PhotoUploadProps {
  onFileSelect: (file: File, previewUrl: string) => void;
  uploadedFile: File | null;
  previewUrl: string | null;
  onRemoveFile: () => void;
}

const PhotoUpload = ({ onFileSelect, uploadedFile, previewUrl, onRemoveFile }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const handleFile = useCallback(async (file: File) => {
    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    setIsUploading(true);
    setValidationError(null);
    setValidationWarnings([]);

    try {
      // Run comprehensive file validation
      const validationResult = await validateImageFile(file);
      
      if (!validationResult.isValid) {
        setValidationError(validationResult.error || 'File validation failed');
        setIsUploading(false);
        return;
      }

      // Set warnings if any were found
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        setValidationWarnings(validationResult.warnings);
        console.warn('File validation warnings:', validationResult.warnings);
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onFileSelect(file, imageUrl);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setValidationError('Failed to read file. The file may be corrupted.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File validation error:', error);
      setValidationError('An error occurred while validating the file. Please try again.');
      setIsUploading(false);
    }
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

  const clearError = () => {
    setValidationError(null);
    setValidationWarnings([]);
  };

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
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="font-medium text-sm">Photo uploaded and validated successfully!</span>
                </div>
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

            {validationWarnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="space-y-1">
                    <p className="font-medium">Security Notice:</p>
                    {validationWarnings.map((warning, index) => (
                      <p key={index} className="text-sm">{warning}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Validation Error Display */}
      {validationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{validationError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-700 h-auto p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-purple-400 bg-purple-50 scale-105' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="space-y-4">
          <div className={`
            w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300
            ${isDragging ? 'bg-purple-200' : 'bg-gray-100'}
          `}>
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className={`w-8 h-8 ${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
            )}
          </div>
          
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              {isUploading ? 'Validating and processing your photo...' : 'Drop your photo here, or click to browse'}
            </h4>
            <p className="text-gray-500">
              Supports JPG, PNG, GIF, WebP, HEIC • Max 10MB
            </p>
            <p className="text-sm text-gray-400 mt-1">
              All uploads are automatically scanned for security
            </p>
          </div>
          
          {!isUploading && (
            <Button 
              variant="outline" 
              className="mt-4 bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
            >
              Choose File
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
