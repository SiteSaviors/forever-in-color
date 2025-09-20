
import { useEffect } from 'react';

interface UseStyleCardEffectsProps {
  previewUrl: string | null;
  preGeneratedPreview?: string;
  isPermanentlyGenerated: boolean;
  setIsPermanentlyGenerated: (value: boolean) => void;
  setLocalIsLoading: (value: boolean) => void;
  styleName: string;
}

export const useStyleCardEffects = ({
  previewUrl,
  preGeneratedPreview,
  isPermanentlyGenerated,
  setIsPermanentlyGenerated,
  setLocalIsLoading,
  styleName
}: UseStyleCardEffectsProps) => {
  // Track permanent generation state - once generated, never allow regeneration
  useEffect(() => {
    if (previewUrl && !isPermanentlyGenerated) {
      console.log(`🔒 StyleCard: Permanently locking ${styleName} - will never regenerate again`);
      setIsPermanentlyGenerated(true);
      setLocalIsLoading(false);
    }
  }, [previewUrl, isPermanentlyGenerated, styleName, setIsPermanentlyGenerated, setLocalIsLoading]);

  // Initialize permanent state if pre-generated preview exists
  useEffect(() => {
    if (preGeneratedPreview && !isPermanentlyGenerated) {
      console.log(`🔒 StyleCard: ${styleName} has pre-generated preview - marking as permanently generated`);
      setIsPermanentlyGenerated(true);
    }
  }, [preGeneratedPreview, isPermanentlyGenerated, styleName, setIsPermanentlyGenerated]);

  // Stop all loading states immediately when permanently generated
  useEffect(() => {
    if (isPermanentlyGenerated) {
      console.log(`🛑 StyleCard: ${styleName} is permanently generated, stopping all loading states`);
      setLocalIsLoading(false);
    }
  }, [isPermanentlyGenerated, styleName, setLocalIsLoading]);
};
