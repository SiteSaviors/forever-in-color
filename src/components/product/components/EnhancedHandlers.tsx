
import { useProgressOrchestrator } from "../progress/ProgressOrchestrator";

export const useEnhancedHandlers = (
  handleImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void,
  handleStyleSelect: (styleId: number, styleName: string) => void
) => {
  const { dispatch, startAIAnalysis, completeAIAnalysis } = useProgressOrchestrator();

  // Enhanced image upload handler with AI analysis
  const handleEnhancedImageUpload = (imageUrl: string, originalImageUrl?: string, orientation?: string) => {
    dispatch({ type: 'SET_SUB_STEP', payload: 'analyzing' });
    startAIAnalysis("Analyzing your photo composition and lighting...");
    
    dispatch({ 
      type: 'ADD_PERSONALIZED_MESSAGE', 
      payload: "AI is analyzing your photo to find the perfect artistic matches..."
    });

    // Simulate AI analysis with realistic timing
    setTimeout(() => {
      const imageType = imageUrl.includes('portrait') ? 'portrait' : 
                      imageUrl.includes('landscape') ? 'landscape' : 'square';
      const recommendedStyles = imageType === 'portrait' ? [1, 3, 5] : [2, 4, 6];
      
      completeAIAnalysis(imageType, recommendedStyles);
      
      // AI analysis complete
    }, 3000);

    handleImageUpload(imageUrl, originalImageUrl, orientation);
  };

  // Enhanced style selection with confidence scoring
  const handleEnhancedStyleSelect = (styleId: number, styleName: string) => {
    dispatch({ 
      type: 'ADD_PERSONALIZED_MESSAGE', 
      payload: `Excellent choice! ${styleName} is perfect for your photo composition.`
    });

    handleStyleSelect(styleId, styleName);
  };

  return {
    handleEnhancedImageUpload,
    handleEnhancedStyleSelect
  };
};
