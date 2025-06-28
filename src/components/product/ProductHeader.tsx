import { Badge } from "@/components/ui/badge";
import StreamlinedProgress from "./components/StreamlinedProgress";
import { Shield, Truck, Award, Upload, Sparkles, Timer, Zap, Crown, Star } from "lucide-react";
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
  const [todayCreations, setTodayCreations] = useState(2847);
  const [avgTime, setAvgTime] = useState(87);

  // Simulate live activity with more dynamic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(85, prev + Math.floor(Math.random() * 5) - 2));
      setTodayCreations(prev => prev + (Math.random() > 0.3 ? 1 : 0));
      setAvgTime(prev => Math.min(120, Math.max(60, prev + Math.floor(Math.random() * 6) - 3)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadClick = () => {
    // First, ensure we're on step 1 and that it gets activated
    if (onUploadClick) {
      onUploadClick();
    }
    
    // Dispatch custom event to notify Step 1 of hero button activation
    window.dispatchEvent(new CustomEvent('heroButtonClicked'));
    
    // Trigger the photo upload interface directly
    setTimeout(() => {
      // Find and click the file input to open file picker
      const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      } else {
        // If no file input found, try to find the upload dropzone and trigger it
        const uploadDropzone = document.querySelector('[data-upload-dropzone]') as HTMLElement;
        if (uploadDropzone) {
          uploadDropzone.click();
        }
      }
    }, 300); // Small delay to ensure Step 1 is expanded first
    
    // Small delay to ensure state updates, then scroll to step 1
    setTimeout(() => {
      const step1Element = document.querySelector('[data-step="1"]');
      if (step1Element) {
        // Scroll to the step with proper offset
        const elementTop = step1Element.getBoundingClientRect().top + window.pageYOffset;
        const offsetTop = elementTop - 120; // Account for header height
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-b border-purple-100 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-200/15 to-orange-300/15 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Live Social Proof - Single Powerful Element */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-200/50 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 font-semibold text-sm">
                {liveUsers} people creating art right now
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-gray-600 text-sm font-medium">
              {todayCreations.toLocaleString()} created today
            </div>
          </div>
        </div>

        {/* Revolutionary Headline Section */}
        <div className="text-center mb-12">
          {/* Pre-headline - Benefit Hook */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 text-purple-600 font-medium text-lg">
              <Crown className="w-5 h-5" />
              Transform Any Photo Into Gallery-Quality Art
            </span>
          </div>

          {/* Main Headline - Emotional + Benefit */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.9]">
            <div className="bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text text-transparent mb-2">
              Your Photo
            </div>
            <div className="text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent font-black">
              REIMAGINED
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl text-gray-700 font-normal mt-4">
              in {avgTime} seconds by AI
            </div>
          </h1>

          {/* Enhanced Value Proposition */}
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Our AI transforms your precious memories into <span className="font-semibold text-purple-700">museum-grade canvas art</span> using 15 distinct artistic styles. No artistic skills required.
          </p>
        </div>

        {/* Mega CTA Section - The Conversion Powerhouse */}
        <div className="flex flex-col items-center gap-6 mb-12">
          {/* Main CTA with Advanced Animation */}
          <div className="relative group">
            {/* Multi-layer glow system */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full blur-xl opacity-70 group-hover:opacity-90 animate-[magical-glow_4s_ease-in-out_infinite] transition-all duration-500"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full blur-lg opacity-50 group-hover:opacity-70 animate-[magical-glow_3s_ease-in-out_infinite_reverse] transition-all duration-300"></div>
            
            {/* Enhanced floating particles system */}
            <div className="absolute inset-0 overflow-visible rounded-full pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-1 bg-yellow-${300 + (i % 2) * 100} rounded-full animate-[magical-particles_${4 + i}s_ease-in-out_infinite] opacity-80`}
                  style={{
                    top: `${20 + (i * 15) % 60}%`,
                    left: `${15 + (i * 20) % 70}%`,
                    animationDelay: `${i * 0.5}s`
                  }}
                ></div>
              ))}
            </div>
            
            {/* The Button - Conversion Optimized */}
            <Button 
              onClick={handleUploadClick} 
              className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-16 py-8 text-2xl font-black rounded-full shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all duration-300 border-2 border-white/20 backdrop-blur-sm group-hover:border-white/40"
            >
              <Upload className="w-7 h-7 mr-4" />
              Upload Your Photo & Start Creating
              <Sparkles className="w-6 h-6 ml-4 animate-spin" />
            </Button>
          </div>
          
          {/* Urgency + Reassurance Under Button */}
          <div className="text-center space-y-2">
            <div className="text-purple-700 font-bold text-lg">
              ✨ Your masterpiece ready in under 2 minutes
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" />
                100% Secure
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                30-day guarantee
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-500" />
                Instant preview
              </span>
            </div>
          </div>
        </div>

        {/* Streamlined Progress - Only show when needed */}
        {progressPercentage > 0 && <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />}

        {/* Premium Trust Indicators - Redesigned */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-700 text-lg">Premium Quality</div>
                <div className="text-sm text-purple-600">Museum-grade canvas</div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700 text-lg">Secure Checkout</div>
                <div className="text-sm text-green-600">SSL protected</div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700 text-lg">Free Shipping</div>
                <div className="text-sm text-blue-600">Orders $75+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Conversion Critical */}
        <div className="flex flex-col items-center mt-16 text-center">
          <div className="text-purple-600 font-medium text-lg mb-3">
            Choose Your Photo & Style Below ↓
          </div>
          <div className="w-6 h-10 border-2 border-purple-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-purple-500 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Custom CSS for advanced animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes magical-glow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes magical-particles {
          0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.8; }
          25% { transform: translateY(-10px) translateX(5px) scale(1.2); opacity: 1; }
          50% { transform: translateY(-20px) translateX(-5px) scale(0.8); opacity: 0.6; }
          75% { transform: translateY(-15px) translateX(8px) scale(1.1); opacity: 0.9; }
          100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default ProductHeader;
