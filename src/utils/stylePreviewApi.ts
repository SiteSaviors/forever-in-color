
import { supabase } from "@/integrations/supabase/client";
import { createPreview } from "./previewOperations";

export const generateStylePreview = async (imageUrl: string, style: string, photoId: string) => {
  try {
    console.log('Generating style preview:', { imageUrl: imageUrl.substring(0, 50) + '...', style, photoId });
    
    // Check if user is authenticated (optional now)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const isAuthenticated = session && !sessionError;

    console.log('User authentication status:', isAuthenticated ? 'authenticated' : 'not authenticated');

    // Prepare the request body
    const requestBody = { 
      imageUrl, 
      style,
      photoId,
      isAuthenticated
    };

    console.log('Sending request with body:', { 
      style, 
      photoId, 
      isAuthenticated, 
      imageUrlLength: imageUrl.length 
    });

    const { data, error } = await supabase.functions.invoke('generate-style-preview', {
      body: requestBody
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data?.preview_url) {
      throw new Error('No preview URL returned from function');
    }

    console.log('Preview generated successfully:', data.preview_url);
    
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
    console.error('Error generating style preview:', error);
    throw error;
  }
};
