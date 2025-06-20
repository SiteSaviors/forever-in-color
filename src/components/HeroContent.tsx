
import { ArrowRight, Heart, Sparkles, Camera } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface HeroContentProps {
  hideBadgeAndHeadline?: boolean;
}

const HeroContent = ({
  hideBadgeAndHeadline = false
}: HeroContentProps) => {
  return (
    <div className="space-y-6">
      {/* Badge and Headline - Only show if not hidden */}
      {!hideBadgeAndHeadline && (
        <>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-center lg:text-left">
              <div className="text-white font-montserrat">Your Memories</div>
              <div className="text-5xl lg:text-6xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent font-oswald">
                REIMAGINED
              </div>
            </h1>
            <p className="text-lg leading-relaxed max-w-lg text-slate-100 opacity-90">
              Transform your most precious photos into stunning, modern artwork. From beloved pets to lost loved ones, 
              we create personalized pieces that preserve what matters most.
            </p>
          </div>
        </>
      )}

      {/* Description - Show on mobile when badge/headline are hidden */}
      {hideBadgeAndHeadline && (
        <div className="text-center lg:text-left">
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Transform your most precious photos into stunning, modern artwork. From beloved pets to lost loved ones, 
            we create personalized pieces that preserve what matters most.
          </p>
        </div>
      )}

      {/* Key Features */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 justify-center lg:justify-start">
          <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="font-medium text-slate-100">15 unique artistic styles to choose from</span>
        </div>
        <div className="flex items-center gap-3 justify-center lg:justify-start">
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Camera className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-100">Optional AR experience brings your art to life</span>
        </div>
        <div className="flex items-center gap-3 justify-center lg:justify-start">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-100">Perfect for gifting or keeping forever</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
          <span>Start Creating</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button className="border-2 border-white/30 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-all duration-200">
          View Art Styles
        </button>
      </div>

      {/* Social Proof */}
      <div className="pt-6 border-t border-white/20">
        <div className="flex items-center justify-between max-w-sm mx-auto lg:mx-0">
          <div className="text-center">
            <div className="text-xl font-bold text-white">10K+</div>
            <div className="text-xs text-slate-300">Memories Preserved</div>
          </div>
          <Separator orientation="vertical" className="h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-xl font-bold text-white">4.9★</div>
            <div className="text-xs text-slate-300">Customer Rating</div>
          </div>
          <Separator orientation="vertical" className="h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-xl font-bold text-white">6</div>
            <div className="text-xs text-slate-300">Art Styles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
