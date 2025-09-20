
import { supabase } from "@/integrations/supabase/client";
import { createPreview } from "./previewOperations";
import { getAspectRatio, validateOrientationFlow, isValidAspectRatio } from "@/components/product/orientation/utils";

export const generateStylePreview = async (
  imageUrl: string, 
  style: string, 
  photoId: string, 
  aspectRatio: string = "1:1",
  options: {
    watermark?: boolean;
    quality?: 'preview' | 'final';
    sessionId?: string;
  } = {}
) => {
  try {
    // SIMPLIFIED: Use aspect ratio as-is, let backend handle validation
    const correctedAspectRatio = aspectRatio;
    
    // Check if user is authenticated (optional now)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const isAuthenticated = session && !sessionError;

    // Generate session ID for watermarking if not provided
    const sessionId = options.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // STEP 2: Prepare the request body with corrected aspect ratio
    const requestBody = { 
      imageUrl, 
      style,
      photoId,
      isAuthenticated,
      aspectRatio: correctedAspectRatio, // Use the corrected aspect ratio
      watermark: options.watermark !== false, // Default to true
      quality: options.quality || 'preview',
      sessionId
    };

    // STEP 3: Enhanced error handling for the Supabase function call
    try {
      const { data, error } = await supabase.functions.invoke('generate-style-preview', {
        body: requestBody
      });

      if (error) {        
        // Provide more specific error messages based on error type
        if (error.message?.includes('Failed to fetch')) {
          throw new Error('Unable to connect to the AI service. Please check your internet connection and try again.');
        } else if (error.message?.includes('Service configuration error')) {
          throw new Error('AI service is temporarily unavailable. Please try again later or contact support.');
        } else if (error.message?.includes('rate_limit')) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        } else if (error.message?.includes('Invalid')) {
          throw new Error('Invalid image or style selection. Please check your inputs and try again.');
        } else if (error.message?.includes('aspect ratio')) {
          throw new Error(`Aspect ratio error: ${error.message}`);
        }
        
        throw new Error(error.message || 'Failed to generate style preview. Please try again.');
      }

      // STEP 4: Enhanced response validation
      if (!data) {
        throw new Error('No response received from AI service. Please try again.');
      }

      if (!data.preview_url) {
        throw new Error('AI service returned an invalid response. Please try again.');
      }
      
      // Only store the preview if user is authenticated
      if (isAuthenticated) {
        try {
          await createPreview(photoId, style, data.preview_url);
        } catch (storeError) {
          // Continue anyway, just don't store
        }
      }
      
      return data.preview_url;
    } catch (apiError) {
      throw apiError; // Re-throw to be handled by the caller
    }
  } catch (error) {    
    // Re-throw with more user-friendly message if it's a generic error
    if (error.message === 'Failed to fetch' || error.message.includes('TypeError')) {
      throw new Error('Unable to connect to the AI service. Please check your internet connection and try again. If the problem persists, the service may be temporarily unavailable.');
    }
    
    throw error;
  }
};

// New function for generating clean, unwatermarked images (post-purchase)
export const generateFinalImage = async (
  imageUrl: string, 
  style: string, 
  photoId: string, 
  aspectRatio: string = "1:1",
  sessionId?: string
) => {
  return generateStylePreview(imageUrl, style, photoId, aspectRatio, {
    watermark: false,
    quality: 'final',
    sessionId
  });
};
