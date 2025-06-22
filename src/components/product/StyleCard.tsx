
import { useState, useEffect } from "react";
import { Check, Lock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { generateStylePreview } from "@/utils/stylePreviewApi";
import { useToast } from "@/hooks/use-toast";

interface StyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  isPopular: boolean;
  cropAspectRatio?: number;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
}

const StyleCard = ({ 
  style, 
  croppedImage, 
  selectedStyle, 
  isPopular,
  cropAspectRatio = 1,
  onStyleClick 
}: StyleCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasGeneratedPreview, setHasGeneratedPreview] = useState(false);
  const [autoGenerationAttempted, setAutoGenerationAttempted] = useState(false);
  const { toast } = useToast();

  const isSelected = selectedStyle === style.id;
  const canPreview = croppedImage && (isPopular || hasGeneratedPreview || isSelected);
  const isLocked = !croppedImage && !isPopular;

  // Auto-generate previews for popular styles when image is uploaded
  useEffect(() => {
    const shouldAutoGenerate = croppedImage && 
                              isPopular && 
                              style.id !== 1 && // Skip Original Image
                              !hasGeneratedPreview && 
                              !previewUrl &&
                              !autoGenerationAttempted &&
                              !isLoading;

    if (shouldAutoGenerate) {
      console.log(`Auto-generating preview for ${style.name} (ID: ${style.id})`);
      setAutoGenerationAttempted(true);
      generatePreviewSilently();
    }
  }, [croppedImage, isPopular, style.id, hasGeneratedPreview, previewUrl, autoGenerationAttempted, isLoading]);

  const generatePreviewSilently = async () => {
    if (!croppedImage) return;

    setIsLoading(true);
    
    try {
      console.log(`Starting silent preview generation for ${style.name}`);
      
      const response = await generateStylePreview({
        imageData: croppedImage,
        styleId: style.id,
        styleName: style.name
      });

      console.log(`Silent generation response for ${style.name}:`, response.success);

      if (response.success) {
        setPreviewUrl(response.previewUrl);
        setHasGeneratedPreview(true);
        console.log(`Preview generated successfully for ${style.name}`);
      } else {
        console.warn(`Silent preview generation failed for ${style.name}:`, response.error);
        // Don't throw error for silent generation - just log it
      }
    } catch (error) {
      console.error(`Error in silent preview generation for ${style.name}:`, error);
      // Silent failure for auto-generation
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    if (!croppedImage) return;

    // If it's a popular style or already has a preview, select immediately
    if (isPopular || hasGeneratedPreview) {
      onStyleClick(style);
      return;
    }

    // For other styles, generate preview using API
    setIsLoading(true);
    
    try {
      const response = await generateStylePreview({
        imageData: croppedImage,
        styleId: style.id,
        styleName: style.name
      });

      if (response.success) {
        setPreviewUrl(response.previewUrl);
        setHasGeneratedPreview(true);
        onStyleClick(style);
        
        toast({
          title: "Style Preview Generated!",
          description: `Your photo has been transformed with ${style.name} style.`,
        });
      } else {
        throw new Error(response.error || 'Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating style preview:', error);
      toast({
        title: "Preview Generation Failed",
        description: "Please try again or select a different style.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which image to show in preview
  const getPreviewImage = () => {
    if (canPreview) {
      // For popular styles or generated previews, show the user's image
      if (isPopular || hasGeneratedPreview) {
        return previewUrl || croppedImage;
      }
    }
    // Default to style example image
    return style.image;
  };

  const showGeneratedIndicator = hasGeneratedPreview && !isSelected;

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
      } ${showGeneratedIndicator ? 'ring-2 ring-green-500' : ''} ${
        isLocked ? 'opacity-75' : ''
      } ${isLoading ? 'pointer-events-none' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 p-2">
            <div className="w-full h-full bg-white rounded-sm shadow-inner relative overflow-hidden">
              {canPreview ? (
                <div className="absolute inset-0">
                  <img 
                    src={getPreviewImage()!} 
                    alt="Style preview" 
                    className="w-full h-full object-cover"
                  />
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

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                  <div className="text-white text-center space-y-3 px-4">
                    <div className="relative">
                      <Sparkles className="w-8 h-8 mx-auto animate-pulse text-purple-400" />
                      <div className="absolute inset-0 animate-spin">
                        <div className="w-8 h-8 border-2 border-transparent border-t-white/50 rounded-full mx-auto"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Creating Your Style...</p>
                      <p className="text-xs text-gray-300">This may take 10-15 seconds</p>
                    </div>
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {isPopular && !isLoading && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold text-xs">
                Popular
              </Badge>
            </div>
          )}
          
          {/* Generated Preview Indicator */}
          {showGeneratedIndicator && (
            <div className="absolute bottom-2 right-2 z-10">
              <div className="bg-green-600 text-white rounded-full p-1.5 shadow-lg">
                <Check className="w-3 h-3" />
              </div>
            </div>
          )}
          
          {/* Selected Indicator */}
          {isSelected && !isLoading && (
            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center z-10">
              <div className="bg-purple-600 text-white rounded-full p-2">
                <Check className="w-4 h-4" />
              </div>
            </div>
          )}
        </AspectRatio>

        <div className="p-3 space-y-2">
          <h5 className="font-semibold text-gray-900 text-sm">{style.name}</h5>
          <p className="text-xs text-gray-600 leading-relaxed">{style.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StyleCard;
