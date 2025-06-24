
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

export interface ProductState {
  currentStep: number;
  completedSteps: number[];
  selectedStyle: {id: number, name: string} | null;
  uploadedImage: string | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationOptions;
  previewUrls: { [key: number]: string };
  autoGenerationComplete: boolean;
}

export interface ProductStateActions {
  setCurrentStep: (step: number) => void;
  handlePhotoAndStyleComplete: (imageUrl: string, styleId: number, styleName: string) => void;
  handleSizeSelect: (size: string) => void;
  handleOrientationSelect: (orientation: string) => void;
  handleCustomizationChange: (customizations: CustomizationOptions) => void;
  canProceedToStep: (step: number) => boolean;
}
