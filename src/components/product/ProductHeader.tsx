
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import StepProgress from "./components/StepProgress";
import { Shield, Truck, Award, Upload, Sparkles, Users, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
  currentStep?: number;
  onUploadClick?: () => void;
}

const ProductHeader = ({ completedSteps, totalSteps, currentStep = 1, onUploadClick }: ProductHeaderProps) => {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;
  const [liveUsers, setLiveUsers] = useState(127);
  const [recentOrders, setRecentOrders] = useState(3);

  // Simulate live activity
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
      if (Math.random() > 0.7) {
        setRecentOrders(prev => prev + 1);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "Start your masterpiece in under 2 minutes";
    if (progressPercentage < 50) return "You're doing great! Keep going";
    if (progressPercentage < 100) return "Almost there! Complete your order";
    return "Order complete! Thank you";
  };

  const scrollToUpload = () => {
    const uploadSection = document.querySelector('[data-step="1"]');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    onUploadClick?.();
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Urgency & Social Proof Bar */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-4 text-xs md:text-sm">
          <div className="flex items-center gap-2 bg-green-100/80 backdrop-blur-sm px-3 py-1 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium">{liveUsers} creating art now</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-200">
            <Timer className="w-3 h-3 text-blue-600" />
            <span className="text-blue-700 font-medium">{recentOrders} orders in last hour</span>
          </div>
        </div>

        {/* Enhanced Header Content */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 animate-pulse">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Art Creation
            </Badge>
            <Badge variant="outline" className={`border-2 transition-all duration-500 ${
              progressPercentage > 0 
                ? 'bg-green-100 text-green-700 border-green-300 shadow-md' 
                : 'bg-orange-100 text-orange-700 border-orange-300'
            }`}>
              {progressPercentage > 0 ? `${Math.round(progressPercentage)}% Complete` : 'Ready to Start'}
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-poppins font-bold tracking-tighter mb-3 md:mb-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Create Your Masterpiece
          </h1>
          
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Transform your precious memories into stunning canvas art with AI-powered artistic styles
          </p>

          {/* Motivational Progress Message */}
          <div className="bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 inline-block mb-6 border border-purple-100">
            <span className="text-purple-700 font-medium text-sm md:text-base">
              ✨ {getMotivationalMessage()}
            </span>
          </div>

          {/* Primary CTA - Only show if not started */}
          {progressPercentage === 0 && (
            <Button
              onClick={scrollToUpload}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 mb-6"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Your Photo & Start Creating
            </Button>
          )}
        </div>

        {/* Enhanced Step Progress */}
        <StepProgress 
          currentStep={currentStep}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
        />

        {/* Dynamic Trust Indicators */}
        <div className="grid grid-cols-3 gap-2 md:gap-8 text-xs md:text-sm text-gray-600 mt-6 md:mt-8">
          <div className="flex items-center justify-center gap-1 md:gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-green-100">
            <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
            <div className="text-center">
              <div className="font-semibold text-green-700 hidden sm:inline">Secure Checkout</div>
              <div className="font-semibold text-green-700 sm:hidden">Secure</div>
              <div className="text-xs text-green-600">SSL Protected</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 md:gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-blue-100">
            <Truck className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
            <div className="text-center">
              <div className="font-semibold text-blue-700 hidden sm:inline">Free Shipping $75+</div>
              <div className="font-semibold text-blue-700 sm:hidden">Free Ship</div>
              <div className="text-xs text-blue-600">2-3 days</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 md:gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-purple-100">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
            <div className="text-center">
              <div className="font-semibold text-purple-700 hidden sm:inline">Premium Quality</div>
              <div className="font-semibold text-purple-700 sm:hidden">Premium</div>
              <div className="text-xs text-purple-600">Museum grade</div>
            </div>
          </div>
        </div>

        {/* Achievement Unlocked Animation */}
        {progressPercentage > 0 && (
          <div className="flex items-center justify-center mt-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Award className="w-4 h-4" />
                <span>Great start! Keep going to unlock your masterpiece</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;
