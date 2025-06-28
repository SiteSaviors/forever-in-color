
export interface ImageUploadHandler {
  (imageUrl: string, originalImageUrl?: string, orientation?: string): void;
}

export interface StyleSelectHandler {
  (styleId: number, styleName: string): void;
}

export interface EnhancedHandlers {
  handleEnhancedImageUpload: ImageUploadHandler;
  handleEnhancedStyleSelect: StyleSelectHandler;
}

export interface ProgressDispatchHandler {
  (action: ProgressActionPayload): void;
}

export interface ContextualHelpHandler {
  (type: string, message: string, level?: 'minimal' | 'moderate' | 'detailed') => void;
}

export interface AIAnalysisHandler {
  (stage: string) => void;
}

export interface TrackingHandler {
  (element: string) => void;
}

export interface HoverTrackingHandler {
  (duration: number) => void;
}
