
import { Shield, Truck, Award, Globe, CheckCircle, Zap } from "lucide-react";

const TrustIndicators = () => {
  return (
    <>
      {/* Enhanced Trust Indicators with optimized animations and compressed spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 text-center mb-6 md:mb-10">
        <div className="flex flex-col items-center gap-2 md:gap-3 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-2xl p-3 md:p-5 lg:p-6 border border-emerald-300/40 shadow-xl hover:shadow-emerald-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-200 group">
          <div className="relative">
            <div className="p-2.5 md:p-3.5 lg:p-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-200 group-hover:rotate-6">
              <Shield className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-200"></div>
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

        <div className="flex flex-col items-center gap-2 md:gap-3 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-2xl p-3 md:p-5 lg:p-6 border border-blue-300/40 shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-200 group">
          <div className="relative">
            <div className="p-2.5 md:p-3.5 lg:p-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-200 group-hover:rotate-6">
              <Truck className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-200"></div>
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

        <div className="flex flex-col items-center gap-2 md:gap-3 bg-gradient-to-b from-white/15 to-white/10 backdrop-blur-xl rounded-2xl p-3 md:p-5 lg:p-6 border border-violet-300/40 shadow-xl hover:shadow-violet-500/25 transform hover:scale-105 hover:-translate-y-2 transition-all duration-200 group">
          <div className="relative">
            <div className="p-2.5 md:p-3.5 lg:p-4 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 shadow-xl shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-200 group-hover:rotate-6">
              <Award className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white group-hover:animate-pulse" />
            </div>
            <div className="absolute inset-0 bg-violet-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-200"></div>
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

      {/* Enhanced Social Proof Numbers with optimized spacing */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto pt-4 md:pt-6 border-t border-white/20">
        <div className="text-center group">
          <div className="text-3xl md:text-4xl lg:text-5xl font-black text-cyan-300 mb-1 md:mb-1.5 group-hover:scale-110 transition-transform duration-200 animate-pulse">
            50K+
          </div>
          <div className="text-xs md:text-sm lg:text-base text-cyan-200/90 font-bold group-hover:text-cyan-200 transition-colors">
            Happy Customers
          </div>
        </div>
        <div className="text-center group">
          <div className="text-3xl md:text-4xl lg:text-5xl font-black text-fuchsia-300 mb-1 md:mb-1.5 group-hover:scale-110 transition-transform duration-200 animate-pulse" style={{animationDelay: '0.5s'}}>
            4.9★
          </div>
          <div className="text-xs md:text-sm lg:text-base text-fuchsia-200/90 font-bold group-hover:text-fuchsia-200 transition-colors">
            Perfect Rating
          </div>
        </div>
        <div className="text-center group">
          <div className="text-3xl md:text-4xl lg:text-5xl font-black text-violet-300 mb-1 md:mb-1.5 group-hover:scale-110 transition-transform duration-200 animate-pulse" style={{animationDelay: '1s'}}>
            15
          </div>
          <div className="text-xs md:text-sm lg:text-base text-violet-200/90 font-bold group-hover:text-violet-200 transition-colors">
            Art Styles
          </div>
        </div>
      </div>

      {/* Additional trust indicators with optimized spacing */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-4 md:mt-6 opacity-80">
        <div className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
          <Globe className="w-4 h-4" />
          <span className="text-xs md:text-sm font-medium">Worldwide Shipping</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs md:text-sm font-medium">30-Day Guarantee</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors">
          <Zap className="w-4 h-4" />
          <span className="text-xs md:text-sm font-medium">Lightning Fast AI</span>
        </div>
      </div>
    </>
  );
};

export default TrustIndicators;
