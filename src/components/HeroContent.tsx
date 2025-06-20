
import { ArrowRight, Heart, Sparkles, Camera } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface HeroContentProps {
  hideBadgeAndHeadline?: boolean;
}

const HeroContent = ({ hideBadgeAndHeadline = false }: HeroContentProps) => {
  return (
    <div className="space-y-8">
      {/* Badge and Headline - Only show if not hidden */}
      {!hideBadgeAndHeadline && (
        <>
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-100">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your memories,{" "}
              <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                reimagined
              </span>{" "}
              in art
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Transform your most precious photos into stunning, modern artwork. From beloved pets to lost loved ones, 
              we create personalized pieces that preserve what matters most.
            </p>
          </div>
        </>
      )}

      {/* Description - Show on mobile when badge/headline are hidden */}
      {hideBadgeAndHeadline && (
        <div className="space-y-6 text-center lg:text-left">
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Transform your most precious photos into stunning, modern artwork. From beloved pets to lost loved ones, 
            we create personalized pieces that preserve what matters most.
          </p>
        </div>
      )}

      {/* Key Features */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 justify-center lg:justify-start">
          <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="text-gray-700 font-medium text-sm sm:text-base">6 unique artistic styles to choose from</span>
        </div>
        <div className="flex items-center space-x-3 justify-center lg:justify-start">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Camera className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-700 font-medium text-sm sm:text-base">Optional AR experience brings your art to life</span>
        </div>
        <div className="flex items-center space-x-3 justify-center lg:justify-start">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-gray-700 font-medium text-sm sm:text-base">Perfect for gifting or keeping forever</span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2">
          <span>Start Creating</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <button className="border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-all duration-300">
          View Art Styles
        </button>
      </div>

      {/* Social Proof */}
      <div className="pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between max-w-sm mx-auto lg:mx-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">10K+</div>
            <div className="text-sm text-gray-600">Memories Preserved</div>
          </div>
          <Separator orientation="vertical" className="h-12 bg-gray-300" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">4.9★</div>
            <div className="text-sm text-gray-600">Customer Rating</div>
          </div>
          <Separator orientation="vertical" className="h-12 bg-gray-300" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">6</div>
            <div className="text-sm text-gray-600">Art Styles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
