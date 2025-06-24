
import { useStylePreview } from "./hooks/useStylePreview";
import StyleCardImage from "./components/StyleCardImage";
import StyleCardInfo from "./components/StyleCardInfo";
import StyleCardContainer from "./components/StyleCardContainer";
import StyleCardActions from "./components/StyleCardActions";
import StyleCardLightboxes from "./components/StyleCardLightboxes";

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
  shouldBlur?: boolean;
  isGenerating?: boolean;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
  onGenerateStyle?: () => void;
}

const StyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  isPopular,
  selectedOrientation = "square",
  showContinueButton = true,
  preGeneratedPreview,
  shouldBlur = false,
  isGenerating = false,
  onStyleClick,
  onContinue,
  onGenerateStyle
}: StyleCardProps) => {
  const { 
    isLoading, 
    previewUrl, 
    hasGeneratedPreview, 
    handleClick,
    isStyleGenerated,
    generatePreview
  } = useStylePreview({
    style,
    croppedImage,
    isPopular,
    selectedOrientation,
    preGeneratedPreview,
    onStyleClick
  });

  const isSelected = selectedStyle === style.id;
  const showLoadingState = isLoading || isGenerating;
  
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
    hasPreGeneratedPreview: !!preGeneratedPreview,
    shouldBlur,
    isGenerating
  });

  // Handle generate style button click
  const handleGenerateStyle = async () => {
    console.log(`StyleCard handleGenerateStyle called for ${style.name}`);
    
    if (onGenerateStyle) {
      // Call the parent's generate handler first
      onGenerateStyle();
    }
    
    // Also trigger the preview generation from the hook
    if (generatePreview) {
      await generatePreview();
    }
  };

  // Get action handlers
  const actions = StyleCardActions({
    style,
    onStyleClick,
    onContinue
  });

  return (
    <>
      <StyleCardContainer
        isSelected={isSelected}
        styleId={style.id}
        onClick={handleClick}
        shouldBlur={shouldBlur}
      >
        {/* Hero Image Section */}
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
            shouldBlur={shouldBlur}
            isGenerating={isGenerating}
            onExpandClick={() => {}} // Will be handled by lightboxes
            onCanvasPreviewClick={() => {}} // Will be handled by lightboxes
            onGenerateStyle={handleGenerateStyle}
          />
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col">
          <StyleCardInfo
            style={style}
            hasGeneratedPreview={finalHasGeneratedPreview}
            isPopular={isPopular}
            isSelected={isSelected}
            showGeneratedBadge={showGeneratedBadge}
            showContinueInCard={showContinueInCard}
            shouldBlur={shouldBlur}
            onContinueClick={actions.handleContinueClick}
            onGenerateClick={actions.handleGenerateClick}
          />
        </div>
      </StyleCardContainer>

      <StyleCardLightboxes
        style={style}
        finalPreviewUrl={finalPreviewUrl}
        croppedImage={croppedImage}
        selectedOrientation={selectedOrientation}
      />
    </>
  );
};

export default StyleCard;
