
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useProgressiveStylePreview } from "./hooks/useProgressiveStylePreview";
import Lightbox from "@/components/ui/lightbox";
import StyleCardImage from "./components/StyleCardImage";
import StyleCardInfo from "./components/StyleCardInfo";
import FullCanvasMockup from "./components/FullCanvasMockup";
import BlurredPreview from "./components/BlurredPreview";

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
  showContinueButton?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

const StyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  isPopular,
  cropAspectRatio = 1,
  showContinueButton = true,
  onStyleClick,
  onContinue
}: StyleCardProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCanvasLightboxOpen, setIsCanvasLightboxOpen] = useState(false);
  
  const { 
    isLoading, 
    previewUrl,
    lowQualityPreview,
    highQualityPreview,
    hasGeneratedPreview, 
    handleClick,
    isStyleGenerated,
    currentQuality,
    isUpgrading
  } = useProgressiveStylePreview({
    style,
    croppedImage,
    isPopular,
    onStyleClick
  });

  const isSelected = selectedStyle === style.id;
  const showLoadingState = isLoading;
  const showGeneratedBadge = isStyleGenerated && style.id !== 1;
  const imageToShow = previewUrl || croppedImage || style.image;
  const showContinueInCard = showContinueButton && isSelected && !!(previewUrl || croppedImage);
  const hasPreviewOrCropped = !!(previewUrl || croppedImage);

  // Determine orientation from crop aspect ratio
  const getOrientation = () => {
    if (cropAspectRatio === 1) return "square";
    if (cropAspectRatio > 1) return "horizontal";
    return "vertical";
  };

  console.log(`StyleCard ${style.name} (ID: ${style.id}):`, {
    showContinueButton,
    isSelected,
    previewUrl: !!previewUrl,
    croppedImage: !!croppedImage,
    showContinueInCard,
    hasGeneratedPreview,
    isStyleGenerated,
    showGeneratedBadge,
    cropAspectRatio,
    currentQuality,
    isUpgrading
  });

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl || croppedImage) {
      setIsLightboxOpen(true);
    }
  };

  const handleCanvasPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl || croppedImage) {
      setIsCanvasLightboxOpen(true);
    }
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContinue) {
      console.log(`Continue clicked for ${style.name}`);
      onContinue();
    }
  };

  return (
    <>
      <Card 
        className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
          isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
        }`}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          {/* Use BlurredPreview for progressive loading when we have previews */}
          {previewUrl && croppedImage ? (
            <div className="relative">
              <BlurredPreview
                originalImage={croppedImage}
                isLoading={isUpgrading}
                className="aspect-square rounded-t-lg"
              />
              
              {/* Show upgrading indicator */}
              {isUpgrading && (
                <div className="absolute top-2 left-2 bg-purple-500/90 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Enhancing...
                </div>
              )}
              
              {/* Quality indicator */}
              {currentQuality === 'high' && (
                <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full">
                  HD Ready
                </div>
              )}
            </div>
          ) : (
            <StyleCardImage
              style={style}
              imageToShow={imageToShow}
              cropAspectRatio={cropAspectRatio}
              showLoadingState={showLoadingState}
              isPopular={isPopular}
              showGeneratedBadge={showGeneratedBadge}
              isSelected={isSelected}
              hasPreviewOrCropped={hasPreviewOrCropped}
              onExpandClick={handleExpandClick}
              onCanvasPreviewClick={handleCanvasPreviewClick}
            />
          )}

          <StyleCardInfo
            style={style}
            hasGeneratedPreview={hasGeneratedPreview}
            isPopular={isPopular}
            isSelected={isSelected}
            showGeneratedBadge={showGeneratedBadge}
            showContinueInCard={showContinueInCard}
            onContinueClick={handleContinueClick}
          />
        </CardContent>
      </Card>

      {/* Regular Image Lightbox */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={previewUrl || croppedImage || ''}
        imageAlt={`${style.name} preview`}
        title={style.name}
      />

      {/* Canvas Preview Lightbox */}
      <Lightbox
        isOpen={isCanvasLightboxOpen}
        onClose={() => setIsCanvasLightboxOpen(false)}
        imageSrc=""
        imageAlt={`${style.name} canvas preview`}
        title={`${style.name} on Canvas`}
        customContent={
          <FullCanvasMockup
            imageUrl={previewUrl || croppedImage || ''}
            orientation={getOrientation()}
            styleName={style.name}
          />
        }
      />
    </>
  );
};

export default StyleCard;
