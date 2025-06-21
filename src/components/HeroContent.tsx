import { ArrowRight, Heart, Sparkles, Camera } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface HeroContentProps {
  hideBadgeAndHeadline?: boolean;
}

const HeroContent = ({
  hideBadgeAndHeadline = false
}: HeroContentProps) => {
  const [textSize, setTextSize] = useState([8]); // Default to text-8xl

  const getTextSizeClass = (size: number) => {
    const sizeMap: { [key: number]: string } = {
      4: "text-4xl lg:text-5xl",
      5: "text-5xl lg:text-6xl", 
      6: "text-6xl lg:text-7xl",
      7: "text-7xl lg:text-8xl",
      8: "text-8xl lg:text-9xl",
      9: "text-9xl lg:text-9xl",
    };
    return sizeMap[size] || "text-8xl lg:text-9xl";
  };

  return (
    <div className="space-y-8">
      {/* Text Size Controller - Only show when badge/headline are visible */}
      {!hideBadgeAndHeadline && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <label className="block text-white text-sm font-medium mb-3">
            Adjust "REIMAGINED" Text Size: {textSize[0]}
          </label>
          <Slider
            value={textSize}
            onValueChange={setTextSize}
            max={9}
            min={4}
            step={1}
            className="w-full"
          />
        </div>
      )}

      {/* Badge and Headline - Only show if not hidden */}
      {!hideBadgeAndHeadline && (
        <div className="space-y-6">
          {/* Badge - Standardized styling */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
          </div>

          {/* Main Headline - Removed all margin between text elements */}
          <div>
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight text-center lg:text-left mb-4">
              <div className="text-white font-poppins tracking-tighter leading-none">Your Memories</div>
              <div className={`${getTextSizeClass(textSize[0])} bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent font-oswald leading-none`}>
                REIMAGINED
              </div>
            </h1>
            <p className="text-lg leading-relaxed max-w-lg text-slate-100/90 text-center lg:text-left">
              Transform your most precious photos into stunning, modern artwork. From beloved pets to lost loved ones, 
              we create personalized pieces that preserve what matters most.
            </p>
          </div>
        </div>
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

      {/* Key Features - Simplified and consistent spacing */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 justify-center lg:justify-start">
          <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="font-medium text-slate-100">15 unique artistic styles to choose from</span>
        </div>
        <div className="flex items-center gap-4 justify-center lg:justify-start">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Camera className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-100">Optional AR experience brings your art to life</span>
        </div>
        <div className="flex items-center gap-4 justify-center lg:justify-start">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-100">Perfect for gifting or keeping forever</span>
        </div>
      </div>

      {/* CTA Buttons - Consistent styling and spacing */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
          <span>Start Creating</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-200">
          View Art Styles
        </button>
      </div>

      {/* Social Proof - Simplified and grid-aligned */}
      <div className="pt-8 border-t border-white/20">
        <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-sm text-slate-300">Memories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">4.9★</div>
            <div className="text-sm text-slate-300">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">15</div>
            <div className="text-sm text-slate-300">Art Styles</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
