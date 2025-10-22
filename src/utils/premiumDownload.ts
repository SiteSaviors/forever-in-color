const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

interface DownloadCleanImageParams {
  storagePath: string;
  filename: string;
  accessToken: string | null;
}

const buildAuthenticatedObjectUrl = (bucket: string, path: string) => {
  if (!SUPABASE_URL) {
    throw new Error('Supabase URL is not configured');
  }

  const encodedBucket = encodeURIComponent(bucket);
  const encodedPath = path
    .split('/')
    .map(encodeURIComponent)
    .join('/');

  return `${SUPABASE_URL}/storage/v1/object/authenticated/${encodedBucket}/${encodedPath}`;
};

export async function downloadCleanImage({
  storagePath,
  filename,
  accessToken,
}: DownloadCleanImageParams): Promise<void> {
  if (!accessToken) {
    throw new Error('Authentication required for clean image download');
  }

  const [bucketName, ...objectParts] = storagePath.split('/');
  if (!bucketName || objectParts.length === 0) {
    throw new Error('Invalid preview storage path');
  }

  const objectPath = objectParts.join('/');
  const requestUrl = buildAuthenticatedObjectUrl(bucketName, objectPath);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
  }

  const response = await fetch(requestUrl, {
    method: 'GET',
    headers,
    credentials: 'omit',
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    let errorDetail = `Failed to fetch image (${response.status})`;
    if (contentType.includes('application/json')) {
      const payload = await response.json().catch(() => null);
      if (payload?.message) {
        errorDetail = payload.message;
      } else if (payload?.error_description) {
        errorDetail = payload.error_description;
      }
    }
    throw new Error(errorDetail);
  }

  const blob = await response.blob();

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
