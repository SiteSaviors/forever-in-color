
import StyleCardImage from "./components/StyleCardImage";
import StyleCardInfo from "./components/StyleCardInfo";
import StyleCardContainer from "./components/StyleCardContainer";
import StyleCardActions from "./components/StyleCardActions";
import StyleCardLightboxes from "./components/StyleCardLightboxes";
import { useStylePreview } from "./contexts/StylePreviewContext";

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
  const { 
    generatePreview, 
    isLoading, 
    hasPreview, 
    getPreviewUrl 
  } = useStylePreview();

  const isSelected = selectedStyle === style.id;
  const isGenerating = isLoading(style.id);
  const hasGeneratedPreview = hasPreview(style.id);
  const previewUrl = getPreviewUrl(style.id);
  
  // Determine what image to show
  const imageToShow = previewUrl || croppedImage || style.image;
  
  // Show continue button logic
  const showContinueInCard = showContinueButton && isSelected && !!(previewUrl || croppedImage);
  const hasPreviewOrCropped = !!(previewUrl || croppedImage);
  
  // Show generated badge for styles that have previews (but not Original Image)
  const showGeneratedBadge = hasGeneratedPreview && style.id !== 1;

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
    hasPreview: !!previewUrl,
    croppedImage: !!croppedImage
  });

  // Handle style click - ALWAYS handle the click, even when blurred
  const handleClick = () => {
    console.log(`🎯 Style clicked: ${style.name} (ID: ${style.id})`);
    onStyleClick(style);
    
    // Auto-generate if conditions are met (and not already generating)
    if (croppedImage && !hasGeneratedPreview && !isGenerating && style.id !== 1) {
      console.log(`🚀 Auto-generating preview for clicked style: ${style.name}`);
      generatePreview(style.id, style.name);
    }
  };

  // Handle manual generation button click (for blurred cards)
  const handleGenerateStyle = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when clicking generate button
    }
    console.log(`🎨 Manual generate button clicked for ${style.name} (ID: ${style.id})`);
    
    // First select the style
    onStyleClick(style);
    
    // Then generate the preview
    await generatePreview(style.id, style.name);
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
            showLoadingState={isGenerating}
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
            hasGeneratedPreview={hasGeneratedPreview}
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
        finalPreviewUrl={previewUrl}
        croppedImage={croppedImage}
        selectedOrientation={selectedOrientation}
      />
    </>
  );
};

export default StyleCard;
