
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
  selectedOrientation?: string;
  showContinueButton?: boolean;
  preGeneratedPreview?: string;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

const StyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  isPopular,
  selectedOrientation = "square",
  showContinueButton = true,
  preGeneratedPreview,
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
    selectedOrientation,
    preGeneratedPreview,
    onStyleClick
  });

  const isSelected = selectedStyle === style.id;
  const showLoadingState = isLoading;
  
  // Use pre-generated preview if available, otherwise use hook-generated preview
  const finalPreviewUrl = preGeneratedPreview || previewUrl;
  const finalHasGeneratedPreview = !!preGeneratedPreview || hasGeneratedPreview;
  const finalIsStyleGenerated = !!preGeneratedPreview || isStyleGenerated;
  
  // Only show generated badge if we actually have a preview AND it's not the original image style
  const showGeneratedBadge = finalIsStyleGenerated && style.id !== 1;
  const imageToShow = finalPreviewUrl || croppedImage || style.image;
  const showContinueInCard = showContinueButton && isSelected && !!(finalPreviewUrl || croppedImage);
  const hasPreviewOrCropped = !!(finalPreviewUrl || croppedImage);

  // Convert orientation to aspect ratio for display
  const getCropAspectRatio = () => {
    switch (selectedOrientation) {
      case 'vertical':
        return 3/4;
      case 'horizontal':
        return 4/3;
      case 'square':
      default:
        return 1;
    }
  };

  const cropAspectRatio = getCropAspectRatio();

  console.log(`StyleCard ${style.name} (ID: ${style.id}):`, {
    showContinueButton,
    isSelected,
    previewUrl: !!finalPreviewUrl,
    croppedImage: !!croppedImage,
    showContinueInCard,
    hasGeneratedPreview: finalHasGeneratedPreview,
    isStyleGenerated: finalIsStyleGenerated,
    showGeneratedBadge,
    selectedOrientation,
    cropAspectRatio,
    hasPreGeneratedPreview: !!preGeneratedPreview
  });

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (finalPreviewUrl || croppedImage) {
      setIsLightboxOpen(true);
    }
  };

  const handleCanvasPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (finalPreviewUrl || croppedImage) {
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
      {/* Canvas texture background wrapper */}
      <div className="relative p-2">
        {/* Subtle canvas texture background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl opacity-60" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
               backgroundSize: '20px 20px'
             }}>
        </div>
        
        {/* Premium floating card with consistent height */}
        <Card 
          className={`group cursor-pointer transition-all duration-300 ease-out relative z-10 bg-white/95 backdrop-blur-sm border-0 
            shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
            hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)] 
            hover:scale-[1.02] 
            hover:-translate-y-1
            h-full flex flex-col
            ${isSelected ? 'ring-2 ring-purple-500 shadow-[0_20px_60px_rgb(147,51,234,0.25)]' : ''}
          `}
          onClick={handleClick}
        >
          <CardContent className="p-0 overflow-hidden rounded-xl h-full flex flex-col">
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

            <div className="flex-1">
              <StyleCardInfo
                style={style}
                hasGeneratedPreview={finalHasGeneratedPreview}
                isPopular={isPopular}
                isSelected={isSelected}
                showGeneratedBadge={showGeneratedBadge}
                showContinueInCard={showContinueInCard}
                onContinueClick={handleContinueClick}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regular Image Lightbox */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={finalPreviewUrl || croppedImage || ''}
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
            imageUrl={finalPreviewUrl || croppedImage || ''}
            orientation={selectedOrientation}
            styleName={style.name}
          />
        }
      />
    </>
  );
};

export default StyleCard;
