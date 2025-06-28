
import { Badge } from "@/components/ui/badge";
import StreamlinedProgress from "./components/StreamlinedProgress";
import { Shield, Truck, Award, Upload, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
  currentStep?: number;
  onUploadClick?: () => void;
}

const ProductHeader = ({
  completedSteps,
  totalSteps,
  currentStep = 1,
  onUploadClick
}: ProductHeaderProps) => {
  const progressPercentage = completedSteps.length / totalSteps * 100;
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

  const handleUploadClick = () => {
    // Directly trigger the file input instead of scrolling
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      // Fallback: scroll to upload section if file input not found
      const uploadSection = document.querySelector('[data-step="1"]');
      if (uploadSection) {
        uploadSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
    onUploadClick?.();
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Integrated Notification Bar */}
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 bg-green-100/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-medium text-sm">{liveUsers} creating art now</span>
          </div>
          
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Art Creation
          </Badge>
          
          <Badge variant="outline" className={`border-2 transition-all duration-500 ${progressPercentage > 0 ? 'bg-green-100 text-green-700 border-green-300' : 'bg-orange-100 text-orange-700 border-orange-300'}`}>
            {progressPercentage > 0 ? `${Math.round(progressPercentage)}% Complete` : 'Ready to Start'}
          </Badge>
        </div>

        {/* Clean Header Content */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Create Your Masterpiece
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Transform your precious memories into stunning canvas art with AI-powered artistic styles
          </p>

          {/* Primary CTA Button - Enhanced for conversion optimization */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <Button 
              onClick={handleUploadClick} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none min-w-fit whitespace-nowrap"
            >
              <Upload className="w-6 h-6 mr-3" />
              Upload Your Photo & Start Creating
            </Button>
            
            {/* Motivational message moved below button */}
            <div className="text-purple-600 font-medium text-sm opacity-80">
              ✨ {getMotivationalMessage()}
            </div>
          </div>
        </div>

        {/* Streamlined Progress - Only show when needed */}
        {progressPercentage > 0 && <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />}

        {/* Trust Indicators - Enhanced with gradient styling */}
        <div className="grid grid-cols-3 gap-6 text-center mt-8">
          <div className="flex flex-col items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-green-100">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-green-700">Secure</div>
            <div className="text-xs text-green-600">SSL Protected</div>
          </div>
          <div className="flex flex-col items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-blue-700">Free Shipping</div>
            <div className="text-xs text-blue-600">Orders $75+</div>
          </div>
          <div className="flex flex-col items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-semibold text-purple-700">Premium Quality</div>
            <div className="text-xs text-purple-600">Museum grade</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
