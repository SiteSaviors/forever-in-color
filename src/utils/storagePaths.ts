const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

let supabaseOrigin: string | null = null;
try {
  supabaseOrigin = SUPABASE_URL ? new URL(SUPABASE_URL).origin : null;
} catch {
  supabaseOrigin = null;
}

const STORAGE_PUBLIC_PREFIX = '/storage/v1/object/public/';

const STORAGE_PATH_REGEX = /^(preview-cache(?:-public|-premium)?|user-uploads)\/(.+)$/;

export const extractStoragePathFromUrl = (value?: string | null): string | null => {
  if (!value) return null;

  if (STORAGE_PATH_REGEX.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);
    if (supabaseOrigin && url.origin !== supabaseOrigin) {
      return null;
    }
    const index = url.pathname.indexOf(STORAGE_PUBLIC_PREFIX);
    if (index === -1) return null;
    const path = url.pathname.slice(index + STORAGE_PUBLIC_PREFIX.length);
    return decodeURIComponent(path);
  } catch {
    return null;
  }
};

export const buildPublicStorageUrl = (storagePath: string | null | undefined): string | null => {
  if (!storagePath || !SUPABASE_URL) return null;
  const normalized = storagePath.replace(/^\/+/g, '');
  return `${SUPABASE_URL.replace(/\/$/, '')}${STORAGE_PUBLIC_PREFIX}${normalized}`;
};
