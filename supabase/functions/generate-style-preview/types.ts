
export interface StylePreviewRequest {
  imageData: string;
  styleId: number;
  styleName: string;
}

export interface StylePreviewResponse {
  success: boolean;
  styleDescription: string;
  previewUrl: string;
  styleId: number;
  styleName: string;
  note?: string;
  error?: string;
  details?: string;
}

export type CacheStatus = 'hit' | 'miss' | 'bypass';

export interface PreviewCacheLookupResult {
  cacheStatus: CacheStatus;
  previewUrl?: string;
  storagePath?: string;
  ttlExpiresAt?: string;
}

export interface OpenAIImageResponse {
  data: Array<{
    b64_json?: string;
    url?: string;
  }>;
}

export interface OpenAIAnalysisResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
