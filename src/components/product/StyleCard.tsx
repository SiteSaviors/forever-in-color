
import StyleCardImage from "./components/StyleCardImage";
import StyleCardInfo from "./components/StyleCardInfo";
import StyleCardContainer from "./components/StyleCardContainer";
import StyleCardActions from "./components/StyleCardActions";
import StyleCardLightboxes from "./components/StyleCardLightboxes";
import { useStylePreview } from "./contexts/StylePreviewContext";
import { useState } from "react";

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
  shouldBlur?: boolean;
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
  shouldBlur = false,
  onStyleClick,
  onContinue
}: StyleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    generatePreview, 
    retryGeneration,
    isLoading, 
    hasPreview, 
    hasError,
    getPreviewUrl,
    getError
  } = useStylePreview();

  const isSelected = selectedStyle === style.id;
  const isGenerating = isLoading(style.id);
  const hasGeneratedPreview = hasPreview(style.id);
  const previewUrl = getPreviewUrl(style.id);
  const error = getError(style.id);
  const showError = hasError(style.id);
  
  // Determine what image to show
  const imageToShow = previewUrl || croppedImage || style.image;
  
  // Show continue button logic - show for Original Image OR when style has generated preview
  const showContinueInCard = style.id === 1 || hasGeneratedPreview;
  const hasPreviewOrCropped = !!(previewUrl || croppedImage);
  
  // Show generated badge for styles that have previews (but not Original Image)
  const showGeneratedBadge = hasGeneratedPreview && style.id !== 1;

  // CRITICAL FIX: Determine blur state properly
  const shouldShowBlur = shouldBlur && !hasGeneratedPreview && !isGenerating && !showError && style.id !== 1;

  // Enhanced aspect ratio calculation
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
    isSelected,
    isGenerating,
    hasGeneratedPreview,
    showGeneratedBadge,
    shouldBlur,
    shouldShowBlur,
    showError,
    hasPreview: !!previewUrl,
    croppedImage: !!croppedImage
  });

  // MAIN CARD CLICK HANDLER
  const handleClick = () => {
    console.log(`🎯 MAIN CARD CLICK ▶️ ${style.name} (ID: ${style.id}), shouldBlur: ${shouldBlur}, isGenerating: ${isGenerating}`);
    onStyleClick(style);
    
    // Auto-generate if conditions are met (and not already generating or in error state)
    if (croppedImage && !hasGeneratedPreview && !isGenerating && !showError && style.id !== 1) {
      console.log(`🚀 Auto-generating preview for clicked style: ${style.name}`);
      generatePreview(style.id, style.name);
    }
  };

  // Handle manual generation button click (for blurred cards)
  const handleGenerateStyle = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log(`🎨 MANUAL GENERATE CLICKED ▶️ ${style.name} (ID: ${style.id})`);
    
    onStyleClick(style);
    await generatePreview(style.id, style.name);
  };

  // Handle retry button click
  const handleRetry = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log(`🔄 RETRY CLICKED ▶️ ${style.name} (ID: ${style.id})`);
    await retryGeneration(style.id, style.name);
  };

  // Handle preview expansion
  const handleExpandClick = () => {
    setIsExpanded(true);
  };

  // Handle continue click - MODIFIED TO SKIP TO STEP 3
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContinue) {
      console.log(`Continue clicked for ${style.name} - skipping to Step 3`);
      onContinue();
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
        shouldBlur={shouldShowBlur}
      >
        {/* Hero Image Section - Make this prominent on mobile */}
        <div className="flex-shrink-0 relative">
          <StyleCardImage
            style={style}
            imageToShow={imageToShow}
            cropAspectRatio={cropAspectRatio}
            showLoadingState={isGenerating}
            isPopular={isPopular}
            showGeneratedBadge={showGeneratedBadge}
            isSelected={isSelected}
            hasPreviewOrCropped={hasPreviewOrCropped}
            shouldBlur={shouldShowBlur}
            isGenerating={isGenerating}
            showError={showError}
            error={error}
            selectedOrientation={selectedOrientation}
            previewUrl={previewUrl}
            hasGeneratedPreview={hasGeneratedPreview}
            onExpandClick={handleExpandClick}
            onCanvasPreviewClick={() => {}}
            onGenerateStyle={handleGenerateStyle}
            onRetry={handleRetry}
          />
        </div>

        {/* Info Section - Streamlined for mobile */}
        <div className="flex-1 flex flex-col">
          <StyleCardInfo
            style={style}
            hasGeneratedPreview={hasGeneratedPreview}
            isPopular={isPopular}
            isSelected={isSelected}
            showGeneratedBadge={showGeneratedBadge}
            showContinueInCard={showContinueInCard}
            shouldBlur={shouldShowBlur}
            showError={showError}
            onContinueClick={handleContinueClick}
            onGenerateClick={actions.handleGenerateClick}
            onRetryClick={handleRetry}
          />
        </div>
      </StyleCardContainer>

      <StyleCardLightboxes
        style={style}
        finalPreviewUrl={previewUrl}
        croppedImage={croppedImage}
        selectedOrientation={selectedOrientation}
      />
    </>
  );
};

export default StyleCard;
