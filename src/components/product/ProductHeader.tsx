
import { Badge } from "@/components/ui/badge";
import StreamlinedProgress from "./components/StreamlinedProgress";
import { Shield, Truck, Award, Upload, Sparkles, Timer, Zap, Crown, Star, TrendingUp, Users2, Clock } from "lucide-react";
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
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
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
    <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-b border-purple-100 overflow-hidden min-h-screen flex items-center">
      {/* Expansive Dynamic Background Elements */}
      <div className="absolute inset-0">
        {/* Large animated gradient orbs spanning full width */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-400/30 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/30 to-purple-400/30 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-orange-300/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-cyan-200/25 to-blue-300/25 rounded-full blur-3xl animate-[float_7s_ease-in-out_infinite]"></div>
        
        {/* Extended grid pattern to edges */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.4) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Decorative side elements */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-32 h-96 bg-gradient-to-r from-purple-100/40 to-transparent blur-2xl"></div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-32 h-96 bg-gradient-to-l from-blue-100/40 to-transparent blur-2xl"></div>
      </div>

      {/* Full-width container with expanded content */}
      <div className="relative w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-12 md:py-16">
        
        {/* Side Stats - Left */}
        <div className="hidden lg:block absolute left-8 top-1/2 transform -translate-y-1/2 space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-100 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{todayCreations.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Created Today</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-emerald-100 text-center">
            <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-700">{avgTime}s</div>
            <div className="text-xs text-gray-600">Avg Time</div>
          </div>
        </div>

        {/* Side Stats - Right */}
        <div className="hidden lg:block absolute right-8 top-1/2 transform -translate-y-1/2 space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-blue-100 text-center">
            <Users2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{liveUsers}</div>
            <div className="text-xs text-gray-600">Creating Now</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-pink-100 text-center">
            <Star className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-700">4.9</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
        </div>

        {/* Main content area - adjusted for side elements */}
        <div className="max-w-5xl mx-auto lg:px-24">
          
          {/* Centered Live Social Proof */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-sm px-8 py-4 rounded-full border border-purple-200/60 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-emerald-700 font-bold text-lg">
                  {liveUsers} people creating art right now
                </span>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="text-gray-700 text-lg font-semibold">
                {todayCreations.toLocaleString()} created today
              </div>
            </div>
          </div>

          {/* Enhanced Headline Section */}
          <div className="text-center mb-16">
            {/* Pre-headline with expanded visual treatment */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 text-purple-600 font-bold text-xl bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-3 rounded-full border border-purple-200/50">
                <Crown className="w-6 h-6" />
                Transform Any Photo Into Gallery-Quality Art
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            {/* Massive Headlines */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight mb-8 leading-[0.85]">
              <div className="bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text text-transparent mb-3">
                Your Photo
              </div>
              <div className="text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent font-black">
                REIMAGINED
              </div>
              <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-700 font-normal mt-6">
                in {avgTime} seconds by AI
              </div>
            </h1>

            {/* Expanded Value Proposition */}
            <p className="text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Our AI transforms your precious memories into <span className="font-bold text-purple-700">museum-grade canvas art</span> using 15 distinct artistic styles. No artistic skills required.
            </p>
          </div>

          {/* Mega CTA Section - Enhanced */}
          <div className="flex flex-col items-center gap-8 mb-16">
            {/* Enhanced Main CTA */}
            <div className="relative group">
              {/* Enhanced multi-layer glow system */}
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full blur-2xl opacity-60 group-hover:opacity-80 animate-[magical-glow_4s_ease-in-out_infinite] transition-all duration-500"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-40 group-hover:opacity-60 animate-[magical-glow_3s_ease-in-out_infinite_reverse] transition-all duration-300"></div>
              
              {/* Enhanced floating particles */}
              <div className="absolute inset-0 overflow-visible rounded-full pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-[magical-particles_${4 + i}s_ease-in-out_infinite] opacity-70 shadow-lg`}
                    style={{
                      top: `${10 + (i * 8) % 80}%`,
                      left: `${10 + (i * 15) % 80}%`,
                      animationDelay: `${i * 0.4}s`
                    }}
                  ></div>
                ))}
              </div>
              
              {/* The Mega Button */}
              <Button 
                onClick={handleUploadClick} 
                className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-20 py-10 text-3xl font-black rounded-full shadow-2xl hover:shadow-purple-500/60 transform hover:scale-[1.02] transition-all duration-300 border-3 border-white/30 backdrop-blur-sm group-hover:border-white/50"
              >
                <Upload className="w-8 h-8 mr-6" />
                Upload Your Photo & Start Creating
                <Sparkles className="w-7 h-7 ml-6 animate-spin" />
              </Button>
            </div>
            
            {/* Enhanced reassurance section */}
            <div className="text-center space-y-4">
              <div className="text-purple-700 font-bold text-2xl">
                ✨ Your masterpiece ready in under 2 minutes
              </div>
              <div className="flex items-center justify-center gap-8 text-lg text-gray-600">
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  100% Secure
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  30-day guarantee
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Instant preview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress - only when needed */}
        {progressPercentage > 0 && (
          <div className="max-w-4xl mx-auto">
            <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />
          </div>
        )}

        {/* Expanded Trust Indicators - Full Width Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-16 max-w-7xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-700 text-xl">Premium Quality</div>
                <div className="text-sm text-purple-600">Museum-grade canvas</div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-green-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-green-700 text-xl">Secure Checkout</div>
                <div className="text-sm text-green-600">SSL protected</div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-700 text-xl">Free Shipping</div>
                <div className="text-sm text-blue-600">Orders $75+</div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-orange-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-4 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 shadow-xl">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-700 text-xl">Fast Processing</div>
                <div className="text-sm text-orange-600">Under 2 minutes</div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-xl">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-pink-700 text-xl">AI Powered</div>
                <div className="text-sm text-pink-600">15 unique styles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="flex flex-col items-center mt-20 text-center">
          <div className="text-purple-600 font-bold text-2xl mb-4">
            Choose Your Photo & Style Below ↓
          </div>
          <div className="w-8 h-14 border-3 border-purple-300 rounded-full flex justify-center">
            <div className="w-2 h-4 bg-purple-500 rounded-full mt-3 animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Custom CSS for advanced animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-15px) translateX(10px); }
          66% { transform: translateY(-10px) translateX(-5px); }
        }
        @keyframes magical-glow {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.9; transform: scale(1.05) rotate(180deg); }
        }
        @keyframes magical-particles {
          0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.7; }
          25% { transform: translateY(-15px) translateX(8px) scale(1.3); opacity: 1; }
          50% { transform: translateY(-25px) translateX(-8px) scale(0.8); opacity: 0.5; }
          75% { transform: translateY(-20px) translateX(12px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default ProductHeader;
