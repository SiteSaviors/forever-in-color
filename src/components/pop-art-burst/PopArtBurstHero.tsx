
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, DollarSign } from "lucide-react";

interface PopArtBurstHeroProps {
  onStartCreating: () => void;
}

const PopArtBurstHero = ({ onStartCreating }: PopArtBurstHeroProps) => {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-red-100 via-yellow-100 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-red-500/20 text-red-600 border-red-500/30">
                Comic / Warhol Style
              </Badge>
              <h1 className="text-6xl lg:text-8xl font-bold mb-6">
                <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                  Pop Art Burst
                </span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Bold, retro, and impossible to ignore.
              </p>
            </div>
            
            <Button 
              onClick={onStartCreating}
              className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white font-bold px-12 py-6 rounded-full text-xl hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Start Creating in This Style
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            {/* Pricing Badge */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white/80 rounded-full px-3 py-1 border border-gray-300">
                <DollarSign className="w-4 h-4 text-gray-600 mr-1" />
                <span className="text-sm font-medium text-gray-700">Starting at only $99.99</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-red-500/20 border-4 border-black">
              <img 
                src="/lovable-uploads/723f2a1a-0e03-4c36-a8d3-a930c81a7d08.png"
                alt="Pop Art Burst Style Example"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-yellow-400 rounded-full p-3 shadow-lg border-2 border-black">
              <Zap className="w-6 h-6 text-black" />
            </div>
            {/* Comic-style burst decoration */}
            <div className="absolute -top-4 -left-4 bg-red-500 text-white font-bold px-3 py-2 rounded-lg border-2 border-black transform -rotate-12">
              POW!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstHero;
