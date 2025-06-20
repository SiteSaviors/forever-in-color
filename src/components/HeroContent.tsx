
import { ArrowRight, Heart, Sparkles, Camera, Clock } from "lucide-react";

interface HeroContentProps {
  hideBadgeAndHeadline?: boolean;
}

const HeroContent = ({
  hideBadgeAndHeadline = false
}: HeroContentProps) => {
  return (
    <div className="space-y-8">
      {/* Badge and Headline - Only show if not hidden */}
      {!hideBadgeAndHeadline && (
        <div className="space-y-6">
          {/* Emotional Badge */}
          <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 border border-pink-200/60 shadow-lg">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
            <span className="text-sm font-medium text-pink-700">Where Memories Come Alive Forever</span>
          </div>

          {/* Emotional Main Headline */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-center lg:text-left mb-4">
              <div className="text-white font-montserrat mb-2">Don't Just Remember.</div>
              <div className="text-5xl lg:text-6xl bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 bg-clip-text text-transparent font-oswald">
                RELIVE.
              </div>
            </h1>
            <p className="text-lg leading-relaxed max-w-lg text-slate-100/95 text-center lg:text-left">
              Transform precious moments into living art that breathes with memory. 
              Your loved ones, your pets, your story—preserved forever in ways that make time stand still.
            </p>
          </div>
        </div>
      )}

      {/* Description for mobile when badge/headline are hidden */}
      {hideBadgeAndHeadline && (
        <div className="text-center lg:text-left">
          <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Transform precious moments into living art that breathes with memory. 
            Your loved ones, your pets, your story—preserved forever in ways that make time stand still.
          </p>
        </div>
      )}

      {/* Emotional Journey Features */}
      <div className="space-y-5">
        <div className="flex items-center gap-4 justify-center lg:justify-start">
          <div className="w-7 h-7 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-medium text-slate-100">Feel their presence every time you look</span>
        </div>
        <div className="flex items-center gap-4 justify-center lg:justify-start">
          <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-slate-100">Watch memories move with magical AR technology</span>
        </div>
        <div className="flex items-center gap-4 justify-center lg:justify-start">
          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-slate-100">Create heirlooms that connect generations</span>
        </div>
      </div>

      {/* Emotional CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
          <span>Preserve Your Memory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/15 backdrop-blur-sm transition-all duration-300">
          See the Magic
        </button>
      </div>

      {/* Emotional Social Proof */}
      <div className="pt-8 border-t border-white/25">
        <div className="text-center lg:text-left mb-4">
          <p className="text-white/90 text-sm font-medium">Trusted by families worldwide</p>
        </div>
        <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">15K+</div>
            <div className="text-sm text-slate-300">Memories Preserved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">4.9★</div>
            <div className="text-sm text-slate-300">Love Stories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-sm text-slate-300">Moments Relived</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
