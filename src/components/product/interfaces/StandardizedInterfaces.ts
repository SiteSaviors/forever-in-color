/* Phase 2: Standardized Component Interfaces */

// Base interface for all step components
export interface BaseStepProps {
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  canAccess: boolean;
  onStepClick: () => void;
}

// Enhanced interaction states
export interface InteractionStateProps {
  isLoading?: boolean;
  isAnimating?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
}

// Standardized data flow props
export interface DataFlowProps<T = any> {
  data?: T;
  onChange?: (data: T) => void;
  onComplete?: (data: T) => void;
  onError?: (error: string) => void;
  onValidate?: (data: T) => boolean | string;
}

// Performance optimization props
export interface PerformanceProps {
  shouldPreload?: boolean;
  priority?: 'low' | 'medium' | 'high';
  lazy?: boolean;
  memoize?: boolean;
}

// Accessibility props
export interface AccessibilityProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  announceChanges?: boolean;
}

// Animation configuration
export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  direction?: 'normal' | 'reverse' | 'alternate';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// Step-specific interfaces

// Photo Upload Step
export interface PhotoUploadStepData {
  uploadedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
  cropSettings?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
  imageMetadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

export interface PhotoUploadStepProps extends 
  BaseStepProps, 
  InteractionStateProps,
  DataFlowProps<PhotoUploadStepData>,
  PerformanceProps,
  AccessibilityProps {
  
  // Step-specific props
  selectedStyle?: { id: number; name: string } | null;
  uploadedImage?: string | null;
  selectedOrientation?: string;
  autoGenerationComplete?: boolean;
  completedSteps?: number[];
  
  // Callbacks
  onPhotoAndStyleComplete?: (imageUrl: string, styleId: number, styleName: string) => void;
  onContinue?: () => void;
  onStepChange?: (step: number) => void;
  
  // Current step context
  currentStep?: number;
}

// Canvas Configuration Step
export interface CanvasConfigurationStepData {
  selectedOrientation: string;
  selectedSize: string;
  canvasPreview?: string;
  aspectRatio?: number;
}

export interface CanvasConfigurationStepProps extends 
  BaseStepProps,
  InteractionStateProps,
  DataFlowProps<CanvasConfigurationStepData>,
  PerformanceProps,
  AccessibilityProps {
  
  // Step-specific props
  selectedOrientation?: string;
  selectedSize?: string;
  uploadedImage?: string | null;
  completedSteps?: number[];
  
  // Callbacks
  onOrientationSelect?: (orientation: string) => void;
  onSizeSelect?: (size: string) => void;
  onContinue?: () => void;
  onStepChange?: (step: number) => void;
  
  // Current step context
  currentStep?: number;
}

// Customization Step
export interface CustomizationStepData {
  customizations: {
    floatingFrame?: boolean;
    aiUpscale?: boolean;
    customMessage?: string;
    voiceMatch?: boolean;
    livingMemory?: boolean;
    premiumVideo?: string;
  };
  pricingBreakdown?: {
    basePrice: number;
    addOns: Array<{ name: string; price: number }>;
    total: number;
  };
}

export interface CustomizationStepProps extends 
  BaseStepProps,
  InteractionStateProps,
  DataFlowProps<CustomizationStepData>,
  PerformanceProps,
  AccessibilityProps {
  
  // Step-specific props
  selectedSize?: string;
  customizations?: any;
  selectedOrientation?: string;
  selectedStyle?: { id: number; name: string } | null;
  previewUrls?: Record<string, string>;
  userArtworkUrl?: string | null;
  
  // Callbacks
  onCustomizationChange?: (customizations: any) => void;
  
  // Current step context
  currentStep?: number;
}

// Review Order Step
export interface ReviewOrderStepData {
  orderSummary: {
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      thumbnail?: string;
    }>;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  customerInfo?: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface ReviewOrderStepProps extends 
  BaseStepProps,
  InteractionStateProps,
  DataFlowProps<ReviewOrderStepData>,
  PerformanceProps,
  AccessibilityProps {
  
  // Step-specific props
  uploadedImage?: string | null;
  selectedStyle?: { id: number; name: string } | null;
  selectedSize?: string;
  selectedOrientation?: string;
  customizations?: any;
  
  // Current step context
  currentStep?: number;
}

// Unified Step Component Props
export interface UnifiedStepProps extends 
  BaseStepProps,
  InteractionStateProps,
  PerformanceProps,
  AccessibilityProps {
  
  // Step configuration
  stepConfig: {
    title: string;
    description: string;
    icon?: React.ComponentType;
    estimatedTime?: string;
    optional?: boolean;
  };
  
  // Content and children
  children?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  
  // Animation configuration
  animationConfig?: AnimationConfig;
  
  // Styling
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
}

// Navigation interface
export interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  canProceedToStep: (step: number) => boolean;
  onStepChange: (step: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showProgress?: boolean;
  showStepLabels?: boolean;
}

// Common loading states
export interface LoadingStateProps {
  isLoading: boolean;
  loadingMessage?: string;
  loadingType?: 'spinner' | 'skeleton' | 'progress' | 'dots';
  progress?: number;
  className?: string;
}

// Common error states
export interface ErrorStateProps {
  hasError: boolean;
  errorMessage?: string;
  errorType?: 'network' | 'validation' | 'server' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

// Form field standardization
export interface StandardFieldProps {
  label: string;
  name: string;
  value?: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  
  // Validation
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helperText?: string;
  
  // Styling
  className?: string;
  placeholder?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

// Modal/Dialog standardization
export interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  
  // Content
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  
  // Styling
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  
  // Animation
  animationConfig?: AnimationConfig;
}

// Button standardization
export interface StandardButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  
  // Icons
  leftIcon?: React.ComponentType;
  rightIcon?: React.ComponentType;
  
  // Styling
  className?: string;
  
  // HTML attributes
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  
  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

// Type guards for runtime type checking
export const isPhotoUploadStepData = (data: any): data is PhotoUploadStepData => {
  return data && (
    data.uploadedImage !== undefined || 
    data.selectedStyle !== undefined ||
    data.cropSettings !== undefined
  );
};

export const isCanvasConfigurationStepData = (data: any): data is CanvasConfigurationStepData => {
  return data && (
    data.selectedOrientation !== undefined || 
    data.selectedSize !== undefined
  );
};

export const isCustomizationStepData = (data: any): data is CustomizationStepData => {
  return data && data.customizations !== undefined;
};

export const isReviewOrderStepData = (data: any): data is ReviewOrderStepData => {
  return data && data.orderSummary !== undefined;
};

// Utility types for prop combination
export type StepPropsWithData<T> = BaseStepProps & DataFlowProps<T>;
export type FullStepProps<T> = BaseStepProps & 
  InteractionStateProps & 
  DataFlowProps<T> & 
  PerformanceProps & 
  AccessibilityProps;

// Export all step data types as union
export type AnyStepData = 
  | PhotoUploadStepData 
  | CanvasConfigurationStepData 
  | CustomizationStepData 
  | ReviewOrderStepData;

// Common validation schemas (to be used with zod or similar)
export interface ValidationSchema<T> {
  validate: (data: T) => { isValid: boolean; errors: string[] };
  sanitize?: (data: T) => T;
}