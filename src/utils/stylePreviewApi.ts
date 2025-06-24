
import { supabase } from "@/integrations/supabase/client";
import { createPreview } from "./previewOperations";
import { resizeImageForProcessing } from "./imageResizer";

export const generateStylePreview = async (
  imageUrl: string, 
  style: string, 
  photoId: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
) => {
  try {
    console.log(`Generating style preview with GPT-Image-1 (${quality} quality):`, { 
      imageUrl: imageUrl.substring(0, 50) + '...', 
      style, 
      photoId,
      quality 
    });
    
    // Resize image before sending to reduce processing time
    console.log('Resizing image for faster GPT-Image-1 processing...');
    const resizedImageUrl = await resizeImageForProcessing(imageUrl, 768, 768, 0.8);
    console.log('Image resized successfully for GPT-Image-1 processing');
    
    // Check if user is authenticated (optional now)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const isAuthenticated = session && !sessionError;

    console.log('User authentication status:', isAuthenticated ? 'authenticated' : 'not authenticated');

    // Prepare the request body with resized image
    const requestBody = { 
      imageUrl: resizedImageUrl, // Use resized image instead of original
      style,
      photoId,
      isAuthenticated,
      quality
    };

    console.log('Sending request to GPT-Image-1 service:', { 
      style, 
      photoId, 
      isAuthenticated, 
      quality,
      imageUrlLength: resizedImageUrl.length 
    });

    const { data, error } = await supabase.functions.invoke('generate-style-preview', {
      body: requestBody
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data?.preview_url) {
      throw new Error('No preview URL returned from GPT-Image-1 service');
    }

    console.log(`GPT-Image-1 ${quality} quality preview generated successfully:`, data.preview_url);
    
    // Only store the preview if user is authenticated and it's high quality
    if (isAuthenticated && quality === 'high') {
      try {
        await createPreview(photoId, style, data.preview_url);
      } catch (storeError) {
        console.warn('Could not store preview (user not authenticated):', storeError);
        // Continue anyway, just don't store
      }
    }
    
    return data.preview_url;
  } catch (error) {
    console.error(`Error generating GPT-Image-1 ${quality} quality style preview:`, error);
    throw error;
  }
};
