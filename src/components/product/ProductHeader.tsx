

import { Badge } from "@/components/ui/badge";
import StreamlinedProgress from "./components/StreamlinedProgress";
import CustomerPhotoMarquee from "./components/CustomerPhotoMarquee";
import { Shield, Truck, Award, Upload, Sparkles, Timer, Users, Star, Zap, Globe, CheckCircle, TrendingUp } from "lucide-react";
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
    <div className="bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900 relative overflow-hidden">
      {/* Enhanced Animated Background Effects */}
      <div className="absolute inset-0">
        {/* Floating orbs with staggered animations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-purple-600/15 rounded-full blur-3xl animate-pulse float-gentle"></div>
        <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-br from-pink-400/30 via-fuchsia-500/25 to-violet-600/20 rounded-full blur-2xl animate-pulse float-gentle" style={{animationDelay: '1s', animationDuration: '6s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-br from-emerald-400/25 via-teal-500/20 to-cyan-600/15 rounded-full blur-3xl animate-pulse float-gentle" style={{animationDelay: '2s', animationDuration: '8s'}}></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyan-300/30 rounded-full animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-pink-300/25 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        </div>
        
        {/* Enhanced Grid Pattern with animation */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:24px_24px] opacity-40 animate-pulse" style={{animationDuration: '10s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 lg:py-12 relative z-10">
        {/* Compact Live Activity Bar - Phase 1 Optimizations */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-3 md:mb-4 flex-wrap">
          {/* Live Users with compact styling */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/25 to-green-500/25 backdrop-blur-xl px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-emerald-400/40 shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 group">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/60"></div>
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-emerald-100 font-bold text-xs md:text-sm tracking-wide group-hover:text-emerald-50 transition-colors">
              {liveUsers} creating now
            </span>
          </div>
          
          {/* AI Badge with compact styling */}
          <div className="relative">
            <Badge className="bg-gradient-to-r from-violet-500/25 to-purple-500/25 backdrop-blur-xl text-violet-100 border-violet-300/40 px-2 md:px-3 py-1 md:py-1.5 shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105 group">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 mr-1.5 animate-pulse group-hover:animate-spin" />
              <span className="font-bold text-xs md:text-sm">AI-Powered Magic</span>
            </Badge>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-md -z-10 animate-pulse"></div>
          </div>
          
          {/* Dynamic Progress Badge with compact styling */}
          <Badge className={`border-2 transition-all duration-500 px-2 md:px-3 py-1 md:py-1.5 backdrop-blur-xl shadow-lg hover:scale-105 group ${
            progressPercentage > 0 
              ? 'bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-100 border-emerald-300/60 hover:shadow-emerald-500/25' 
              : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-100 border-amber-300/60 hover:shadow-amber-500/25'
          }`}>
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1.5 group-hover:animate-pulse" />
            <span className="font-bold text-xs md:text-sm">
              {progressPercentage > 0 ? `${Math.round(progressPercentage)}% Complete` : 'Ready to Start'}
            </span>
          </Badge>
        </div>

        {/* Compact rotating testimonial bar */}
        <div className="flex justify-center mb-3 md:mb-4">
          <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-xl rounded-2xl px-3 md:px-6 py-2 md:py-3 border border-white/20 shadow-2xl max-w-md mx-auto hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2.5 justify-center">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400 animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                ))}
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-xs md:text-sm mb-0.5">
                  "{liveTestimonials[currentTestimonial].text}"
                </p>
                <p className="text-white/80 text-xs">
                  - {liveTestimonials[currentTestimonial].name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Header Content with better mobile spacing */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-4 md:mb-6 leading-[0.85] md:leading-[0.9]">
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-2xl hover:scale-105 transition-transform duration-300 inline-block">
              Create Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse hover:animate-none hover:scale-105 transition-all duration-300 inline-block">
              MASTERPIECE
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-violet-100 max-w-4xl mx-auto mb-8 md:mb-12 leading-relaxed font-medium px-4">
            Transform your precious memories into <span className="text-cyan-300 font-bold hover:text-cyan-200 transition-colors">stunning canvas art</span> with 
            <span className="text-fuchsia-300 font-bold hover:text-fuchsia-200 transition-colors"> AI-powered artistic styles</span>
          </p>

          {/* Enhanced Primary CTA with micro-interactions - Larger and more prominent */}
          <Button 
            onClick={handleUploadClick} 
            className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-600 text-white px-12 md:px-20 py-6 md:py-8 text-xl md:text-2xl lg:text-3xl font-black rounded-2xl shadow-2xl hover:shadow-fuchsia-500/30 transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/25 backdrop-blur-sm mb-4 md:mb-6 group relative overflow-hidden"
          >
            {/* Animated background shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <Upload className="w-6 h-6 md:w-8 md:h-8 mr-3 group-hover:animate-bounce" />
            <span className="relative z-10">
              {progressPercentage === 0 ? 'Upload Photo & Start Creating' : 'Continue Your Masterpiece'}
            </span>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 ml-3 animate-pulse group-hover:animate-spin" />
          </Button>

          {/* Static Social Proof Message - Moved below CTA */}
          <p className="text-sm md:text-base text-white/80 text-center font-medium">
            ✨ Join 50K+ customers creating their masterpieces
          </p>
        </div>

        {/* Customer Photo Marquee - Social Proof */}
        <div className="mb-8 md:mb-12">
          <CustomerPhotoMarquee />
        </div>

        {/* Progress - Only show when needed */}
        {progressPercentage > 0 && (
          <div className="mb-8 md:mb-12 animate-fade-in">
            <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />
          </div>
        )}

        {/* Enhanced Trust Indicators with advanced animations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 text-center mb-8 md:mb-12">
          <div className="flex flex-col items-center gap-3 md:gap-4 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 lg:p-8 border border-emerald-300/40 shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="relative">
              <div className="p-3 md:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:rotate-6">
                <Shield className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            </div>
            <div>
              <div className="text-base md:text-lg lg:text-xl font-black text-emerald-100 group-hover:text-emerald-50 transition-colors">
                100% Secure & Safe
              </div>
              <div className="text-sm md:text-base text-emerald-200/90 group-hover:text-emerald-200 transition-colors">
                SSL Protected Checkout
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 md:gap-4 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 lg:p-8 border border-blue-300/40 shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="relative">
              <div className="p-3 md:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:rotate-6">
                <Truck className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            </div>
            <div>
              <div className="text-base md:text-lg lg:text-xl font-black text-blue-100 group-hover:text-blue-50 transition-colors">
                Free Express Shipping
              </div>
              <div className="text-sm md:text-base text-blue-200/90 group-hover:text-blue-200 transition-colors">
                Orders $75+ • 3-5 Days
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 md:gap-4 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 lg:p-8 border border-violet-300/40 shadow-xl hover:shadow-violet-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 group">
            <div className="relative">
              <div className="p-3 md:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 shadow-xl shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300 group-hover:rotate-6">
                <Award className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-violet-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            </div>
            <div>
              <div className="text-base md:text-lg lg:text-xl font-black text-violet-100 group-hover:text-violet-50 transition-colors">
                Museum Quality
              </div>
              <div className="text-sm md:text-base text-violet-200/90 group-hover:text-violet-200 transition-colors">
                Premium 1.25" Canvas
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Social Proof Numbers with live updates */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-6 md:pt-8 border-t border-white/20">
          <div className="text-center group">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-cyan-300 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300 animate-pulse">
              50K+
            </div>
            <div className="text-xs md:text-sm lg:text-base text-cyan-200/90 font-bold group-hover:text-cyan-200 transition-colors">
              Happy Customers
            </div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-fuchsia-300 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300 animate-pulse" style={{animationDelay: '0.5s'}}>
              4.9★
            </div>
            <div className="text-xs md:text-sm lg:text-base text-fuchsia-200/90 font-bold group-hover:text-fuchsia-200 transition-colors">
              Perfect Rating
            </div>
          </div>
          <div className="text-center group">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-violet-300 mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300 animate-pulse" style={{animationDelay: '1s'}}>
              15
            </div>
            <div className="text-xs md:text-sm lg:text-base text-violet-200/90 font-bold group-hover:text-violet-200 transition-colors">
              Art Styles
            </div>
          </div>
        </div>

        {/* Additional trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-6 md:mt-8 opacity-80">
          <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium">Worldwide Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium">30-Day Guarantee</span>
          </div>
          <div className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <Zap className="w-4 h-4" />
            <span className="text-xs md:text-sm font-medium">Lightning Fast AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;

