
import { Loader2, Sparkles, Zap, CheckCircle2, Camera, Palette, Maximize } from "lucide-react";
import { useState, useEffect } from "react";

interface AIAnalysisStatusProps {
  isAnalyzing: boolean;
}

const AIAnalysisStatus = ({ isAnalyzing }: AIAnalysisStatusProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    { icon: Camera, text: "Analyzing composition", color: "text-purple-600" },
    { icon: Palette, text: "Detecting colors & contrast", color: "text-pink-600" },
    { icon: Maximize, text: "Finding optimal crop", color: "text-indigo-600" },
    { icon: Sparkles, text: "Creating magic", color: "text-purple-600" }
  ];

  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      setCurrentStage(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 15, 100);
        
        // Update stage based on progress
        if (newProgress < 25) setCurrentStage(0);
        else if (newProgress < 50) setCurrentStage(1);
        else if (newProgress < 75) setCurrentStage(2);
        else setCurrentStage(3);
        
        return newProgress;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  const CurrentIcon = stages[currentStage]?.icon || Sparkles;

  return (
    <div className="text-center py-8 space-y-8">
      {/* Main Analysis Card */}
      <div className="relative mx-auto max-w-lg">
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-8 shadow-2xl border border-purple-200/50">
          {/* Animated Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full shadow-lg flex items-center justify-center">
                <CurrentIcon className={`w-8 h-8 ${stages[currentStage]?.color} animate-bounce`} />
              </div>
              {/* Rotating ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Main Title with Gradient */}
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Analyzing composition...
          </h3>
          
          {/* Subtitle */}
          <p className="text-gray-600 mb-8 text-lg">
            AI is analyzing your photo for the perfect composition<br />
            and canvas format
          </p>

          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="text-gray-500 font-medium">
              {Math.round(progress)}% complete
            </div>
          </div>

          {/* Current Stage Indicator */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            <CurrentIcon className={`w-5 h-5 ${stages[currentStage]?.color}`} />
            <span className="text-gray-700 font-medium">
              {stages[currentStage]?.text}
            </span>
          </div>
        </div>
      </div>

      {/* Feature Icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {[
          { icon: "📷", text: "JPG, PNG, WebP" },
          { icon: "📏", text: "Up to 10MB" },
          { icon: "✨", text: "Auto-Crop" },
          { icon: "🤖", text: "AI Enhanced" }
        ].map((feature, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 p-3 bg-white/50 rounded-xl border border-purple-100">
            <span className="text-2xl">{feature.icon}</span>
            <span className="text-sm text-gray-600 font-medium">{feature.text}</span>
          </div>
        ))}
      </div>

      {/* Bottom Status Indicators */}
      <div className="flex justify-center space-x-8 text-sm">
        {[
          { icon: CheckCircle2, text: "Secure Upload", color: "text-green-600" },
          { icon: Sparkles, text: "AI Powered", color: "text-purple-600" },
          { icon: CheckCircle2, text: "100% Private", color: "text-green-600" }
        ].map((status, index) => (
          <div key={index} className="flex items-center space-x-2">
            <status.icon className={`w-4 h-4 ${status.color}`} />
            <span className="text-gray-600">{status.text}</span>
          </div>
        ))}
      </div>

      {/* Magic Button */}
      <div className="mt-6">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="font-medium">Creating Magic...</span>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisStatus;
