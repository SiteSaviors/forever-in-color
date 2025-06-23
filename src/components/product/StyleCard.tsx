
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useStylePreview } from "./hooks/useStylePreview";
import Lightbox from "@/components/ui/lightbox";
import StyleCardImage from "./components/StyleCardImage";
import StyleCardInfo from "./components/StyleCardInfo";

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

      {/* Lightbox */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={previewUrl || croppedImage || ''}
        imageAlt={`${style.name} preview`}
        title={style.name}
      />
    </>
  );
};

export default StyleCard;
