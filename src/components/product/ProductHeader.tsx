
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
}

const ProductHeader = ({ completedSteps, totalSteps }: ProductHeaderProps) => {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <section className="pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
            AI-Powered Art Creation
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
          Create Your Masterpiece
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform your precious memories into stunning canvas art with AI-powered artistic styles and magical AR experiences.
        </p>
        
        {/* Enhanced Progress Indicator */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">Your Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-purple-600">{Math.round(progressPercentage)}%</span>
              <span className="text-xs text-gray-500">Complete</span>
            </div>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-3 bg-gray-200" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" 
                 style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">{completedSteps.length} of {totalSteps} steps</span>
            <span className="text-xs text-purple-600 font-medium">
              {progressPercentage === 100 ? "🎉 Ready to order!" : "Keep going!"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHeader;
