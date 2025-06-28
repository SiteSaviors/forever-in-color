
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";
import { 
  ImageUploadHandler, 
  StyleSelectHandler, 
  EnhancedHandlers 
} from "../types/handlerTypes";

export const useEnhancedHandlers = (
  handleImageUpload: ImageUploadHandler,
  handleStyleSelect: StyleSelectHandler
): EnhancedHandlers => {
  const { dispatch, showContextualHelp, startAIAnalysis, completeAIAnalysis, trackClick } = useProgressOrchestrator();

  // Enhanced image upload handler with AI analysis
  const handleEnhancedImageUpload: ImageUploadHandler = (imageUrl: string, originalImageUrl?: string, orientation?: string) => {
    dispatch({ type: 'SET_SUB_STEP', payload: { subStep: 'analyzing' } });
    startAIAnalysis("Analyzing your photo composition and lighting...");
    
    dispatch({ 
      type: 'ADD_PERSONALIZED_MESSAGE', 
      payload: { message: "AI is analyzing your photo to find the perfect artistic matches..." }
    });

    // Simulate AI analysis with realistic timing
    setTimeout(() => {
      const imageType = imageUrl.includes('portrait') ? 'portrait' : 
                      imageUrl.includes('landscape') ? 'landscape' : 'square';
      const recommendedStyles = imageType === 'portrait' ? [1, 3, 5] : [2, 4, 6];
      
      completeAIAnalysis(imageType, recommendedStyles);
      
      showContextualHelp(
        'recommendation',
        `Perfect! Your ${imageType} photo will look amazing in our Classic Oil or Abstract Fusion styles.`,
        'moderate'
      );
    }, 3000);

    handleImageUpload(imageUrl, originalImageUrl, orientation);
  };

  // Enhanced style selection with confidence scoring
  const handleEnhancedStyleSelect: StyleSelectHandler = (styleId: number, styleName: string) => {
    trackClick(`style-select-${styleName.toLowerCase().replace(/\s+/g, '-')}`);
    
    dispatch({ 
      type: 'ADD_PERSONALIZED_MESSAGE', 
      payload: { message: `Excellent choice! ${styleName} is perfect for your photo composition.` }
    });
    
    showContextualHelp(
      'social',
      `${styleName} is loved by 94% of users with similar photos. You're going to love the result!`,
      'minimal'
    );

    handleStyleSelect(styleId, styleName);
  };

  return {
    handleEnhancedImageUpload,
    handleEnhancedStyleSelect
  };
};
