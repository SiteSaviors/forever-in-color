
import { useCallback } from 'react';
import { generateStylePreview } from '@/utils/stylePreviewApi';
import { addWatermarkToImage } from '@/utils/watermarkUtils';
import { getAspectRatio } from '../orientation/utils';
import { useAspectRatioValidator } from '../orientation/hooks/useAspectRatioValidator';

interface UseStylePreviewLogicProps {
  croppedImage: string | null;
  selectedOrientation: string;
  dispatch: React.Dispatch<any>;
}

export const useStylePreviewLogic = ({
  croppedImage,
  selectedOrientation,
  dispatch
}: UseStylePreviewLogicProps) => {
  const { validateWithRecovery, autoCorrect } = useAspectRatioValidator();

  // Manual generation function with enhanced validation
  const generatePreview = useCallback(async (styleId: number, styleName: string) => {
    if (!croppedImage) {
      return;
    }

    if (styleId === 1) {
      return;
    }

    try {
      dispatch({ type: 'START_GENERATION', styleId });
      
      // ENHANCED: Auto-correct orientation and get aspect ratio
      const correctedOrientation = autoCorrect(selectedOrientation);
      const aspectRatio = getAspectRatio(correctedOrientation);
      
      // ENHANCED: Validate with recovery and correction
      const validation = validateWithRecovery(correctedOrientation, aspectRatio);
      if (!validation.isValid && !validation.correctedValue) {
        const errorMsg = `Aspect ratio validation failed: ${validation.error}`;
        dispatch({ 
          type: 'GENERATION_ERROR', 
          styleId, 
          error: errorMsg 
        });
        return;
      }

      // Use corrected value if available
      const finalAspectRatio = validation.correctedValue || aspectRatio;
      
      const tempPhotoId = `temp_${Date.now()}_${styleId}`;
      
      // ENHANCED: Generate with validated and potentially corrected aspect ratio
      const previewUrl = await generateStylePreview(
        croppedImage, 
        styleName, 
        tempPhotoId, 
        finalAspectRatio // This is now validated and potentially corrected
      );

      if (previewUrl) {
        try {
          const watermarkedUrl = await addWatermarkToImage(previewUrl);
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: watermarkedUrl 
          });
        } catch (watermarkError) {
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            styleId, 
            url: previewUrl 
          });
        }
      }
    } catch (error) {
      dispatch({ 
        type: 'GENERATION_ERROR', 
        styleId, 
        error: error.message || 'Failed to generate preview'
      });
    }
  }, [croppedImage, selectedOrientation, dispatch, validateWithRecovery, autoCorrect]);

  return { generatePreview };
};
