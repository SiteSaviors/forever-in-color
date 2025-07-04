import { Badge } from "@/components/ui/badge";
import StreamlinedProgress from "./components/StreamlinedProgress";
import { Shield, Truck, Award, Upload, Sparkles, Timer, Users, Star, Zap, Globe, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import "./styles/heroAnimations.css";

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
  const [liveUsers, setLiveUsers] = useState(423); // Increased for more trust
  const [recentOrders, setRecentOrders] = useState(12); // Increased
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Live testimonials for social proof rotation
  const liveTestimonials = [
    { name: "Sarah M.", text: "Just received my canvas - absolutely stunning!", rating: 5 },
    { name: "Mike R.", text: "The AI style transformation exceeded my expectations!", rating: 5 },
    { name: "Emma L.", text: "Customer service was incredible, delivery was fast!", rating: 5 },
    { name: "David K.", text: "Museum quality - looks amazing in our living room!", rating: 5 }
  ];

  // Enhanced live activity simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 7) - 3); // More dynamic
      if (Math.random() > 0.4) { // More frequent updates
        setRecentOrders(prev => prev + 1);
      }
    }, 4000); // Faster updates
    return () => clearInterval(interval);
  }, []);

  // Testimonial rotation
  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % liveTestimonials.length);
    }, 5000);
    return () => clearInterval(testimonialInterval);
  }, []);

  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "✨ Join 50K+ customers creating their masterpieces";
    if (progressPercentage < 50) return "🎨 You're making incredible progress!";
    if (progressPercentage < 100) return "🚀 Almost there! Your masterpiece awaits";
    return "🎉 Order complete! Thank you for choosing us";
  };

  const handleUploadClick = () => {
    // Add subtle haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
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
    <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-950 relative overflow-hidden">
      {/* Enhanced Animated Background Effects with Neon Colors */}
      <div className="absolute inset-0">
        {/* Enhanced floating orbs with neon gradients and varied animations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/40 via-electric-blue-500/35 to-hot-pink-600/30 rounded-full blur-3xl float-slow"></div>
        <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-br from-hot-pink-500/45 via-fuchsia-500/40 to-electric-blue-600/35 rounded-full blur-2xl float-fast"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-br from-electric-blue-400/40 via-cyan-500/35 to-hot-pink-600/30 rounded-full blur-3xl float-gentle"></div>
        
        {/* Additional dynamic orbs for more visual richness */}
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-br from-cyan-300/30 via-electric-blue-400/25 to-purple-500/20 rounded-full blur-2xl float-gentle" style={{animationDelay: '1.5s', animationDuration: '7s'}}></div>
        <div className="absolute bottom-1/4 right-1/3 w-56 h-56 bg-gradient-to-br from-hot-pink-400/35 via-fuchsia-400/30 to-cyan-500/25 rounded-full blur-3xl float-slow" style={{animationDelay: '3s', animationDuration: '9s'}}></div>
        
        {/* Enhanced animated particles with neon colors */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-300/60 rounded-full glow-pulse" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-hot-pink-400/50 rounded-full glow-pulse" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
          <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-electric-blue-300/55 rounded-full glow-pulse" style={{animationDelay: '2s', animationDuration: '4s'}}></div>
          <div className="absolute top-1/6 right-1/6 w-1.5 h-1.5 bg-cyan-400/45 rounded-full glow-pulse" style={{animationDelay: '2.5s', animationDuration: '5s'}}></div>
          <div className="absolute bottom-1/3 left-1/6 w-2 h-2 bg-fuchsia-300/50 rounded-full glow-pulse" style={{animationDelay: '4s', animationDuration: '3.5s'}}></div>
        </div>
        
        {/* Enhanced Dynamic Grid Pattern with Floating Motion */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12)_1px,transparent_1px)] bg-[length:32px_32px] opacity-60 animate-[grid-float_12s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,20,147,0.08)_1px,transparent_1px)] bg-[length:24px_24px] opacity-50 animate-[grid-drift_15s_ease-in-out_infinite]" style={{animationDelay: '2s'}}></div>
        
        {/* Additional overlay for enhanced neon effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-cyan-900/10"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-12 relative z-10">
        {/* Enhanced Live Activity Bar with more neon colors */}
        <div className="flex items-center justify-center gap-3 md:gap-6 mb-6 md:mb-8 flex-wrap">
          {/* Live Users with enhanced neon styling */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/30 to-electric-blue-500/30 backdrop-blur-xl px-4 md:px-6 py-2 md:py-3 rounded-full border border-cyan-400/50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-300 hover:scale-105 group">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full live-pulse shadow-lg shadow-cyan-400/80"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-cyan-100 font-bold text-sm md:text-base tracking-wide group-hover:text-cyan-50 transition-colors">
              {liveUsers} creating now
            </span>
          </div>
          
          {/* AI Badge with enhanced neon glow */}
          <div className="relative">
            <Badge className="bg-gradient-to-r from-hot-pink-500/30 to-fuchsia-500/30 backdrop-blur-xl text-hot-pink-100 border-hot-pink-300/50 px-3 md:px-5 py-2 md:py-2.5 shadow-lg shadow-hot-pink-500/25 hover:shadow-hot-pink-400/40 transition-all duration-300 hover:scale-105 group">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse group-hover:animate-spin text-hot-pink-200" />
              <span className="font-bold text-sm md:text-base">AI-Powered Magic</span>
            </Badge>
            <div className="absolute inset-0 bg-gradient-to-r from-hot-pink-500/25 to-fuchsia-500/25 rounded-full blur-md -z-10 glow-pulse"></div>
          </div>
          
          {/* Dynamic Progress Badge with neon enhancement */}
          <Badge className={`border-2 transition-all duration-500 px-3 md:px-5 py-2 md:py-2.5 backdrop-blur-xl shadow-lg hover:scale-105 group ${
            progressPercentage > 0 
              ? 'bg-gradient-to-r from-electric-blue-500/35 to-cyan-500/35 text-electric-blue-100 border-electric-blue-300/60 shadow-electric-blue-500/25 hover:shadow-electric-blue-400/40' 
              : 'bg-gradient-to-r from-hot-pink-500/35 to-orange-500/35 text-hot-pink-100 border-hot-pink-300/60 shadow-hot-pink-500/25 hover:shadow-hot-pink-400/40'
          }`}>
            <TrendingUp className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            <span className="font-bold text-sm md:text-base">
              {progressPercentage > 0 ? `${Math.round(progressPercentage)}% Complete` : 'Ready to Start'}
            </span>
          </Badge>
        </div>

        {/* Rotating testimonial bar with enhanced neon styling */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-white/20 to-white/15 backdrop-blur-xl rounded-2xl px-4 md:px-8 py-3 md:py-4 border border-cyan-300/30 shadow-2xl shadow-cyan-500/20 max-w-md mx-auto hover:scale-105 hover:shadow-cyan-400/30 transition-all duration-300">
            <div className="flex items-center gap-3 justify-center">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 glow-pulse" style={{animationDelay: `${i * 0.15}s`}} />
                ))}
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm md:text-base mb-1 testimonial-slide">
                  "{liveTestimonials[currentTestimonial].text}"
                </p>
                <p className="text-cyan-200/90 text-xs md:text-sm">
                  - {liveTestimonials[currentTestimonial].name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Header Content with neon text effects */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-4 md:mb-6 leading-[0.85] md:leading-[0.9]">
            <span className="bg-gradient-to-r from-cyan-300 via-electric-blue-300 to-hot-pink-300 bg-clip-text text-transparent drop-shadow-2xl hover:scale-105 transition-transform duration-300 inline-block">
              Create Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-hot-pink-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl scale-glow hover:animate-none hover:scale-105 transition-all duration-300 inline-block font-oswald">
              MASTERPIECE
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-cyan-100/95 max-w-4xl mx-auto mb-6 md:mb-8 leading-relaxed font-medium px-4">
            Transform your precious memories into <span className="text-cyan-300 font-bold hover:text-cyan-200 transition-colors glow-pulse">stunning canvas art</span> with 
            <span className="text-hot-pink-300 font-bold hover:text-hot-pink-200 transition-colors glow-pulse"> AI-powered artistic styles</span>
          </p>

          {/* Enhanced Motivational Progress Message */}
          <div className="bg-gradient-to-r from-white/20 to-white/15 backdrop-blur-xl rounded-2xl px-6 md:px-10 py-3 md:py-5 inline-block mb-8 md:mb-12 border border-cyan-300/30 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-400/30 hover:scale-105 transition-all duration-300 group">
            <span className="text-white font-bold text-base md:text-lg lg:text-xl tracking-wide group-hover:text-cyan-100 transition-colors">
              {getMotivationalMessage()}
            </span>
          </div>

          {/* Enhanced Primary CTA with premium neon effects */}
          <Button 
            onClick={handleUploadClick} 
            className="bg-gradient-to-r from-hot-pink-500 via-fuchsia-500 to-electric-blue-500 hover:from-hot-pink-600 hover:via-fuchsia-600 hover:to-electric-blue-600 text-white px-8 md:px-16 py-4 md:py-6 text-lg md:text-xl lg:text-2xl font-black rounded-2xl shadow-2xl shadow-hot-pink-500/40 hover:shadow-hot-pink-400/50 transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-cyan-300/30 backdrop-blur-sm mb-8 md:mb-12 group relative overflow-hidden premium-button"
          >
            {/* Animated background shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <Upload className="w-5 h-5 md:w-7 md:h-7 mr-3 group-hover:animate-bounce" />
            <span className="relative z-10">
              {progressPercentage === 0 ? 'Upload Photo & Start Creating' : 'Continue Your Masterpiece'}
            </span>
            <Sparkles className="w-5 h-5 md:w-7 md:h-7 ml-3 glow-pulse group-hover:animate-spin" />
          </Button>
        </div>

        {/* Progress - Only show when needed */}
        {progressPercentage > 0 && (
          <div className="mb-8 md:mb-12 fade-in-up">
            <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />
          </div>
        )}

        {/* Enhanced Trust Indicators with neon effects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 text-center mb-8 md:mb-12">
          <div className="flex flex-col items-center gap-3 md:gap-4 bg-gradient-to-b from-white/20 to-white/15 backdrop-blur-xl rounded-2xl p-4 md:p-6 lg:p-8 border border-cyan-300/40 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group trust-card">
            <div className="relative">
              <div className="p-3 md:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-cyan-400 to-electric-blue-600 shadow-xl shadow-cyan-500/40 group-hover:shadow-cyan-400/60 transition-all duration-300 group-hover:rotate-6">
                <Shield className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-cyan-400/25 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            </div>
            <div>
              <div className="text-base md:text-lg lg:text-xl font-black text-cyan-100 group-hover:text-cyan-50 transition-colors">
                100% Secure & Safe
              </div>
              <div className="text-sm md:text-base text-cyan-200/90 group-hover:text-cyan-200 transition-colors">
                SSL Protected Checkout
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 md:gap-4 bg-gradient-to-b from-white/20 to-white/15 backdrop-blur-xl rounded-2xl p-4 md:p-6 lg:p-8 border border-electric-blue-300/40 shadow-xl shadow-electric-blue-500/25 hover:shadow-electric-blue-400/40 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group trust-card">
            <div className="relative">
              <div className="p-3 md:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-electric-blue-400 to-hot-pink-600 shadow-xl shadow-electric-blue-500/40 group-hover:shadow-electric-blue-400/60 transition-all duration-300 group-hover:rotate-6">
                <Truck className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-electric-blue-400/25 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            </div>
            <div>
              <div className="text-base md:text-lg lg:text-xl font-black text-electric-blue-100 group-hover:text-electric-blue-50 transition-colors">
                Free Express Shipping
              </div>
              <div className="text-sm md:text-base text-electric-blue-200/90 group-hover:text-electric-blue-200 transition-colors">
                Orders $75+ • 3-5 Days
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 md:gap-4 bg-gradient-to-b from-white/20 to-white/15 backdrop-blur-xl rounded-2xl p-4 md:p-6 lg:p-8 border border-hot-pink-300/40 shadow-xl shadow-hot-pink-500/25 hover:shadow-hot-pink-400/40 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group trust-card">
            <div className="relative">
              <div className="p-3 md:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-hot-pink-400 to-fuchsia-600 shadow-xl shadow-hot-pink-500/40 group-hover:shadow-hot-pink-400/60 transition-all duration-300 group-hover:rotate-6">
                <Award className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-hot-pink-400/25 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            </div>
            <div>
              <div className="text-base md:text-lg lg:text-xl font-black text-hot-pink-100 group-hover:text-hot-pink-50 transition-colors">
                Museum Quality
              </div>
              <div className="text-sm md:text-base text-hot-pink-200/90 group-hover:text-hot-pink-200 transition-colors">
                Premium 1.25" Canvas
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Social Proof Numbers with neon glow */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-6 md:pt-8 border-t border-cyan-300/20">
          <div className="text-center group">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-cyan-300 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300 glow-pulse">
              50K+
            </div>
            <div className="text-xs md:text-sm lg:text-base text-cyan-200/90 font-bold group-hover:text-cyan-200 transition-colors">
              Happy Customers
            </div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-hot-pink-300 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300 glow-pulse" style={{animationDelay: '0.5s'}}>
              4.9★
            </div>
            <div className="text-xs md:text-sm lg:text-base text-hot-pink-200/90 font-bold group-hover:text-hot-pink-200 transition-colors">
              Perfect Rating
            </div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-electric-blue-300 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300 glow-pulse" style={{animationDelay: '1s'}}>
              15
            </div>
            <div className="text-xs md:text-sm lg:text-base text-electric-blue-200/90 font-bold group-hover:text-electric-blue-200 transition-colors">
              Art Styles
            </div>
          </div>
        </div>

        {/* Additional trust indicators with neon styling */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-6 md:mt-8 opacity-90">
          <div className="flex items-center gap-2 text-cyan-200/80 hover:text-cyan-100 transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium">Worldwide Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-electric-blue-200/80 hover:text-electric-blue-100 transition-colors">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium">30-Day Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-hot-pink-200/80 hover:text-hot-pink-100 transition-colors">
            <Zap className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium">Lightning Fast AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
