
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, DollarSign } from "lucide-react";

interface ElectricBloomHeroProps {
  onStartCreating: () => void;
}

const ElectricBloomHero = ({ onStartCreating }: ElectricBloomHeroProps) => {
  return (
    <section className="relative pt-20 pb-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                Futuristic Energy
              </Badge>
              <h1 className="text-8xl lg:text-12xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  Electric Bloom
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                "Radiant, high-voltage energy with a modern, cinematic edge."
              </p>
            </div>
            
            <Button 
              onClick={onStartCreating}
              className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-black font-bold px-12 py-6 rounded-full text-xl hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Start Creating in This Style
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            {/* Pricing Badge */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-900/50 rounded-full px-3 py-1 border border-gray-700">
                <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm font-medium text-gray-300">Starting at only $99.99</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20">
              <img 
                src="/lovable-uploads/f9e1b137-663e-403f-8117-56679fe2de93.png"
                alt="Electric Bloom Style Example"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-black rounded-full p-3 shadow-lg border border-cyan-500/30">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElectricBloomHero;
