
import { supabase } from "@/integrations/supabase/client";
import { createPreview } from "./previewOperations";

export const generateStylePreview = async (imageUrl: string, style: string, photoId: string, aspectRatio: string = "1:1") => {
  try {
    console.log('=== STYLE PREVIEW API CALL ===');
    console.log('Generating style preview with GPT-Image-1:', { 
      imageUrl: imageUrl.substring(0, 50) + '...', 
      style, 
      photoId, 
      aspectRatio: aspectRatio 
    });
    console.log('ASPECT RATIO BEING SENT TO BACKEND:', aspectRatio);
    
    // Check if user is authenticated (optional now)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const isAuthenticated = session && !sessionError;

    console.log('User authentication status:', isAuthenticated ? 'authenticated' : 'not authenticated');

    // Prepare the request body - ENSURE aspectRatio is included
    const requestBody = { 
      imageUrl, 
      style,
      photoId,
      isAuthenticated,
      aspectRatio // CRITICAL: This must reach the backend
    };

    console.log('FULL REQUEST BODY TO SUPABASE FUNCTION:', JSON.stringify(requestBody, null, 2));

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

    console.log('GPT-Image-1 preview generated successfully with aspect ratio:', aspectRatio, 'URL:', data.preview_url);
    
    // Only store the preview if user is authenticated
    if (isAuthenticated) {
      try {
        await createPreview(photoId, style, data.preview_url);
      } catch (storeError) {
        console.warn('Could not store preview (user not authenticated):', storeError);
        // Continue anyway, just don't store
      }
    }
    
    return data.preview_url;
  } catch (error) {
    console.error('Error generating GPT-Image-1 style preview:', error);
    throw error;
  }
};
