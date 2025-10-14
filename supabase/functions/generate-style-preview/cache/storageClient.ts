import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface UploadOptions {
  cacheControl?: string;
  contentType?: string;
}

export interface StorageUploadResult {
  storagePath: string;
  publicUrl: string;
}

export class PreviewStorageClient {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly bucket: string
  ) {}

  async uploadFromUrl(sourceUrl: string, storagePath: string, options: UploadOptions = {}): Promise<StorageUploadResult> {
    let arrayBuffer: ArrayBuffer;
    let contentType = options.contentType ?? 'image/jpeg';

    if (sourceUrl.startsWith('data:image/')) {
      const [header, data] = sourceUrl.split(',');
      if (!data) {
        throw new Error('Invalid data URL for cached preview');
      }
      const mimeMatch = header.match(/^data:(.+);base64$/);
      if (mimeMatch && mimeMatch[1]) {
        contentType = mimeMatch[1];
      }
      const binary = atob(data);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      arrayBuffer = bytes.buffer;
    } else {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch preview asset for caching: ${response.status}`);
      }

      contentType = response.headers.get('content-type') ?? 'image/jpeg';
      arrayBuffer = await response.arrayBuffer();
    }

    return this.uploadFromBuffer(arrayBuffer, storagePath, {
      cacheControl: options.cacheControl,
      contentType
    });
  }

  async uploadFromBuffer(buffer: ArrayBuffer, storagePath: string, options: UploadOptions = {}): Promise<StorageUploadResult> {
    const cacheControl = options.cacheControl ?? 'public, max-age=2592000';
    const contentType = options.contentType ?? 'image/jpeg';

    const uploadResponse = await this.supabase
      .storage
      .from(this.bucket)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
        cacheControl
      });

    if (uploadResponse.error) {
      throw new Error(`Supabase storage upload failed: ${uploadResponse.error.message}`);
    }

    const publicUrlResponse = this.supabase
      .storage
      .from(this.bucket)
      .getPublicUrl(storagePath, {
        transform: undefined
      });

    const publicUrl = publicUrlResponse.data?.publicUrl;

    if (!publicUrl) {
      throw new Error('Failed to resolve public URL for cached preview');
    }

    return {
      storagePath,
      publicUrl
    };
  }

  getPublicUrl(storagePath: string): string | null {
    const publicUrlResponse = this.supabase
      .storage
      .from(this.bucket)
      .getPublicUrl(storagePath, {
        transform: undefined
      });

    return publicUrlResponse.data?.publicUrl ?? null;
  }
}
