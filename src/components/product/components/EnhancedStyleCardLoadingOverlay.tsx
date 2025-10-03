
import { Sparkles, AlertCircle, CheckCircle, Zap, Wand2 } from "@/components/ui/icons";
import { useState, useEffect } from "react";

interface EnhancedStyleCardLoadingOverlayProps {
  isBlinking: boolean; // Keep for compatibility but won't be used for blinking
  isLoading?: boolean; // New prop to control loading display
  styleName: string;
  error?: string | null;
  onRetry?: () => void;
}

const EnhancedStyleCardLoadingOverlay = ({
  isBlinking: _isBlinking,
  isLoading = false,
  styleName,
  error,
  onRetry
}: EnhancedStyleCardLoadingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const generationSteps = [
    { label: "Analyzing your photo...", icon: Wand2, color: "text-blue-400" },
    { label: "Applying AI transformation...", icon: Sparkles, color: "text-purple-400" },
    { label: "Enhancing artistic details...", icon: Zap, color: "text-pink-400" },
    { label: "Adding final touches...", icon: CheckCircle, color: "text-green-400" },
    { label: "Almost ready!", icon: CheckCircle, color: "text-green-400" }
  ];

  // Show loading state based on isLoading prop instead of isBlinking
  const showLoadingState = isLoading && !error;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let stepInterval: NodeJS.Timeout;

    if (showLoadingState) {
      setProgress(0);
      setCurrentStep(0);
      setShowSuccess(false);

      // Progress animation
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + Math.random() * 12 + 3, 95);
          return newProgress;
        });
      }, 600);

      // Step progression
      stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = Math.min(prev + 1, generationSteps.length - 1);
          return nextStep;
        });
      }, 2800);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [showLoadingState, generationSteps.length]);

  // Success state animation
  useEffect(() => {
    if (!showLoadingState && !error && progress > 0) {
      setProgress(100);
      setShowSuccess(true);
      const timeout = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [showLoadingState, error, progress]);

  // Error state
  if (error && !showLoadingState) {
    return (
      <div 
        className="absolute inset-0 bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl animate-scale-in"
        role="alert"
        aria-live="assertive"
        aria-label={`Generation failed for ${styleName}`}
      >
        <div className="text-white text-center space-y-4 px-4 animate-fade-in max-w-[90%]">
          <div className="relative">
            <AlertCircle className="w-10 h-10 mx-auto text-red-300 animate-pulse" />
            <div className="absolute inset-0 w-10 h-10 mx-auto border-2 border-red-300/30 rounded-full animate-ping"></div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-bold">Generation Failed</p>
            <p className="text-xs text-red-200 max-w-40 mx-auto leading-relaxed">
              {error.includes('rate limit') ? 'Too many requests. Please wait a moment.' :
               error.includes('network') ? 'Connection issue. Please check your internet.' :
               'Something went wrong. Let\'s try again.'}
            </p>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 mx-auto transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={`Retry generation for ${styleName}`}
            >
              <AlertCircle className="w-4 h-4 animate-spin" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-emerald-600/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl animate-scale-in">
        <div className="text-white text-center space-y-4 px-4 animate-bounce max-w-[90%]">
          <div className="relative">
            <CheckCircle className="w-12 h-12 mx-auto text-green-200 animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 mx-auto border-2 border-green-200/50 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold truncate">{styleName} Ready!</p>
            <p className="text-xs text-green-100">Your masterpiece is complete</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state - show based on isLoading instead of isBlinking
  if (!showLoadingState) {
    return null;
  }

  const currentStepData = generationSteps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div 
      className="absolute inset-0 bg-gradient-to-br from-purple-900/85 to-pink-900/85 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl animate-scale-in"
      role="status"
      aria-live="polite"
      aria-label={`Generating ${styleName}: ${Math.round(progress)}% complete`}
    >
      <div className="text-white text-center space-y-4 px-3 max-w-[90%] w-full">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-12 h-12 mx-auto relative">
            <StepIcon className={`w-12 h-12 ${currentStepData.color} animate-pulse z-10 relative`} />
            <div className="absolute inset-0 animate-spin">
              <div className="w-12 h-12 border-3 border-transparent border-t-white/40 border-r-white/20 rounded-full"></div>
            </div>
            <div className="absolute inset-2 animate-ping">
              <div className="w-8 h-8 border border-white/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Progress Info - PRESERVED LOADING TEXT */}
        <div className="space-y-3 w-full">
          <div className="space-y-1">
            <p className="text-sm font-bold animate-pulse truncate px-1">
              Creating {styleName}...
            </p>
            <p className="text-xs text-purple-200 animate-fade-in truncate px-1" key={currentStep}>
              {currentStepData.label}
            </p>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="w-full max-w-40 mx-auto space-y-2">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-ping"></div>
            </div>
            <div className="flex justify-between text-xs text-purple-200">
              <span>{Math.round(progress)}%</span>
              <span className="animate-pulse">◦ ◦ ◦</span>
            </div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2">
          {generationSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-white scale-110 animate-pulse' 
                  : 'bg-white/30 scale-100'
              }`}
              aria-label={`Step ${index + 1} ${index <= currentStep ? 'completed' : 'pending'}`}
            />
          ))}
        </div>

        <p className="text-xs text-purple-300 animate-fade-in truncate px-1">
          ✨ This usually takes 10-15 seconds
        </p>
      </div>
    </div>
  );
};

export default EnhancedStyleCardLoadingOverlay;
