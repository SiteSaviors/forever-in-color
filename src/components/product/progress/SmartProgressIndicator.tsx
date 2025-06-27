
import { useState, useEffect } from "react";
import { useProgressOrchestrator } from "./ProgressOrchestrator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Upload, Settings, Palette, ShoppingBag, Sparkles, TrendingUp, Users, Clock } from "lucide-react";

interface SmartProgressIndicatorProps {
  uploadedImage: string | null;
}

const SmartProgressIndicator = ({ uploadedImage }: SmartProgressIndicatorProps) => {
  const { state } = useProgressOrchestrator();
  const [showMilestone, setShowMilestone] = useState(false);

  const completedStepsCount = state.completedSteps?.length || 0;
  const overallProgress = Math.min((completedStepsCount / 4) * 100, 100);
  
  // Effect to handle milestone animations
  useEffect(() => {
    if (state.completedSteps && state.completedSteps.length > 0) {
      setShowMilestone(true);
      setTimeout(() => setShowMilestone(false), 3000);
    }
  }, [state.completedSteps]);

  // Don't render anything if no image is uploaded
  if (!uploadedImage) {
    return null;
  }

  const steps = [
    { id: 1, icon: Upload, title: "Photo & Style", completed: state.completedSteps?.includes(1) || false },
    { id: 2, icon: Settings, title: "Size & Format", completed: state.completedSteps?.includes(2) || false },
    { id: 3, icon: Palette, title: "Customize", completed: state.completedSteps?.includes(3) || false },
    { id: 4, icon: ShoppingBag, title: "Review & Order", completed: state.completedSteps?.includes(4) || false }
  ];

  const getCurrentStepMessage = () => {
    if (completedStepsCount === 0) return "AI is analyzing your photo for perfect recommendations";
    if (completedStepsCount === 1) return "Finding the ideal size for your space";
    if (completedStepsCount === 2) return "Adding premium finishing touches";
    if (completedStepsCount >= 3) return "Almost ready to transform your photo!";
    return "Getting started...";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
      {/* Milestone celebration overlay */}
      {showMilestone && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse z-10 pointer-events-none" />
      )}
      
      <div className="p-6">
        {/* Header with progress */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              Creating Your Masterpiece
              <Sparkles className="w-5 h-5 text-purple-500" />
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {getCurrentStepMessage()}
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-600">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">
                {overallProgress > 25 ? `${Math.floor(overallProgress)}% momentum` : "Building momentum..."}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {Math.round(overallProgress)}%
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-6">
          <Progress 
            value={overallProgress} 
            className="h-3 mb-2 bg-gray-100"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Started {Math.floor(state.conversionElements.timeSpentOnPlatform / 60)}m ago</span>
            <span>{4 - completedStepsCount} steps remaining</span>
          </div>
        </div>

        {/* Horizontal Step Flow */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = state.currentStep === step.id;
            const isLast = index === steps.length - 1;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  step.completed 
                    ? 'bg-green-500 text-white shadow-lg scale-110' 
                    : isActive 
                      ? 'bg-purple-500 text-white shadow-lg animate-pulse' 
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  
                  {/* Active indicator */}
                  {isActive && !step.completed && (
                    <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping" />
                  )}
                </div>

                {/* Step Label */}
                <div className={`ml-3 flex-1 ${isLast ? '' : 'mr-4'}`}>
                  <div className={`text-sm font-medium transition-colors ${
                    step.completed ? 'text-green-700' : isActive ? 'text-purple-700' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  {step.completed && (
                    <div className="text-xs text-green-600 font-medium">✓ Complete</div>
                  )}
                  {isActive && !step.completed && (
                    <div className="text-xs text-purple-600 font-medium">In progress...</div>
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    step.completed ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Compact Social Proof */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-green-700">
                <Users className="w-4 h-4" />
                <span className="font-semibold">89% complete their masterpiece</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs">23 creating now</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">47 completed today</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Motivational message */}
          <div className="mt-2 text-xs text-gray-700 bg-white/50 rounded px-3 py-1 inline-block">
            🎨 Join thousands creating their perfect canvas art today!
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartProgressIndicator;
