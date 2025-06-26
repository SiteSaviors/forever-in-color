
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import StepProgress from "./components/StepProgress";
import { Shield, Truck, Award } from "lucide-react";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
  currentStep?: number;
}

const ProductHeader = ({ completedSteps, totalSteps, currentStep = 1 }: ProductHeaderProps) => {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Content - Mobile optimized */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-xs sm:text-sm px-2 sm:px-3 py-1">
              ✨ AI-Powered Art Creation
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs sm:text-sm px-2 sm:px-3 py-1">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold tracking-tighter mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
            Create Your Masterpiece
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0 leading-relaxed">
            Transform your precious memories into stunning canvas art with AI-powered artistic styles and magical AR experiences
          </p>
        </div>

        {/* Step Progress */}
        <StepProgress 
          currentStep={currentStep}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
        />

        {/* Enhanced Trust Indicators for mobile */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 mt-6 sm:mt-8">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span>Free Shipping Over $75</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <span>Premium Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
