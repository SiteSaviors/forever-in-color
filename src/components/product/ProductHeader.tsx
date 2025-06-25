
import { Badge } from "@/components/ui/badge";
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
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-b border-purple-100 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Content */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                ✨ AI-Powered Art Creation
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                {Math.round(progressPercentage)}% Complete
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-poppins font-bold tracking-tighter mb-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Create Your Masterpiece
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your precious memories into stunning canvas art with AI-powered artistic styles and magical AR experiences
            </p>
          </div>

          {/* Step Progress */}
          <StepProgress 
            currentStep={currentStep}
            completedSteps={completedSteps}
            totalSteps={totalSteps}
          />

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mt-8">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              <span>Free Shipping Over $75</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Premium Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
