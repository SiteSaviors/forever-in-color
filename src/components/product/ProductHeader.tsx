
import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
}

const ProductHeader = ({ completedSteps, totalSteps }: ProductHeaderProps) => {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <section className="pt-20 md:pt-32 pb-8 md:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
          <span className="text-xs md:text-sm font-medium text-purple-600 bg-purple-100 px-2 md:px-3 py-1 rounded-full">
            AI-Powered Art Creation
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold font-poppins tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 md:mb-6">
          Create Your Masterpiece
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed">
          Transform your precious memories into stunning canvas art with AI-powered artistic styles and magical AR experiences.
        </p>
        
        {/* Compact Progress Indicator */}
        <div className="max-w-sm md:max-w-md mx-auto mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-2 md:mb-3">
            <span className="text-xs md:text-sm font-medium text-gray-600">Your Progress</span>
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-xs md:text-sm font-semibold text-purple-600">{Math.round(progressPercentage)}%</span>
              <span className="text-xs text-gray-500 hidden md:inline">Complete</span>
            </div>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-2 md:h-3 bg-gray-200" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" 
                 style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="flex justify-between mt-1 md:mt-2">
            <span className="text-xs text-gray-500">{completedSteps.length} of {totalSteps} steps</span>
            <span className="text-xs text-purple-600 font-medium">
              {progressPercentage === 100 ? "🎉 Ready!" : "Keep going!"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHeader;
