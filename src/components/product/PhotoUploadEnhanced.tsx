import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Image as ImageIcon, AlertTriangle, Wifi, Clock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EnhancedFileValidator, NetworkAwareFileProcessor, EnhancedValidationResult } from "@/utils/enhancedFileValidation";
import PhotoCropper from "./PhotoCropper";

interface PhotoUploadEnhancedProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string) => void;
  initialImage?: string | null;
}

const PhotoUploadEnhanced = ({ onImageUpload, initialImage }: PhotoUploadEnhancedProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage || null);
  const [showCropper, setShowCropper] = useState(false);
  const [validationResult, setValidationResult] = useState<EnhancedValidationResult | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'online' | 'offline'>('online');
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check network status periodically
  useEffect(() => {
    const checkNetwork = async () => {
      setNetworkStatus('checking');
      const isOnline = await NetworkAwareFileProcessor.checkNetworkConnection();
      setNetworkStatus(isOnline ? 'online' : 'offline');
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Update uploadedImage and showCropper when initialImage changes
  useEffect(() => {
    if (initialImage) {
      setUploadedImage(initialImage);
      setShowCropper(true);
    }
  }, [initialImage]);

  const handleFileSelect = async (file: File) => {
    console.log(`📁 File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    setRetryCount(0);
    
    try {
      setIsUploading(true);
      setValidationResult(null);

      // Enhanced validation with suggestions
      const validation = await EnhancedFileValidator.validateWithEnhancements(file);
      setValidationResult(validation);

      if (!validation.isValid) {
        console.error('❌ File validation failed:', validation.error);
        
        // Show appropriate error message with suggestion
        toast({
          title: "Upload Failed",
          description: validation.error + (validation.suggestedAction ? ` Try to ${validation.suggestedAction.replace('_', ' ')}.` : ''),
          variant: "destructive"
        });
        return;
      }

      // Show warnings if any
      if (validation.warnings && validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          toast({
            title: "Upload Warning",
            description: warning,
            variant: "default"
          });
        });
      }

      // Process file with network resilience
      await NetworkAwareFileProcessor.processWithRetry(async () => {
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage(imageUrl);
        setShowCropper(true);
        
        console.log('✅ Photo uploaded successfully:', imageUrl);
        
        // Show success message with file info
        toast({
          title: "Upload Successful",
          description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) uploaded successfully.`,
          variant: "default"
        });
      }, `File upload for ${file.name}`);

    } catch (error) {
      console.error('❌ Error uploading file:', error);
      setRetryCount(prev => prev + 1);
      
      toast({
        title: "Upload Error",
        description: networkStatus === 'offline' 
          ? "Check your internet connection and try again."
          : `Upload failed${retryCount > 0 ? ` (attempt ${retryCount + 1})` : ''}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = (croppedImage: string, aspectRatio: number) => {
    console.log('✂️ Crop completed:', croppedImage);
    onImageUpload(croppedImage, uploadedImage || undefined);
    setShowCropper(false);
  };

  const handleRetry = () => {
    if (fileInputRef.current?.files?.[0]) {
      handleFileSelect(fileInputRef.current.files[0]);
    } else {
      fileInputRef.current?.click();
    }
  };

  const getSuggestedActionIcon = (action?: string) => {
    switch (action) {
      case 'compress': return <Zap className="w-4 h-4" />;
      case 'convert': return <ImageIcon className="w-4 h-4" />;
      case 'retry': return <Upload className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSuggestedActionText = (action?: string) => {
    switch (action) {
      case 'compress': return 'Compress your image';
      case 'convert': return 'Convert to JPEG/PNG';
      case 'retry': return 'Try uploading again';
      case 'contact_support': return 'Contact support';
      default: return 'Try a different file';
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

  // Show cropper if image is uploaded
  if (showCropper && uploadedImage) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <PhotoCropper
            imageUrl={uploadedImage}
            onCropComplete={handleCropComplete}
            onOrientationChange={() => {}}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-8">
        {/* Network Status Indicator */}
        {networkStatus === 'offline' && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <Wifi className="h-4 w-4" />
            <AlertDescription>
              Connection issue detected. Check your internet and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Result Display */}
        {validationResult && !validationResult.isValid && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <div>{validationResult.error}</div>
              {validationResult.suggestedAction && (
                <div className="flex items-center gap-2 mt-2">
                  {getSuggestedActionIcon(validationResult.suggestedAction)}
                  <span className="text-sm font-medium">
                    Suggestion: {getSuggestedActionText(validationResult.suggestedAction)}
                  </span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
            ${isDragOver 
              ? 'border-purple-400 bg-purple-50' 
              : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50/50'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
            ${networkStatus === 'offline' ? 'opacity-75' : ''}
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
                ) : networkStatus === 'checking' ? (
                  <Clock className="w-12 h-12 text-purple-600 animate-pulse" />
                ) : (
                  <Upload className="w-12 h-12 text-purple-600" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {isUploading ? 'Processing...' : 
                 networkStatus === 'offline' ? 'Connection Issue' :
                 'Start with Your Photo'}
              </h3>
              <p className="text-gray-600">
                {networkStatus === 'offline' 
                  ? 'Check your internet connection and try again'
                  : 'Upload a high-quality image to transform into art'
                }
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
              {networkStatus === 'online' && (
                <Badge variant="outline" className="text-green-600 border-green-300">
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              )}
            </div>

            {/* Retry option for failed uploads */}
            {validationResult && !validationResult.isValid && retryCount > 0 && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Button
            onClick={handleClick}
            disabled={isUploading || networkStatus === 'offline'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            {isUploading ? 'Processing...' : 
             networkStatus === 'offline' ? 'Connection Required' :
             'Choose File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadEnhanced;
