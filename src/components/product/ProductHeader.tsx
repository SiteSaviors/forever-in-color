import { Badge } from "@/components/ui/badge";
import StreamlinedProgress from "./components/StreamlinedProgress";
import { Shield, Truck, Award, Upload, Sparkles, Timer, Zap, Crown, Star, TrendingUp, Users2, Clock, AlertCircle, Flame, Eye } from "lucide-react";
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
  const [urgencyTimer, setUrgencyTimer] = useState(847);
  const [viewersCount, setViewersCount] = useState(23);

  // Enhanced live activity simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => Math.max(85, prev + Math.floor(Math.random() * 8) - 3));
      setTodayCreations(prev => prev + (Math.random() > 0.2 ? 1 : 0));
      setAvgTime(prev => Math.min(120, Math.max(60, prev + Math.floor(Math.random() * 6) - 3)));
      setUrgencyTimer(prev => Math.max(100, prev - Math.floor(Math.random() * 3)));
      setViewersCount(prev => Math.max(15, prev + Math.floor(Math.random() * 6) - 2));
    }, 3000);
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
      {/* Ultra-Dynamic Background - Full Viewport Coverage */}
      <div className="absolute inset-0">
        {/* Massive gradient orbs spanning entire viewport */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-purple-300/40 to-pink-400/40 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] bg-gradient-to-br from-blue-300/40 to-purple-400/40 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-pink-200/30 to-orange-300/30 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-gradient-to-br from-cyan-200/35 to-blue-300/35 rounded-full blur-3xl animate-[float_7s_ease-in-out_infinite]"></div>
        
        {/* Enhanced grid pattern covering full viewport */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.6) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>

        {/* Full-height side gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-purple-100/50 to-transparent"></div>
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-blue-100/50 to-transparent"></div>
      </div>

      {/* Full-Width Container - No Max Width Restrictions */}
      <div className="relative w-full min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Ultra-Premium Top Bar - Full Width */}
        <div className="w-full mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl border border-purple-200/60 shadow-2xl">
            {/* Scarcity & Urgency Section */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-red-600">
                <Flame className="w-5 h-5 animate-pulse" />
                <span className="font-bold text-sm">Only {urgencyTimer} spots left today!</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <Eye className="w-5 h-5" />
                <span className="font-semibold text-sm">{viewersCount} watching now</span>
              </div>
            </div>

            {/* Live Social Proof - Enhanced */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-emerald-700 font-bold text-sm">
                  {liveUsers} creating art now
                </span>
              </div>
              <div className="text-gray-700 font-semibold text-sm">
                {todayCreations.toLocaleString()} created today
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Full Width Utilization */}
        <div className="grid grid-cols-12 gap-8 items-center">
          
          {/* Left Side - Dynamic Stats & Social Proof */}
          <div className="col-span-12 lg:col-span-2 order-2 lg:order-1">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-purple-100 text-center hover:scale-105 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{todayCreations.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Art Created</div>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-emerald-100 text-center hover:scale-105 transition-transform duration-300">
                <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-700">{avgTime}s</div>
                <div className="text-xs text-gray-600">Avg Time</div>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-blue-100 text-center hover:scale-105 transition-transform duration-300 lg:block">
                <Users2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{liveUsers}</div>
                <div className="text-xs text-gray-600">Live Users</div>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-pink-100 text-center hover:scale-105 transition-transform duration-300 lg:block">
                <Star className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-pink-700">4.9</div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
            </div>
          </div>

          {/* Center - Main Hero Content */}
          <div className="col-span-12 lg:col-span-8 order-1 lg:order-2 text-center">
            
            {/* Pre-headline with Enhanced Social Proof */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 text-purple-600 font-bold text-lg lg:text-xl bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-full border border-purple-200/50 mb-4">
                <Crown className="w-6 h-6" />
                Transform Any Photo Into Gallery-Quality Art
                <Sparkles className="w-6 h-6" />
              </div>
              
              {/* Urgency Banner */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 px-4 py-2 rounded-full border border-red-200/50 text-red-700 text-sm font-semibold">
                <AlertCircle className="w-4 h-4" />
                Limited Time: 67% OFF - Ends in {Math.floor(urgencyTimer/60)}h {urgencyTimer%60}m
              </div>
            </div>

            {/* Massive Headlines - Optimized for Impact */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight mb-8 leading-[0.85]">
              <div className="bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text text-transparent mb-3">
                Your Photo
              </div>
              <div className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent font-black">
                REIMAGINED
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-700 font-normal mt-6">
                in {avgTime} seconds by AI
              </div>
            </h1>

            {/* Enhanced Value Proposition */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-12 leading-relaxed font-light px-4">
              Our AI transforms your precious memories into <span className="font-bold text-purple-700">museum-grade canvas art</span> using 15 distinct artistic styles. No artistic skills required.
            </p>

            {/* Mega CTA Section - Enhanced for Maximum Conversion */}
            <div className="flex flex-col items-center gap-6 mb-12">
              {/* Primary CTA with Enhanced Visual Effects */}
              <div className="relative group">
                {/* Multi-layer glow system */}
                <div className="absolute -inset-6 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full blur-3xl opacity-60 group-hover:opacity-90 animate-[magical-glow_4s_ease-in-out_infinite] transition-all duration-500"></div>
                <div className="absolute -inset-3 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-40 group-hover:opacity-70 animate-[magical-glow_3s_ease-in-out_infinite_reverse] transition-all duration-300"></div>
                
                {/* Enhanced floating particles */}
                <div className="absolute inset-0 overflow-visible rounded-full pointer-events-none">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-2 h-2 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full animate-[magical-particles_${4 + i}s_ease-in-out_infinite] opacity-70 shadow-lg`}
                      style={{
                        top: `${5 + (i * 8) % 90}%`,
                        left: `${5 + (i * 15) % 90}%`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* The Ultimate CTA Button */}
                <Button 
                  onClick={handleUploadClick} 
                  className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-16 lg:px-24 py-8 lg:py-12 text-2xl lg:text-4xl font-black rounded-full shadow-2xl hover:shadow-purple-500/60 transform hover:scale-[1.02] transition-all duration-300 border-4 border-white/30 backdrop-blur-sm group-hover:border-white/60"
                >
                  <Upload className="w-6 h-6 lg:w-10 lg:h-10 mr-4 lg:mr-8" />
                  Upload Your Photo & Start Creating
                  <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 ml-4 lg:ml-8 animate-spin" />
                </Button>
              </div>
              
              {/* Enhanced Reassurance & Urgency */}
              <div className="text-center space-y-4">
                <div className="text-purple-700 font-bold text-xl lg:text-3xl">
                  ✨ Your masterpiece ready in under 2 minutes
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 text-base lg:text-lg text-gray-600">
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
                  <span className="flex items-center gap-2 text-red-600 font-semibold">
                    <Timer className="w-5 h-5" />
                    {urgencyTimer} spots left
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Additional Social Proof & Testimonials */}
          <div className="col-span-12 lg:col-span-2 order-3">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-orange-100 text-center hover:scale-105 transition-transform duration-300">
                <Timer className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">2min</div>
                <div className="text-xs text-gray-600">Processing</div>
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-green-100 text-center hover:scale-105 transition-transform duration-300">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">15</div>
                <div className="text-xs text-gray-600">AI Styles</div>
              </div>
              
              {/* Mini Testimonial Cards */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100 col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic">"Absolutely stunning results!"</p>
                <div className="text-xs text-gray-500 mt-1">- Sarah M.</div>
              </div>
              
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100 col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic">"Better than I imagined!"</p>
                <div className="text-xs text-gray-500 mt-1">- Mike R.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress - Enhanced Positioning */}
        {progressPercentage > 0 && (
          <div className="w-full mt-8">
            <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />
          </div>
        )}

        {/* Full-Width Trust Indicators - Redesigned Grid */}
        <div className="w-full mt-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex flex-col items-center gap-3 lg:gap-4 bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-3 lg:p-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl">
                  <Crown className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-700 text-sm lg:text-xl">Premium Quality</div>
                  <div className="text-xs lg:text-sm text-purple-600">Museum-grade canvas</div>
                </div>
              </div>
            </div>
            
            {/* ... keep existing code for other trust indicators but with responsive improvements */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex flex-col items-center gap-3 lg:gap-4 bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-green-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-3 lg:p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl">
                  <Shield className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700 text-sm lg:text-xl">Secure Checkout</div>
                  <div className="text-xs lg:text-sm text-green-600">SSL protected</div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex flex-col items-center gap-3 lg:gap-4 bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-3 lg:p-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl">
                  <Truck className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-700 text-sm lg:text-xl">Free Shipping</div>
                  <div className="text-xs lg:text-sm text-blue-600">Orders $75+</div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex flex-col items-center gap-3 lg:gap-4 bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-orange-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-3 lg:p-4 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 shadow-xl">
                  <Timer className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-orange-700 text-sm lg:text-xl">Fast Processing</div>
                  <div className="text-xs lg:text-sm text-orange-600">Under 2 minutes</div>
                </div>
              </div>
            </div>

            <div className="relative group col-span-2 md:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative flex flex-col items-center gap-3 lg:gap-4 bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-pink-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-3 lg:p-4 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-xl">
                  <Award className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-pink-700 text-sm lg:text-xl">AI Powered</div>
                  <div className="text-xs lg:text-sm text-pink-600">15 unique styles</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="flex flex-col items-center mt-16 text-center">
          <div className="text-purple-600 font-bold text-xl lg:text-2xl mb-4">
            Choose Your Photo & Style Below ↓
          </div>
          <div className="w-8 h-14 border-3 border-purple-300 rounded-full flex justify-center">
            <div className="w-2 h-4 bg-purple-500 rounded-full mt-3 animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Custom CSS for Advanced Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(15px); }
          66% { transform: translateY(-15px) translateX(-10px); }
        }
        @keyframes magical-glow {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.08) rotate(180deg); }
        }
        @keyframes magical-particles {
          0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.7; }
          25% { transform: translateY(-20px) translateX(12px) scale(1.4); opacity: 1; }
          50% { transform: translateY(-35px) translateX(-12px) scale(0.8); opacity: 0.5; }
          75% { transform: translateY(-25px) translateX(18px) scale(1.3); opacity: 0.9; }
          100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default ProductHeader;
