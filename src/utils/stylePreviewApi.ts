
import { supabase } from "@/integrations/supabase/client";
import { createPreview } from "./previewOperations";

export const generateStylePreview = async (imageUrl: string, style: string, photoId: string) => {
  try {
    console.log('Generating style preview:', { imageUrl: imageUrl.substring(0, 50) + '...', style, photoId });
    
    // Verify user is authenticated and get session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('User must be authenticated to generate previews');
    }

    console.log('User authenticated, calling edge function with proper auth');

    const { data, error } = await supabase.functions.invoke('generate-style-preview', {
      body: { 
        imageUrl, 
        style,
        photoId
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data?.preview_url) {
      throw new Error('No preview URL returned from function');
    }

    console.log('Preview generated successfully:', data.preview_url);
    
    // Store the preview with proper user association
    await createPreview(photoId, style, data.preview_url);
    
    return data.preview_url;
  } catch (error) {
    console.error('Error generating style preview:', error);
    throw error;
  }
};
