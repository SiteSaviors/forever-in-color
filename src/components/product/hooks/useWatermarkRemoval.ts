
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTokenBalance } from '@/hooks/useTokenBalance';

interface WatermarkRemovalOptions {
  styleId: number;
  styleName: string;
  originalImageUrl: string;
  resolutionTier: 'standard' | 'hd' | 'ultra_hd';
}

interface DownloadResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

const RESOLUTION_COSTS = {
  standard: 3,
  hd: 4,
  ultra_hd: 5
};

export const useWatermarkRemoval = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { balance, spendTokens } = useTokenBalance();

  const removeWatermarkAndDownload = async (options: WatermarkRemovalOptions): Promise<DownloadResult> => {
    const { styleId, styleName, originalImageUrl, resolutionTier } = options;
    const tokenCost = RESOLUTION_COSTS[resolutionTier];

    if (balance < tokenCost) {
      return {
        success: false,
        error: `Insufficient tokens. Need ${tokenCost} tokens, have ${balance}.`
      };
    }

    setIsProcessing(true);

    try {
      // Check if user already purchased this exact download
      const { data: existingDownload } = await supabase
        .from('download_purchases')
        .select('*')
        .eq('style_id', styleId)
        .eq('original_image_url', originalImageUrl)
        .eq('resolution_tier', resolutionTier)
        .single();

      if (existingDownload) {
        // User already owns this download, allow re-download
        await supabase
          .from('download_purchases')
          .update({
            download_count: existingDownload.download_count + 1,
            last_downloaded_at: new Date().toISOString()
          })
          .eq('id', existingDownload.id);

        return {
          success: true,
          downloadUrl: existingDownload.clean_image_url
        };
      }

      // Generate clean image without watermark
      const { data: cleanImageData, error: generationError } = await supabase.functions.invoke(
        'generate-style-preview',
        {
          body: {
            imageUrl: originalImageUrl,
            styleId: styleId,
            removeWatermark: true,
            resolutionTier: resolutionTier
          }
        }
      );

      if (generationError) {
        throw new Error(generationError.message || 'Failed to generate clean image');
      }

      const cleanImageUrl = cleanImageData.imageUrl;

      // Spend tokens
      await spendTokens(
        tokenCost,
        `Downloaded ${styleName} (${resolutionTier})`,
        {
          style_id: styleId,
          style_name: styleName,
          resolution_tier: resolutionTier,
          clean_image_url: cleanImageUrl
        }
      );

      // Record the download purchase
      const { error: recordError } = await supabase
        .from('download_purchases')
        .insert({
          style_id: styleId,
          style_name: styleName,
          original_image_url: originalImageUrl,
          clean_image_url: cleanImageUrl,
          resolution_tier: resolutionTier,
          tokens_spent: tokenCost,
          download_count: 1,
          last_downloaded_at: new Date().toISOString()
        });

      if (recordError) {
        console.error('Failed to record download:', recordError);
        // Don't fail the download for this, just log it
      }

      return {
        success: true,
        downloadUrl: cleanImageUrl
      };
    } catch (error) {
      console.error('Watermark removal failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process download'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const canAfford = (resolutionTier: 'standard' | 'hd' | 'ultra_hd') => {
    return balance >= RESOLUTION_COSTS[resolutionTier];
  };

  const getTokenCost = (resolutionTier: 'standard' | 'hd' | 'ultra_hd') => {
    return RESOLUTION_COSTS[resolutionTier];
  };

  return {
    removeWatermarkAndDownload,
    isProcessing,
    canAfford,
    getTokenCost,
    balance
  };
};
