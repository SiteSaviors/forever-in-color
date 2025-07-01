
import { supabase } from "@/integrations/supabase/client";

export const createPreview = async (photoId: string, style: string, previewUrl: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to create previews');
  }

  const { data, error } = await supabase
    .from('Previews')
    .insert({
      photo_id: photoId,
      style,
      preview_url: previewUrl,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating preview:', error);
    throw error;
  }

  return data;
};
