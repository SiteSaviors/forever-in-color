
export interface CustomizationOptions {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

export interface Purchase {
  id: string;
  url: string;
  created_at?: string;
  resolution_tier: string;
  download_count: number;
  tokens_spent: number;
  style_id?: number;
  style_name?: string;
  original_image_url?: string;
  clean_image_url?: string;
  last_downloaded_at?: string | null;
}

export interface ProductState {
  currentStep: number;
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  uploadedImage: string | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  preview: PreviewState;
  autoGenerationComplete: boolean;
  isGenerating: boolean;
  generationErrors: { [key: number]: string };
}

export interface ProductStateActions {
  setCurrentStep: (step: number) => void;
  handlePhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  handleSizeSelect: (size: string) => void;
  handleOrientationSelect: (orientation: string) => void;
  handleCustomizationChange: (customizations: CustomizationOptions) => void;
  canProceedToStep: (step: number) => boolean;
  startPreview: (styleId: number, styleName: string) => Promise<string | null>;
  cancelPreview: () => void;
}

export interface PreviewState {
  previewUrls: { [key: number]: string };
  status: {
    autoGenerationComplete: boolean;
    isGenerating: boolean;
  };
  error: { [key: number]: string };
}
