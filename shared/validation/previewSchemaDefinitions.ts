export type PreviewQuality = 'low' | 'medium' | 'high' | 'auto';

export type PreviewCropConfig = {
  x: number;
  y: number;
  width: number;
  height: number;
  orientation?: string;
  [key: string]: unknown;
};

export type PreviewRequest = {
  imageUrl: string;
  style: string;
  photoId?: string;
  aspectRatio?: string;
  watermark?: boolean;
  quality?: PreviewQuality;
  cacheBypass?: boolean;
  isAuthenticated?: boolean;
  sourceStoragePath?: string | null;
  sourceDisplayUrl?: string | null;
  cropConfig?: PreviewCropConfig | null;
  [key: string]: unknown;
};

export type PreviewResponse = {
  status: 'complete';
  previewUrl: string;
  requiresWatermark: boolean;
  remainingTokens: number | null;
  tier?: string;
  priority?: string;
  storageUrl?: string | null;
  storagePath?: string | null;
  softRemaining?: number | null;
  sourceStoragePath?: string | null;
  sourceDisplayUrl?: string | null;
  previewLogId?: string | null;
  cropConfig?: PreviewCropConfig | null;
} | {
  status: 'processing';
  previewUrl: null;
  requestId: string;
  requiresWatermark: boolean;
  remainingTokens: number | null;
  tier?: string;
  priority?: string;
  storageUrl?: string | null;
  storagePath?: string | null;
  softRemaining?: number | null;
  sourceStoragePath?: string | null;
  sourceDisplayUrl?: string | null;
  previewLogId?: string | null;
  cropConfig?: PreviewCropConfig | null;
};

export type PreviewStatusResponse = {
  request_id: string;
  status: string;
  preview_url?: string | null;
  error?: string | null;
  [key: string]: unknown;
};
