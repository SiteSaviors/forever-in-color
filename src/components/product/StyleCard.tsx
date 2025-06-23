
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useStylePreview } from "./hooks/useStylePreview";
import Lightbox from "@/components/ui/lightbox";
import StyleCardImage from "./components/StyleCardImage";
import StyleCardInfo from "./components/StyleCardInfo";
import FullCanvasMockup from "./components/FullCanvasMockup";

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
  cropAspectRatio = 1, // Default to square if not provided
  showContinueButton = false,
  onStyleClick,
  onContinue
}: StyleCardProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCanvasLightboxOpen, setIsCanvasLightboxOpen] = useState(false);
  
  const { 
    isLoading, 
    previewUrl, 
    hasGeneratedPreview, 
    handleClick,
    isStyleGenerated 
  } = useStylePreview({
    style,
    croppedImage,
    isPopular,
    onStyleClick
  });

  const isSelected = selectedStyle === style.id;
  const showLoadingState = isLoading;
  // Only show generated badge if we actually have a preview AND it's not the original image style
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
    cropAspectRatio
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
        imageSrc="" // We'll use custom content instead
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
