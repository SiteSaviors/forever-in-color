
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
  const [liveUsers, setLiveUsers] = useState(347); // Increased from 127
  const [recentOrders, setRecentOrders] = useState(8); // Increased from 3

  // Simulate live activity
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2); // Enhanced fluctuation
      if (Math.random() > 0.6) { // More frequent updates
        setRecentOrders(prev => prev + 1);
      }
    }, 6000); // Faster updates
    return () => clearInterval(interval);
  }, []);

  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "✨ Start your masterpiece in under 90 seconds";
    if (progressPercentage < 50) return "🎨 Amazing progress! Keep creating";
    if (progressPercentage < 100) return "🚀 Almost there! Complete your masterpiece";
    return "🎉 Order complete! Thank you for choosing us";
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
    <div className="bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900 relative overflow-hidden">
      {/* Enhanced Dynamic Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-br from-pink-400/25 via-fuchsia-500/20 to-violet-600/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-br from-emerald-400/20 via-teal-500/15 to-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:24px_24px] opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {/* Enhanced Notification Bar */}
        <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-xl px-5 py-3 rounded-full border border-emerald-400/30 shadow-lg">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <span className="text-emerald-100 font-semibold text-sm tracking-wide">{liveUsers} creating art now</span>
          </div>
          
          <Badge className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 backdrop-blur-xl text-violet-100 border-violet-300/30 px-4 py-2 shadow-lg">
            <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
            AI-Powered Art Creation
          </Badge>
          
          <Badge className={`border-2 transition-all duration-500 px-4 py-2 backdrop-blur-xl shadow-lg ${
            progressPercentage > 0 
              ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-100 border-emerald-300/50' 
              : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-100 border-amber-300/50'
          }`}>
            {progressPercentage > 0 ? `${Math.round(progressPercentage)}% Complete` : 'Ready to Start'}
          </Badge>
        </div>

        {/* Enhanced Header Content */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.9]">
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-2xl">
              Create Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
              MASTERPIECE
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-violet-100 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
            Transform your precious memories into <span className="text-cyan-300 font-bold">stunning canvas art</span> with 
            <span className="text-fuchsia-300 font-bold"> AI-powered artistic styles</span>
          </p>

          {/* Enhanced Motivational Progress Message */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl px-8 py-4 inline-block mb-10 border border-white/20 shadow-2xl">
            <span className="text-white font-bold text-lg tracking-wide">
              {getMotivationalMessage()}
            </span>
          </div>

          {/* Enhanced Primary CTA */}
          <Button 
            onClick={handleUploadClick} 
            className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-600 text-white px-12 py-6 text-xl font-black rounded-2xl shadow-2xl hover:shadow-fuchsia-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm mb-10"
          >
            <Upload className="w-6 h-6 mr-3" />
            {progressPercentage === 0 ? 'Upload Photo & Start Creating' : 'Continue Your Masterpiece'}
            <Sparkles className="w-6 h-6 ml-3 animate-pulse" />
          </Button>
        </div>

        {/* Streamlined Progress - Only show when needed */}
        {progressPercentage > 0 && <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />}

        {/* Enhanced Trust Indicators */}
        <div className="grid grid-cols-3 gap-8 text-center mt-12">
          <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-emerald-300/30 shadow-xl">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/25">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-lg font-bold text-emerald-100">Secure & Safe</div>
            <div className="text-sm text-emerald-200/80">SSL Protected</div>
          </div>
          <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/30 shadow-xl">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-blue-500/25">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div className="text-lg font-bold text-blue-100">Free Shipping</div>
            <div className="text-sm text-blue-200/80">Orders $75+</div>
          </div>
          <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-violet-300/30 shadow-xl">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 shadow-xl shadow-violet-500/25">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div className="text-lg font-bold text-violet-100">Premium Quality</div>
            <div className="text-sm text-violet-200/80">Museum grade</div>
          </div>
        </div>

        {/* Enhanced Social Proof Numbers */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-10 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-4xl font-black text-cyan-300 mb-1">25K+</div>
            <div className="text-sm text-cyan-200/80 font-medium">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-fuchsia-300 mb-1">4.9★</div>
            <div className="text-sm text-fuchsia-200/80 font-medium">Perfect Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-violet-300 mb-1">15</div>
            <div className="text-sm text-violet-200/80 font-medium">Art Styles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
