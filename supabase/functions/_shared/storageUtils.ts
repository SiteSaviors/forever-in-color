import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export type StorageObjectRef = {
  bucket: string;
  path: string;
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
if (!SUPABASE_URL) {
  throw new Error('[storageUtils] SUPABASE_URL is not configured');
}

const DEFAULT_ALLOWED_BUCKETS = ['preview-cache', 'preview-cache-public', 'preview-cache-premium'];
const allowedBuckets = new Set(
  (Deno.env.get('WT_ALLOWED_STORAGE_BUCKETS') ?? DEFAULT_ALLOWED_BUCKETS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
);

const PUBLIC_PREFIX = '/storage/v1/object/public/';

const normalizePath = (value: string): string => value.replace(/^\/+/, '');

export const isAllowedBucket = (bucket: string): boolean => allowedBuckets.has(bucket);

export const parseStoragePath = (input?: string | null): StorageObjectRef | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const normalized = normalizePath(trimmed);
  const slashIndex = normalized.indexOf('/');
  if (slashIndex === -1) {
    return null;
  }

  const bucket = normalized.slice(0, slashIndex);
  const path = normalizePath(normalized.slice(slashIndex + 1));

  if (!isAllowedBucket(bucket) || path.length === 0) {
    return null;
  }

  return { bucket, path };
};

export const parseStorageUrl = (urlString: string): StorageObjectRef | null => {
  try {
    const supabaseHost = new URL(SUPABASE_URL);
    const url = new URL(urlString);
    if (url.origin !== supabaseHost.origin) {
      return null;
    }

    const index = url.pathname.indexOf(PUBLIC_PREFIX);
    if (index === -1) {
      return null;
    }

    const pathAfterPrefix = url.pathname.slice(index + PUBLIC_PREFIX.length);
    return parseStoragePath(pathAfterPrefix);
  } catch {
    return null;
  }
};

export const buildPublicUrl = ({ bucket, path }: StorageObjectRef): string =>
  `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${normalizePath(path)}`;

export const buildSignedUrl = async (
  supabase: SupabaseClient,
  ref: StorageObjectRef,
  expiresInSeconds: number
): Promise<string | null> => {
  if (!isAllowedBucket(ref.bucket)) return null;
  const { data, error } = await supabase.storage.from(ref.bucket).createSignedUrl(ref.path, expiresInSeconds);
  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
};

export const ensureObjectExists = async (supabase: SupabaseClient, ref: StorageObjectRef): Promise<boolean> => {
  if (!isAllowedBucket(ref.bucket)) return false;
  const { data, error } = await supabase.storage.from(ref.bucket).createSignedUrl(ref.path, 1);
  return Boolean(data?.signedUrl && !error);
};

export const downloadStorageObject = async (
  supabase: SupabaseClient,
  ref: StorageObjectRef
): Promise<{ buffer: ArrayBuffer; contentType: string }> => {
  if (!isAllowedBucket(ref.bucket)) {
    throw new Error(`Storage bucket not allowed: ${ref.bucket}`);
  }
  const { data, error } = await supabase.storage.from(ref.bucket).download(ref.path);
  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to download storage object');
  }
  const buffer = await data.arrayBuffer();
  return {
    buffer,
    contentType: data.type && data.type.length > 0 ? data.type : 'image/jpeg',
  };
};
