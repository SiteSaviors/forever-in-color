
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

export const getUserPreviews = async (photoId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to view previews');
  }

  let query = supabase
    .from('Previews')
    .select('*')
    .eq('user_id', user.id);

  if (photoId) {
    query = query.eq('photo_id', photoId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user previews:', error);
    throw error;
  }

  return data;
};

export const deletePreview = async (previewId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete previews');
  }

  const { error } = await supabase
    .from('Previews')
    .delete()
    .eq('id', previewId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting preview:', error);
    throw error;
  }
};
