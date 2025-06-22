import { useState, useCallback } from "react";
import { Upload, Check, X, Image as ImageIcon, Sparkles, Wand2, Lock, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { artStyles } from "@/data/artStyles";
import Cropper from 'react-easy-crop';

interface PhotoUploadAndStyleSelectionProps {
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  preSelectedStyle?: {id: number, name: string} | null;
}

const PhotoUploadAndStyleSelection = ({ onComplete, preSelectedStyle }: PhotoUploadAndStyleSelectionProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(preSelectedStyle?.id || null);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [loadingStyles, setLoadingStyles] = useState<Set<number>>(new Set());
  
  // Crop states
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropAspect, setCropAspect] = useState(1); // 1 = square, 4/3 = horizontal, 3/4 = vertical
  const [finalCroppedImage, setFinalCroppedImage] = useState<string | null>(null);

  // Popular styles that will be auto-generated after upload
  const popularStyleIds = [2, 10, 7]; // Classic Oil Painting, Neon Splash, 3D Storybook
  const popularStyles = artStyles.filter(style => popularStyleIds.includes(style.id));
  const otherStyles = artStyles.filter(style => !popularStyleIds.includes(style.id));
  const displayedStyles = showAllStyles ? artStyles : popularStyles;

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
      setPreviewUrl(imageUrl);
      setUploadedFile(file);
      setIsUploading(false);
      setShowCrop(true); // Show crop interface after upload
    };
    reader.readAsDataURL(file);
  }, []);

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

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleCropSave = async () => {
    if (croppedAreaPixels && previewUrl) {
      try {
        const croppedImage = await getCroppedImg(previewUrl, croppedAreaPixels);
        setFinalCroppedImage(croppedImage);
        setShowCrop(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSkipCrop = () => {
    setFinalCroppedImage(previewUrl);
    setShowCrop(false);
  };

  const handleAutoCenterCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setFinalCroppedImage(null);
    setSelectedStyle(null);
    setLoadingStyles(new Set());
    setShowCrop(false);
  };

  const handleStyleClick = async (style: typeof artStyles[0]) => {
    if (!finalCroppedImage) return;

    // If it's a popular style, it should already be available
    if (popularStyleIds.includes(style.id)) {
      setSelectedStyle(style.id);
      return;
    }

    // For other styles, simulate loading
    setLoadingStyles(prev => new Set([...prev, style.id]));
    
    // Simulate API call delay
    setTimeout(() => {
      setLoadingStyles(prev => {
        const newSet = new Set(prev);
        newSet.delete(style.id);
        return newSet;
      });
      setSelectedStyle(style.id);
    }, 1500);
  };

  const handleComplete = () => {
    if (finalCroppedImage && selectedStyle) {
      const style = artStyles.find(s => s.id === selectedStyle);
      if (style) {
        onComplete(finalCroppedImage, selectedStyle, style.name);
      }
    }
  };

  const renderStyleCard = (style: typeof artStyles[0]) => {
    const isSelected = selectedStyle === style.id;
    const isLoading = loadingStyles.has(style.id);
    const isPopular = popularStyleIds.includes(style.id);
    const canPreview = finalCroppedImage && (isPopular || isLoading || isSelected);
    const isLocked = !finalCroppedImage && !isPopular;

    return (
      <Card 
        key={style.id}
        className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
          isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
        } ${isLocked ? 'opacity-75' : ''}`}
        onClick={() => handleStyleClick(style)}
      >
        <CardContent className="p-0">
          {/* Square Preview */}
          <AspectRatio ratio={1} className="relative overflow-hidden rounded-t-lg">
            {canPreview ? (
              <div className="absolute inset-0">
                <img 
                  src={finalCroppedImage!} 
                  alt="Style preview" 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br opacity-60 mix-blend-overlay`} 
                     style={{
                       background: style.id === 2 ? 'linear-gradient(to bottom right, #d97706, #ea580c, #dc2626)' :
                                  style.id === 10 ? 'linear-gradient(to bottom right, #a3e635, #ec4899, #a855f7)' :
                                  style.id === 7 ? 'linear-gradient(to bottom right, #a855f7, #ec4899, #ef4444)' :
                                  style.id === 4 ? 'linear-gradient(to bottom right, #93c5fd, #c4b5fd, #f9a8d4)' :
                                  style.id === 9 ? 'linear-gradient(to bottom right, #ef4444, #fbbf24, #3b82f6)' :
                                  style.id === 11 ? 'linear-gradient(to bottom right, #ec4899, #a855f7, #06b6d4)' :
                                  style.id === 8 ? 'linear-gradient(to bottom right, #6b7280, #374151, #000000)' :
                                  style.id === 15 ? 'linear-gradient(to bottom right, #f59e0b, #d97706, #ea580c)' :
                                  'linear-gradient(to bottom right, #6b7280, #374151)'
                     }} />
                
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs font-medium">Creating preview...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0">
                <img 
                  src={style.image} 
                  alt={style.name} 
                  className="w-full h-full object-cover"
                />
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-white text-center space-y-2 px-4">
                      <Lock className="w-6 h-6 mx-auto" />
                      <p className="text-xs font-medium leading-tight">Upload Your Photo to preview this style</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {isPopular && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold text-xs">
                  Popular
                </Badge>
              </div>
            )}
            
            {isSelected && !isLoading && (
              <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                <div className="bg-purple-600 text-white rounded-full p-2">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            )}
          </AspectRatio>

          {/* Style Info */}
          <div className="p-3 space-y-2">
            <h5 className="font-semibold text-gray-900 text-sm">{style.name}</h5>
            <p className="text-xs text-gray-600 leading-relaxed">{style.description}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Upload Your Photo & See It Come to Life
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {!uploadedFile ? 
            "See all our amazing art styles below, then upload your photo to watch the magic happen!" :
            showCrop ? "Perfect your photo with our cropping tool, then see it transformed!" :
            "Amazing! Now see how your photo looks in different artistic styles."
          }
        </p>
      </div>

      {/* Upload Section */}
      {!uploadedFile ? (
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
      ) : showCrop ? (
        /* Crop Interface */
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Crop className="w-5 h-5 text-purple-600" />
                Perfect Your Photo
              </h4>
              <p className="text-gray-600">
                Adjust the crop to highlight the best part of your image
              </p>
            </div>

            {/* Crop Area */}
            <div className="relative w-full h-80 bg-black rounded-xl overflow-hidden">
              <Cropper
                image={previewUrl!}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Aspect Ratio Controls */}
            <div className="flex justify-center gap-2">
              <Button
                variant={cropAspect === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCropAspect(1)}
                className="text-xs"
              >
                Square
              </Button>
              <Button
                variant={cropAspect === 4/3 ? "default" : "outline"}
                size="sm"
                onClick={() => setCropAspect(4/3)}
                className="text-xs"
              >
                Horizontal
              </Button>
              <Button
                variant={cropAspect === 3/4 ? "default" : "outline"}
                size="sm"
                onClick={() => setCropAspect(3/4)}
                className="text-xs"
              >
                Vertical
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleAutoCenterCrop}
                className="text-sm"
              >
                Auto-Center
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipCrop}
                className="text-sm text-gray-500"
              >
                Skip, I'm Good
              </Button>
              <Button
                onClick={handleCropSave}
                className="bg-purple-600 hover:bg-purple-700 text-sm"
              >
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Success */
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <AspectRatio ratio={1} className="w-24 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={finalCroppedImage!} 
                  alt="Cropped preview" 
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
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Cropped & Ready
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
              
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-4 h-4" />
                  <span className="font-medium text-sm">Photo ready! Choose your style below.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style Selection */}
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            Choose Your Art Style
          </h4>
          <p className="text-gray-600">
            {!uploadedFile ? 
              "Here are all our incredible art styles. Upload your photo above to see live previews!" :
              "Click any style to see your photo transformed. Popular styles load instantly!"
            }
          </p>
        </div>

        {/* Style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayedStyles.map(renderStyleCard)}
        </div>

        {/* Show More Styles Button */}
        {!showAllStyles && (
          <div className="text-center">
            <Button 
              variant="outline"
              onClick={() => setShowAllStyles(true)}
              className="bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              See All {otherStyles.length} More Styles
            </Button>
          </div>
        )}

        {/* Continue Button */}
        {selectedStyle && (
          <div className="text-center pt-4">
            <Button 
              onClick={handleComplete}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Continue with {artStyles.find(s => s.id === selectedStyle)?.name}
            </Button>
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Tips for Best Results</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use high-resolution photos (at least 1000x1000px)</li>
          <li>• Ensure good lighting and clear focal points</li>
          <li>• Avoid heavily filtered or edited photos</li>
          <li>• Group photos work best with 2-4 people</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUploadAndStyleSelection;
