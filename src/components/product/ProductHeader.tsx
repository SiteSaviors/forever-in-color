
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Content - Simplified */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
              ✨ AI-Powered Art Creation
            </Badge>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-poppins font-bold tracking-tighter mb-3 md:mb-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Create Your Masterpiece
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your precious memories into stunning canvas art with AI-powered artistic styles
          </p>
        </div>

        {/* Simplified Step Progress */}
        <StepProgress 
          currentStep={currentStep}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
        />

        {/* Trust Indicators - Simplified for mobile */}
        <div className="flex items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-gray-600 mt-6 md:mt-8">
          <div className="flex items-center gap-1 md:gap-2">
            <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
            <span className="hidden sm:inline">Secure Checkout</span>
            <span className="sm:hidden">Secure</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Truck className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
            <span className="hidden sm:inline">Free Shipping Over $75</span>
            <span className="sm:hidden">Free Ship $75+</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
            <span className="hidden sm:inline">Premium Quality</span>
            <span className="sm:hidden">Premium</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
