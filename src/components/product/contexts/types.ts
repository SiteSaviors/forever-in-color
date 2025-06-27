export interface PreviewState {
  status: 'idle' | 'loading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export interface StylePreviewState {
  [styleId: number]: PreviewState;
}

export type StylePreviewAction =
  | { type: 'START_GENERATION'; styleId: number }
  | { type: 'GENERATION_SUCCESS'; styleId: number; url: string }
  | { type: 'GENERATION_ERROR'; styleId: number; error: string }
  | { type: 'RETRY_GENERATION'; styleId: number }
  | { type: 'RESET_ALL' };

export interface StylePreviewContextType {
  previews: StylePreviewState;
  croppedImage: string | null;
  selectedOrientation: string;
  generatePreview: (styleId: number, styleName: string) => Promise<void>;
  retryGeneration: (styleId: number, styleName: string) => Promise<void>;
  getPreviewStatus: (styleId: number) => PreviewState;
  isLoading: (styleId: number) => boolean;
  hasPreview: (styleId: number) => boolean;
  hasError: (styleId: number) => boolean;
  getPreviewUrl: (styleId: number) => string | undefined;
  getError: (styleId: number) => string | undefined;
}

export interface StylePreviewProviderProps {
  children: React.ReactNode;
  croppedImage: string | null;
  selectedOrientation: string;
}