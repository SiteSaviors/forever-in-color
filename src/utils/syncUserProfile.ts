import { getSupabaseClient } from '@/utils/supabaseClient.loader';

type ProfileUser = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
};

export const extractFullName = (user: ProfileUser): string | null => {
  const metadata = user.user_metadata ?? {};
  return metadata.full_name ?? metadata.name ?? metadata.user_name ?? null;
};

export const extractAvatarUrl = (user: ProfileUser): string | null => {
  const metadata = user.user_metadata ?? {};
  return metadata.avatar_url ?? metadata.picture ?? metadata.image_url ?? null;
};

export const syncUserProfile = async (user: ProfileUser | null): Promise<void> => {
  if (!user) return;

  const fullName = extractFullName(user);
  const avatarUrl = extractAvatarUrl(user);

  if (!fullName && !avatarUrl) {
    return;
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    console.warn('[syncUserProfile] Supabase client not ready');
    return;
  }

  try {
    await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          full_name: fullName,
          avatar_url: avatarUrl,
        },
        { onConflict: 'id' }
      );
  } catch (error) {
    console.error('[syncUserProfile] Failed to sync profile metadata', error);
  }
};
