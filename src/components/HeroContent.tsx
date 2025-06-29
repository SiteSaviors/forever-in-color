
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface HeroContentProps {
  hideBadgeAndHeadline?: boolean;
}

const HeroContent = ({ hideBadgeAndHeadline = false }: HeroContentProps) => {
  return (
    <div className="space-y-8">
      {!hideBadgeAndHeadline && (
        <>
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-200 shadow-lg">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
          </div>

          {/* Main Headline */}
          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 font-montserrat">
              <div className="text-white mb-2">Your Memories</div>
              <div className="text-6xl sm:text-7xl lg:text-8xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent font-oswald">
                REIMAGINED
              </div>
            </h1>
          </div>
        </>
      )}

      {/* Subheading */}
      <p className="text-xl sm:text-2xl text-white/90 font-light leading-relaxed max-w-2xl">
        Transform your precious photos into stunning AI-generated canvas art. 
        <span className="font-medium text-white"> From family portraits to landscape memories</span> 
        — each piece tells your unique story.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl text-lg px-8 py-6 rounded-2xl font-semibold transform transition-all duration-200 hover:scale-105 hover:shadow-2xl"
          onClick={() => window.location.href = '/product'}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Create Your Canvas Now
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 text-lg px-8 py-6 rounded-2xl font-semibold transition-all duration-200"
        >
          See Gallery Examples
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6 text-white/80">
        <div className="flex items-center space-x-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Sparkles key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="ml-2 text-sm font-medium">4.9/5 from 12,000+ customers</span>
        </div>
        <div className="hidden sm:block w-1 h-1 bg-white/40 rounded-full"></div>
        <span className="text-sm">✨ Free shipping worldwide</span>
        <div className="hidden sm:block w-1 h-1 bg-white/40 rounded-full"></div>
        <span className="text-sm">🎨 Premium canvas quality</span>
      </div>
    </div>
  );
};

export default HeroContent;
