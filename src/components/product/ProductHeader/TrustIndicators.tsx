import { Shield, Truck, Award, Globe, CheckCircle, Zap } from "@/components/ui/icons";

const TrustIndicators = () => {
  return (
    <>
      {/* Enhanced Trust Indicators with Phase 5 mobile optimizations - Compact horizontal squares */}
      <div className="grid grid-cols-3 gap-2 md:gap-6 text-center mb-4 md:mb-10">
        <div className="flex flex-col items-center gap-1 md:gap-3 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-2 md:p-5 lg:p-6 border border-emerald-300/40 shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-200 group aspect-square md:aspect-auto">
          <div className="relative">
            <div className="p-1.5 md:p-3.5 lg:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-200 group-hover:rotate-6">
              <Shield className="w-4 h-4 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-emerald-400/20 rounded-xl md:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-200"></div>
          </div>
          <div>
            <div className="text-xs md:text-lg lg:text-xl font-black text-emerald-100 group-hover:text-emerald-50 transition-colors">
              {/* Mobile: Show only "Secure", Desktop: Show full text */}
              <span className="md:hidden">Secure</span>
              <span className="hidden md:inline">100% Secure</span>
            </div>
            {/* Hide description on mobile to save space */}
            <div className="hidden md:block text-xs md:text-base text-emerald-200/90 group-hover:text-emerald-200 transition-colors">
              SSL Protected
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 md:gap-3 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-2 md:p-5 lg:p-6 border border-blue-300/40 shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-200 group aspect-square md:aspect-auto">
          <div className="relative">
            <div className="p-1.5 md:p-3.5 lg:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-200 group-hover:rotate-6">
              <Truck className="w-4 h-4 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-blue-400/20 rounded-xl md:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-200"></div>
          </div>
          <div>
            <div className="text-xs md:text-lg lg:text-xl font-black text-blue-100 group-hover:text-blue-50 transition-colors">
              {/* Mobile: Show only "Shipping", Desktop: Show full text */}
              <span className="md:hidden">Shipping</span>
              <span className="hidden md:inline">Free Shipping</span>
            </div>
            {/* Hide description on mobile to save space */}
            <div className="hidden md:block text-xs md:text-base text-blue-200/90 group-hover:text-blue-200 transition-colors">
              Orders $75+
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 md:gap-3 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-2 md:p-5 lg:p-6 border border-violet-300/40 shadow-xl hover:shadow-violet-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-200 group aspect-square md:aspect-auto">
          <div className="relative">
            <div className="p-1.5 md:p-3.5 lg:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 shadow-xl shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-200 group-hover:rotate-6">
              <Award className="w-4 h-4 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-violet-400/20 rounded-xl md:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-200"></div>
          </div>
          <div>
            <div className="text-xs md:text-lg lg:text-xl font-black text-violet-100 group-hover:text-violet-50 transition-colors">
              {/* Mobile: Show only "Quality", Desktop: Show full text */}
              <span className="md:hidden">Quality</span>
              <span className="hidden md:inline">Museum Quality</span>
            </div>
            {/* Hide description on mobile to save space */}
            <div className="hidden md:block text-xs md:text-base text-violet-200/90 group-hover:text-violet-200 transition-colors">
              Premium Canvas
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Social Proof Numbers with mobile optimization */}
      <div className="grid grid-cols-3 gap-2 md:gap-6 max-w-2xl mx-auto pt-3 md:pt-6 border-t border-white/20">
        <div className="text-center group">
          <div className="text-xl md:text-4xl lg:text-5xl font-black text-cyan-300 mb-0.5 md:mb-1.5 group-hover:scale-110 transition-transform duration-200 animate-pulse">
            50K+
          </div>
          <div className="text-xs md:text-sm lg:text-base text-cyan-200/90 font-bold group-hover:text-cyan-200 transition-colors">
            {/* Mobile: Shorter text */}
            <span className="md:hidden">Customers</span>
            <span className="hidden md:inline">Happy Customers</span>
          </div>
        </div>
        <div className="text-center group">
          <div className="text-xl md:text-4xl lg:text-5xl font-black text-fuchsia-300 mb-0.5 md:mb-1.5 group-hover:scale-110 transition-transform duration-200 animate-pulse" style={{animationDelay: '0.5s'}}>
            4.9★
          </div>
          <div className="text-xs md:text-sm lg:text-base text-fuchsia-200/90 font-bold group-hover:text-fuchsia-200 transition-colors">
            {/* Mobile: Shorter text */}
            <span className="md:hidden">Rating</span>
            <span className="hidden md:inline">Perfect Rating</span>
          </div>
        </div>
        <div className="text-center group">
          <div className="text-xl md:text-4xl lg:text-5xl font-black text-violet-300 mb-0.5 md:mb-1.5 group-hover:scale-110 transition-transform duration-200 animate-pulse" style={{animationDelay: '1s'}}>
            15
          </div>
          <div className="text-xs md:text-sm lg:text-base text-violet-200/90 font-bold group-hover:text-violet-200 transition-colors">
            {/* Mobile: Keep as is since it's already short */}
            Art Styles
          </div>
        </div>
      </div>

      {/* Additional trust indicators with mobile optimization */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-4 mt-3 md:mt-6 opacity-80">
        <div className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Globe className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-medium">
            {/* Mobile: Shorter text */}
            <span className="md:hidden">Worldwide</span>
            <span className="hidden md:inline">Worldwide Shipping</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
          <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-medium">
            {/* Mobile: Shorter text */}
            <span className="md:hidden">30-Day</span>
            <span className="hidden md:inline">30-Day Guarantee</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
          <Zap className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-medium">
            {/* Mobile: Shorter text */}
            <span className="md:hidden">Fast AI</span>
            <span className="hidden md:inline">Lightning Fast AI</span>
          </span>
        </div>
      </div>
    </>
  );
};

export default TrustIndicators;
