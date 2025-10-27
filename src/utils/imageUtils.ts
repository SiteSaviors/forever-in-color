import { supabaseClient } from '@/utils/supabaseClient';
import { ENABLE_HEIC_EDGE_CONVERSION } from '@/config/featureFlags';

export type Orientation = 'horizontal' | 'vertical' | 'square';

const HEIC_EXTENSIONS = ['.heic', '.heif'];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const looksLikeHeic = (file: File): boolean => {
  const type = (file.type || '').toLowerCase();
  if (type === 'image/heic' || type === 'image/heif') {
    return true;
  }
  const name = (file.name || '').toLowerCase();
  return HEIC_EXTENSIONS.some((ext) => name.endsWith(ext));
};

export type FileDataUrlResult = {
  dataUrl: string;
  width?: number;
  height?: number;
  cacheHit?: boolean;
  source: 'edge' | 'fallback' | 'local';
};

export type ReadFileAsDataUrlOptions = {
  accessToken?: string | null;
  signal?: AbortSignal;
  onConversionStart?: () => void;
  onConversionSuccess?: (meta: { width: number; height: number; cacheHit: boolean }) => void;
  onConversionError?: (error: unknown) => void;
};

export async function readFileAsDataURL(file: File, options: ReadFileAsDataUrlOptions = {}): Promise<FileDataUrlResult> {
  if (looksLikeHeic(file) && ENABLE_HEIC_EDGE_CONVERSION && SUPABASE_URL && SUPABASE_ANON_KEY && supabaseClient) {
    try {
      options.onConversionStart?.();
      const result = await convertHeicUsingEdge(file, {
        accessToken: options.accessToken ?? (await supabaseClient.auth.getSession()).data.session?.access_token ?? null,
        signal: options.signal,
      });
      options.onConversionSuccess?.({ width: result.width, height: result.height, cacheHit: result.cacheHit });
      return {
        dataUrl: result.dataUrl,
        width: result.width,
        height: result.height,
        cacheHit: result.cacheHit,
        source: 'edge',
      };
    } catch (error) {
      options.onConversionError?.(error);
      console.warn('[imageUtils] Edge HEIC conversion failed; falling back to local converter', error);
    }
  }

  if (looksLikeHeic(file)) {
    try {
      const heic2anyModule = await import('heic2any');
      const convert = heic2anyModule.default ?? heic2anyModule;
      const converted = await convert({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.92,
      });
      const outputBlob = Array.isArray(converted) ? converted[0] : converted;
      const dataUrl = await blobToDataURL(outputBlob);
      return { dataUrl, source: 'fallback' };
    } catch (error) {
      console.warn('[imageUtils] Local HEIC conversion failed; using original data URL', error);
    }
  }

  return {
    dataUrl: await blobToDataURL(file),
    source: 'local',
  };
}

type EdgeConversionInput = {
  accessToken: string | null;
  signal?: AbortSignal;
};

type EdgeConversionResponse = {
  dataUrl: string;
  width: number;
  height: number;
  cacheHit: boolean;
};

type ConvertHeicPayload = {
  ok: boolean;
  signedUrl: string;
  signedUrlExpiresAt: number;
  width: number;
  height: number;
  cacheHit: boolean;
  bucket: string;
  storagePath: string;
};

const EDGE_CLIENT_HEADER = 'wondertone-heic-edge';

async function convertHeicUsingEdge(file: File, options: EdgeConversionInput): Promise<EdgeConversionResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment variables are not configured');
  }

  const endpoint = `${SUPABASE_URL}/functions/v1/convert-heic`;
  const formData = new FormData();
  formData.append('file', file, file.name || 'upload.heic');

  const headers: HeadersInit = {
    'apikey': SUPABASE_ANON_KEY,
    'x-client-info': EDGE_CLIENT_HEADER,
  };

  if (options.accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: formData,
    signal: options.signal,
  });

  const text = await response.text();

  if (!response.ok) {
    let message = `HEIC conversion failed (${response.status})`;
    try {
      const errorPayload = JSON.parse(text);
      message = errorPayload?.message ?? errorPayload?.error ?? message;
    } catch {
      message = text || message;
    }
    throw new Error(message);
  }

  let payload: ConvertHeicPayload;
  try {
    payload = JSON.parse(text) as ConvertHeicPayload;
  } catch (error) {
    throw new Error(`Invalid conversion response: ${(error as Error)?.message ?? 'unknown error'}`);
  }

  if (!payload.ok || !payload.signedUrl) {
    throw new Error('HEIC conversion response missing signed URL');
  }

  const jpegResponse = await fetch(payload.signedUrl, { signal: options.signal });
  if (!jpegResponse.ok) {
    throw new Error(`Failed to download converted JPEG (${jpegResponse.status})`);
  }

  const blob = await jpegResponse.blob();
  const dataUrl = await blobToDataURL(blob);

  return {
    dataUrl,
    width: payload.width,
    height: payload.height,
    cacheHit: payload.cacheHit,
  };
}

export async function detectOrientationFromDataUrl(dataUrl: string): Promise<Orientation> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(determineOrientationFromDimensions(image.width, image.height));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

export function determineOrientationFromDimensions(width: number, height: number): Orientation {
  if (width === 0 || height === 0) {
    return 'square';
  }
  const ratio = width / height;
  if (ratio >= 1.2) {
    return 'horizontal';
  }
  if (ratio <= 0.8) {
    return 'vertical';
  }
  return 'square';
}

export async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  const image = await loadImage(dataUrl);
  return { width: image.width, height: image.height };
}

export async function cropImageToDataUrl(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  outputWidth?: number,
  outputHeight?: number
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = outputWidth ?? crop.width;
  const height = outputHeight ?? crop.height;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    width,
    height
  );
  return canvas.toDataURL('image/jpeg', 0.92);
}

export function generateCenteredCrop(imageWidth: number, imageHeight: number, aspect = 1): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const imageAspect = imageWidth / imageHeight;
  if (imageAspect > aspect) {
    const height = imageHeight;
    const width = height * aspect;
    const x = (imageWidth - width) / 2;
    return { x, y: 0, width, height };
  }
  const width = imageWidth;
  const height = width / aspect;
  const y = (imageHeight - height) / 2;
  return { x: 0, y, width, height };
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
