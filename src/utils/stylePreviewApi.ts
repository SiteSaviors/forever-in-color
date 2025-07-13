
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
    console.log('=== STYLE PREVIEW API CALL ===');
    console.log('Generating style preview with GPT-Image-1:', { 
      imageUrl: imageUrl.substring(0, 50) + '...', 
      style, 
      photoId, 
      aspectRatio,
      options
    });
    
    // STEP 1: Enhanced input validation
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      throw new Error('Invalid image URL provided');
    }
    
    if (!style || typeof style !== 'string' || style.trim().length === 0) {
      throw new Error('Invalid style name provided');
    }
    
    if (!photoId || typeof photoId !== 'string' || photoId.trim().length === 0) {
      throw new Error('Invalid photo ID provided');
    }
    
    // Validate and correct aspect ratio format for GPT-Image-1
    let correctedAspectRatio = aspectRatio;
    if (!isValidAspectRatio(aspectRatio)) {
      // Map common invalid ratios to valid GPT-Image-1 ratios
      if (aspectRatio === '4:3') {
        correctedAspectRatio = '3:2';
        console.warn(`⚠️ Converting invalid ratio 4:3 to 3:2 for GPT-Image-1 compatibility`);
      } else if (aspectRatio === '3:4') {
        correctedAspectRatio = '2:3';
        console.warn(`⚠️ Converting invalid ratio 3:4 to 2:3 for GPT-Image-1 compatibility`);
      } else {
        correctedAspectRatio = '1:1';
        console.warn(`⚠️ Invalid aspect ratio "${aspectRatio}", defaulting to 1:1 for GPT-Image-1`);
      }
    }
    
    // Check if user is authenticated (optional now)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const isAuthenticated = session && !sessionError;

    console.log('User authentication status:', isAuthenticated ? 'authenticated' : 'not authenticated');

    // Generate session ID for watermarking if not provided
    const sessionId = options.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // STEP 2: Prepare the request body with enhanced validation
    const requestBody = { 
      imageUrl: imageUrl.trim(), 
      style: style.trim(),
      photoId: photoId.trim(),
      isAuthenticated,
      aspectRatio: correctedAspectRatio,
      watermark: options.watermark !== false,
      quality: options.quality || 'preview',
      sessionId: sessionId.trim()
    };

    // Additional request validation
    if (requestBody.imageUrl.length > 2000) {
      throw new Error('Image URL is too long');
    }
    
    if (requestBody.style.length > 100) {
      throw new Error('Style name is too long');
    }

    console.log('VALIDATED REQUEST BODY TO SUPABASE FUNCTION:', JSON.stringify({
      ...requestBody,
      imageUrl: requestBody.imageUrl.substring(0, 50) + '...'
    }, null, 2));
    console.log('🎯 CRITICAL: GPT-Image-1 compatible aspect ratio being sent to API:', correctedAspectRatio);

    // STEP 3: Enhanced error handling for the Supabase function call with retry logic
    let lastError: Error | null = null;
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 API call attempt ${attempt}/${maxRetries}`);
        
        const { data, error } = await supabase.functions.invoke('generate-style-preview', {
          body: requestBody
        });

        if (error) {
          console.error(`❌ Supabase function error (attempt ${attempt}):`, error);
          lastError = new Error(error.message || 'Unknown API error');
          
          if (attempt === maxRetries) {
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
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        // STEP 4: Enhanced response validation
        if (!data) {
          console.error('❌ No response received from AI service');
          lastError = new Error('No response received from AI service');
          
          if (attempt === maxRetries) {
            throw new Error('No response received from AI service. Please try again.');
          }
          continue;
        }

        if (!data.preview_url) {
          console.error('❌ Invalid response from GPT-Image-1 service:', data);
          lastError = new Error('Invalid response format');
          
          if (attempt === maxRetries) {
            throw new Error('AI service returned an invalid response. Please try again.');
          }
          continue;
        }

        console.log('✅ GPT-Image-1 preview generated successfully with aspect ratio:', correctedAspectRatio, '-> URL:', data.preview_url.substring(0, 50) + '...');
        
        // Only store the preview if user is authenticated
        if (isAuthenticated) {
          try {
            await createPreview(photoId, style, data.preview_url);
            console.log('✅ Preview stored successfully in database');
          } catch (storeError) {
            console.warn('⚠️ Could not store preview (user not authenticated or database error):', storeError);
            // Continue anyway, just don't store
          }
        }
        
        return data.preview_url;
        
      } catch (apiError) {
        console.error(`❌ API call error (attempt ${attempt}):`, apiError);
        lastError = apiError instanceof Error ? apiError : new Error('Unknown API error');
        
        if (attempt === maxRetries) {
          throw apiError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('All retry attempts failed');
    
  } catch (error) {
    console.error('❌ Error generating GPT-Image-1 style preview:', error);
    
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
