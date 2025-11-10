import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/utils/supabaseClient.loader';

export const extractFullName = (user: User): string | null => {
  const metadata = user.user_metadata ?? {};
  return metadata.full_name ?? metadata.name ?? metadata.user_name ?? null;
};

export const extractAvatarUrl = (user: User): string | null => {
  const metadata = user.user_metadata ?? {};
  return metadata.avatar_url ?? metadata.picture ?? metadata.image_url ?? null;
};

export const syncUserProfile = async (user: User | null): Promise<void> => {
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
    await Promise.all([
      supabase.auth.updateUser({
        data: {
          ...(fullName ? { full_name: fullName } : {}),
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        },
      }),
      supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: fullName,
            avatar_url: avatarUrl,
          },
          { onConflict: 'id' }
        ),
    ]);
  } catch (error) {
    console.error('[syncUserProfile] Failed to sync profile metadata', error);
  }
};
