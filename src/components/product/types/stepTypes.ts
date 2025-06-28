
export interface StepProps {
  currentStep: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  onStepClick: () => void;
}

export interface StepContentProps {
  currentStep: number;
  completedSteps: number[];
  onStepChange: (step: number) => void;
}

export interface StepHandlers {
  canProceedToStep: (step: number) => boolean;
  handleContinueToStep2: () => void;
  handleContinueToStep3: () => void;
  handleContinueToStep4: () => void;
}

export interface CustomizationConfig {
  floatingFrame: {
    enabled: boolean;
    color: 'white' | 'black' | 'espresso';
  };
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

export interface ProductStepData {
  selectedStyle: {id: number, name: string} | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: CustomizationConfig;
  uploadedImage: string | null;
  autoGenerationComplete: boolean;
}
