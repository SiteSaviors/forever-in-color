
import { UseStepOneExperience, ImageType } from "../progress/useStepOneExperience";

export const useEnhancedHandlers = (
  handleImageUpload: (imageUrl: string, originalImageUrl?: string, orientation?: string) => void,
  handleStyleSelect: (styleId: number, styleName: string) => void,
  experience: UseStepOneExperience
) => {
  // Enhanced image upload handler with AI analysis
  const handleEnhancedImageUpload = (imageUrl: string, originalImageUrl?: string, orientation?: string) => {
    experience.setSubStep('analyzing');
    experience.startAIAnalysis();

    // Simulate AI analysis with realistic timing
    setTimeout(() => {
      const imageType: ImageType = imageUrl.includes('portrait') ? 'portrait' :
                      imageUrl.includes('landscape') ? 'landscape' : 'square';

      experience.completeAIAnalysis(imageType);

      // AI analysis complete
    }, 3000);

    handleImageUpload(imageUrl, originalImageUrl, orientation);
  };

  // Enhanced style selection with engagement tracking
  const handleEnhancedStyleSelect = (styleId: number, styleName: string) => {
    experience.markInteraction();
    handleStyleSelect(styleId, styleName);
  };

  return {
    handleEnhancedImageUpload,
    handleEnhancedStyleSelect
  };
};
