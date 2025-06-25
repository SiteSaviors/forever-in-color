
export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export interface MemoryUsage {
  estimatedMB: number;
  recommendation: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressionResult {
  dataUrl: string;
  originalSizeMB: number;
  compressedSizeMB: number;
}
