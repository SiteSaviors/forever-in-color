
import { Sparkles, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface StyleCardLoadingOverlayProps {
  isBlinking: boolean; // STEP 3: Single source of truth from useBlinking hook
  styleName: string;
  error?: string | null;
}

const StyleCardLoadingOverlay = ({ isBlinking, styleName, error }: StyleCardLoadingOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing...");

  const steps = [
    "Analyzing your photo...",
    "Applying AI transformation...",
    "Enhancing details...",
    "Adding watermark...",
    "Almost ready!"
  ];

  // Mount/unmount logging
  useEffect(() => {
    console.log('🔄 StyleCardLoadingOverlay MOUNTED for:', styleName, { isBlinking, error });
    return () => {
      console.log('🔄 StyleCardLoadingOverlay UNMOUNTED for:', styleName);
    };
  }, []);

  // STEP 3: Remove all blink logic - only use the passed isBlinking prop
  useEffect(() => {
    console.log('🔄 StyleCardLoadingOverlay state change:', styleName, { 
      isBlinking, 
      error,
      willShow: isBlinking && !error
    });
  }, [isBlinking, error, styleName]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isBlinking) {
      console.log('🚀 Starting progress animation for:', styleName);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + Math.random() * 15, 95);
          const stepIndex = Math.floor((newProgress / 100) * steps.length);
          setCurrentStep(steps[stepIndex] || steps[steps.length - 1]);
          return newProgress;
        });
      }, 800);
    } else {
      console.log('⏹️ Stopping progress animation for:', styleName);
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        console.log('🧹 Cleared progress interval for:', styleName);
      }
    };
  }, [isBlinking, styleName]);

  // Error state - only show if there's an error and not blinking
  if (error && !isBlinking) {
    console.log('❌ Showing error state for:', styleName);
    return (
      <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
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

  // STEP 3: Only show when actually blinking (single source of truth)
  if (!isBlinking) {
    console.log('👻 StyleCardLoadingOverlay not rendering - not blinking:', styleName);
    return null;
  }

  console.log('✅ StyleCardLoadingOverlay rendering for:', styleName);

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
      <div className="text-white text-center space-y-4 px-4">
        {/* STEP 4: CSS animation with controlled blinking */}
        <div className="relative">
          <Sparkles className={`w-8 h-8 mx-auto text-purple-400 ${isBlinking ? 'animate-pulse' : ''}`} />
          <div className="absolute inset-0 animate-spin">
            <div className="w-8 h-8 border-2 border-transparent border-t-white/50 rounded-full mx-auto"></div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Creating {styleName}...</p>
          <p className="text-xs text-gray-300">{currentStep}</p>
          
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

        {/* STEP 4: Controlled CSS animation */}
        <div className="flex justify-center space-x-1">
          <div className={`w-2 h-2 bg-purple-400 rounded-full ${isBlinking ? 'animate-bounce' : ''}`}></div>
          <div className={`w-2 h-2 bg-purple-400 rounded-full ${isBlinking ? 'animate-bounce delay-150' : ''}`}></div>
          <div className={`w-2 h-2 bg-purple-400 rounded-full ${isBlinking ? 'animate-bounce delay-300' : ''}`}></div>
        </div>

        <p className="text-xs text-gray-400">This usually takes 10-15 seconds</p>
      </div>
    </div>
  );
};

export default StyleCardLoadingOverlay;
