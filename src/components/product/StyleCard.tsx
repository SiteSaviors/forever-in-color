
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

  // Enhanced aspect ratio calculation for hero treatment
  const getCropAspectRatio = () => {
    switch (selectedOrientation) {
      case 'vertical':
        return 3/4; // Better for mobile viewing
      case 'horizontal':
        return 4/3; // Classic landscape
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

  // Get style-specific selection colors for the main card border
  const getCardSelectionColors = () => {
    const colorMap: { [key: number]: string } = {
      1: "ring-gray-500",
      2: "ring-amber-500", 
      4: "ring-blue-500",
      5: "ring-pink-500",
      6: "ring-purple-500",
      7: "ring-cyan-500",
      8: "ring-slate-500",
      9: "ring-rose-500",
      10: "ring-emerald-500",
      11: "ring-violet-500",
      13: "ring-indigo-500",
      15: "ring-yellow-500",
    };
    
    return colorMap[style.id] || colorMap[1];
  };

  const cardSelectionRing = getCardSelectionColors();

  return (
    <>
      {/* Enhanced canvas texture background wrapper */}
      <div className="relative p-2">
        {/* More sophisticated canvas texture background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-xl opacity-70" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.12) 1px, transparent 0)`,
               backgroundSize: '18px 18px'
             }}>
        </div>
        
        {/* Premium floating card with dramatic selection feedback */}
        <Card 
          className={`group cursor-pointer transition-all duration-500 ease-out relative z-10 bg-white/98 backdrop-blur-sm border-0 
            shadow-[0_10px_40px_rgb(0,0,0,0.12)] 
            hover:shadow-[0_25px_70px_rgb(0,0,0,0.15)] 
            hover:scale-[1.03] 
            hover:-translate-y-2
            h-full flex flex-col
            ${isSelected ? 
              `ring-4 ${cardSelectionRing} shadow-[0_25px_70px_rgba(0,0,0,0.2)] scale-[1.02] -translate-y-1 animate-glow-pulse` : 
              ''
            }
          `}
          onClick={handleClick}
        >
          <CardContent className="p-0 overflow-hidden rounded-xl h-full flex flex-col">
            {/* Hero Image Section - Now more prominent */}
            <div className="flex-shrink-0">
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
            </div>

            {/* Compact Info Section - Supports the hero image */}
            <div className="flex-1 flex flex-col">
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
