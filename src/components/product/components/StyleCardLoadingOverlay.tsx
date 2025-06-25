
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Sparkles, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getZIndexClass } from "@/utils/zIndexLayers";

interface StyleCardLoadingOverlayProps {
  isGenerating: boolean;
  styleName: string;
  error?: string | null;
}

/**
 * StyleCardLoadingOverlay Component
 * 
 * Displays loading state and progress information during AI style generation.
 * Provides user feedback through animated progress indicators and status messages.
 * 
 * State Management:
 * - Progress tracks from 0-95% with realistic timing
 * - Step messages provide context about generation phases
 * - Error states use distinct visual treatment
 * 
 * Animation Strategy:
 * - Sparkles icon provides primary loading indicator
 * - Progress bar shows completion percentage
 * - Animated dots create continuous motion feedback
 * 
 * Z-Index Management:
 * - Uses STYLE_CARD_OVERLAYS layer to cover card content
 * - Error states use same layer with different visual treatment
 * - Ensures loading feedback is always visible above card background
 */
const StyleCardLoadingOverlay = ({ 
  isGenerating, 
  styleName, 
  error 
}: StyleCardLoadingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing...");

  /**
   * Generation step messages that correspond to AI processing phases
   * Provides users with context about what's happening during generation
   */
  const steps = [
    "Analyzing your photo...",
    "Applying AI transformation...",
    "Enhancing details...",
    "Adding watermark...",
    "Almost ready!"
  ];

  /**
   * Progress simulation effect
   * Creates realistic progress feedback with variable timing
   * Resets when generation starts/stops
   */
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setCurrentStep("Initializing...");
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Simulate realistic progress with variable increments
        const newProgress = Math.min(prev + Math.random() * 15, 95);
        
        // Update step message based on progress
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        setCurrentStep(steps[stepIndex] || steps[steps.length - 1]);
        
        return newProgress;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Error state with distinct visual treatment
  if (error && !isGenerating) {
    return (
      <div className={`absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center rounded-lg ${getZIndexClass('STYLE_CARD_OVERLAYS', 2)}`}>
        <div className="text-white text-center space-y-3 px-4">
          <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Generation Failed</p>
            <p className="text-xs text-red-200">Please try again</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not generating
  if (!isGenerating) return null;

  return (
    <div className={`absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg ${getZIndexClass('STYLE_CARD_OVERLAYS', 2)}`}>
      <div className="text-white text-center space-y-4 px-4">
        {/* Primary loading indicator with animated elements */}
        <div className="relative">
          <Sparkles className="w-8 h-8 mx-auto animate-pulse text-purple-400" />
          <div className="absolute inset-0 animate-spin">
            <div className="w-8 h-8 border-2 border-transparent border-t-white/50 rounded-full mx-auto"></div>
          </div>
        </div>

        {/* Progress information section */}
        <div className="space-y-2">
          <p className="text-sm font-semibold">Creating {styleName}...</p>
          <p className="text-xs text-gray-300">{currentStep}</p>
          
          {/* Progress bar with gradient styling */}
          <div className="w-32 mx-auto">
            <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Animated dots for continuous motion feedback */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
        </div>

        {/* Time estimation for user expectations */}
        <p className="text-xs text-gray-400">This usually takes 10-15 seconds</p>
      </div>
    </div>
  );
};

export default StyleCardLoadingOverlay;
