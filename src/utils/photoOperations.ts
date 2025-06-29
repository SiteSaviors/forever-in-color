
import { supabase } from "@/integrations/supabase/client";

export const uploadPhoto = async (imageUrl: string, orientation: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to upload photos');
  }

  const { data, error } = await supabase
    .from('Photos')
    .insert({
      image_url: imageUrl,
      orientation,
      user_id: user.id,
      status: 'Uploaded'
    })
    .select()
    .single();

  if (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }

  return data;
};

export const getUserPhotos = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to view photos');
  }

  const { data, error } = await supabase
    .from('Photos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user photos:', error);
    throw error;
  }

  return data;
};

export const deletePhoto = async (photoId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete photos');
  }

  const { error } = await supabase
    .from('Photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};
