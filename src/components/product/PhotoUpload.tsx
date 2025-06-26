import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Image as ImageIcon, Sparkles, CheckCircle2 } from "lucide-react";
import { validateImageFile } from "@/utils/fileValidation";
import PhotoCropper from "./PhotoCropper";
import AutoCropPreview from "./components/AutoCropPreview";
import UnifiedFlowProgress from "./components/UnifiedFlowProgress";
import { detectOrientationFromImage } from "./utils/orientationDetection";

interface PhotoUploadProps {
  onImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void;
  initialImage?: string | null;
}

const PhotoUpload = ({ onImageUpload, initialImage }: PhotoUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialImage || null);
  const [showCropper, setShowCropper] = useState(false);
  const [showAutoCropPreview, setShowAutoCropPreview] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [recommendedOrientation, setRecommendedOrientation] = useState<string>("");
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [cropAccepted, setCropAccepted] = useState(false);
  const [currentFlowStage, setCurrentFlowStage] = useState<'upload' | 'analyzing' | 'crop-preview' | 'orientation' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update uploadedImage and flow when initialImage changes
  useEffect(() => {
    if (initialImage) {
      setUploadedImage(initialImage);
      setCurrentFlowStage('analyzing');
      handleImageAnalysis(initialImage);
    }
  }, [initialImage]);

  const handleImageAnalysis = async (imageUrl: string) => {
    setCurrentFlowStage('analyzing');
    
    // Detect recommended orientation
    try {
      const orientation = await detectOrientationFromImage(imageUrl);
      setRecommendedOrientation(orientation);
      
      // Simulate AI analysis timing
      setTimeout(() => {
        setAnalysisComplete(true);
        setCurrentFlowStage('crop-preview');
        setShowAutoCropPreview(true);
      }, 1500);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setRecommendedOrientation('square');
      setAnalysisComplete(true);
      setCurrentFlowStage('crop-preview');
      setShowAutoCropPreview(true);
    }
  };

  const simulateProcessingStages = () => {
    const stages = [
      { message: "Uploading your photo...", progress: 20 },
      { message: "Analyzing composition...", progress: 50 },
      { message: "Detecting optimal crop...", progress: 80 },
      { message: "Preparing smart suggestions...", progress: 95 }
    ];

    stages.forEach((stage, index) => {
      setTimeout(() => {
        setProcessingStage(stage.message);
        setUploadProgress(stage.progress);
      }, (index + 1) * 400);
    });
  };

  const handleFileSelect = async (file: File) => {
    const validationResult = await validateImageFile(file);
    if (!validationResult.isValid) {
      console.error('File validation failed:', validationResult.error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setCurrentFlowStage('analyzing');
    
    simulateProcessingStages();

    try {
      const imageUrl = URL.createObjectURL(file);
      
      setTimeout(() => {
        setUploadedImage(imageUrl);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          setProcessingStage("");
          handleImageAnalysis(imageUrl);
        }, 800);
      }, 2000);

      console.log('Photo uploaded, starting AI analysis:', imageUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setProcessingStage("");
      setCurrentFlowStage('upload');
    }
  };

  const handleAcceptAutoCrop = () => {
    setCropAccepted(true);
    setCurrentFlowStage('complete');
    setShowAutoCropPreview(false);
    
    // Auto-apply the recommended settings and complete
    if (uploadedImage) {
      onImageUpload(uploadedImage, uploadedImage, recommendedOrientation);
    }
  };

  const handleCustomizeCrop = () => {
    setShowAutoCropPreview(false);
    setShowCropper(true);
    setCurrentFlowStage('orientation');
  };

  const handleCropComplete = (croppedImage: string, aspectRatio: number, orientation: string) => {
    console.log('Custom crop completed:', { croppedImage, aspectRatio, orientation });
    setCropAccepted(true);
    setCurrentFlowStage('complete');
    onImageUpload(croppedImage, uploadedImage || undefined, orientation);
    setShowCropper(false);
  };

  const handleChangePhoto = () => {
    // Reset all states
    setUploadedImage(null);
    setShowCropper(false);
    setShowAutoCropPreview(false);
    setAnalysisComplete(false);
    setCropAccepted(false);
    setCurrentFlowStage('upload');
    setRecommendedOrientation("");
    fileInputRef.current?.click();
  };

  // Show auto-crop preview after analysis
  if (showAutoCropPreview && uploadedImage) {
    return (
      <div className="space-y-6">
        <UnifiedFlowProgress
          currentStage={currentFlowStage}
          hasImage={!!uploadedImage}
          analysisComplete={analysisComplete}
          cropAccepted={cropAccepted}
          orientationSelected={false}
        />
        
        <AutoCropPreview
          imageUrl={uploadedImage}
          onAcceptCrop={handleAcceptAutoCrop}
          onCustomizeCrop={handleCustomizeCrop}
          recommendedOrientation={recommendedOrientation}
        />
      </div>
    );
  }

  // Show custom cropper if user wants to adjust
  if (showCropper && uploadedImage) {
    return (
      <div className="space-y-6">
        <UnifiedFlowProgress
          currentStage={currentFlowStage}
          hasImage={!!uploadedImage}
          analysisComplete={analysisComplete}
          cropAccepted={cropAccepted}
          orientationSelected={false}
        />
        
        <Card className="w-full overflow-hidden">
          <CardContent className="p-0">
            <PhotoCropper
              imageUrl={uploadedImage}
              onCropComplete={handleCropComplete}
              onChangePhoto={handleChangePhoto}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show progress if we have an image */}
      {uploadedImage && (
        <UnifiedFlowProgress
          currentStage={currentFlowStage}
          hasImage={!!uploadedImage}
          analysisComplete={analysisComplete}
          cropAccepted={cropAccepted}
          orientationSelected={false}
        />
      )}

      <Card className="w-full overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-0">
          <div className="relative">
            {/* Premium Background Pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), 
                                 radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                                 radial-gradient(circle at 40% 80%, rgba(255, 204, 112, 0.1) 0%, transparent 50%)`
              }} />
            </div>

            <div className="relative p-8 lg:p-12">
              <div
                className={`
                  relative border-2 border-dashed rounded-2xl p-8 lg:p-16 text-center transition-all duration-500 cursor-pointer group
                  ${isDragOver 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 scale-[1.02] shadow-xl' 
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 hover:shadow-lg'
                  }
                  ${isUploading ? 'pointer-events-none' : ''}
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
                
                <div className="space-y-8">
                  {/* Icon Section with Animation */}
                  <div className="flex justify-center">
                    <div className={`
                      relative p-6 rounded-full transition-all duration-500
                      ${isDragOver 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-2xl' 
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 group-hover:scale-105 group-hover:shadow-xl'
                      }
                    `}>
                      {isUploading ? (
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-white animate-pulse" />
                        </div>
                      ) : (
                        <Upload className={`w-16 h-16 transition-colors duration-300 ${
                          isDragOver ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'
                        }`} />
                      )}
                      
                      {/* Floating particles effect */}
                      {isDragOver && (
                        <>
                          <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce" />
                          <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
                          <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-300" />
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                        {isUploading ? (
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {processingStage || "Processing..."}
                          </span>
                        ) : isDragOver ? (
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Drop to Create Magic ✨
                          </span>
                        ) : (
                          "Transform Your Photo Into Art"
                        )}
                      </h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                        {isUploading 
                          ? "AI is analyzing your photo for the perfect composition and canvas format"
                          : "Upload your favorite photo and our AI will instantly find the perfect crop and canvas orientation"
                        }
                      </p>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="max-w-xs mx-auto space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{uploadProgress}% complete</p>
                      </div>
                    )}
                    
                    {/* Enhanced Features */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-500" />
                        <span>JPG, PNG, WebP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-purple-500" />
                        <span>Up to 10MB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <span>Auto-Crop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>AI Enhanced</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium glow effect */}
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500
                  ${isDragOver ? 'opacity-100' : 'group-hover:opacity-50'}
                `}>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl" />
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="mt-8 text-center">
                <Button
                  onClick={handleClick}
                  disabled={isUploading}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                >
                  {isUploading ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Choose Your Photo
                    </>
                  )}
                </Button>
                
                {!isUploading && (
                  <p className="mt-3 text-sm text-gray-500">
                    or drag and drop your image above
                  </p>
                )}
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex items-center justify-center gap-8 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>Secure Upload</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>AI Powered</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span>100% Private</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoUpload;
