
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, DollarSign } from "@/components/ui/icons";

interface ElectricBloomHeroProps {
  onStartCreating: () => void;
}

const ElectricBloomHero = ({ onStartCreating }: ElectricBloomHeroProps) => {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-400/30">
                Cinematic Energy
              </Badge>
              <h1 className="text-8xl lg:text-12xl font-bold mb-6">
                <span className="bg-gradient-to-r from-lime-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Electric Bloom
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                "Radiant, high-voltage energy with a modern, cinematic edge."
              </p>
            </div>
            
            <Button 
              onClick={onStartCreating}
              className="bg-gradient-to-r from-lime-500 to-orange-600 hover:from-lime-600 hover:to-orange-700 text-white font-bold px-12 py-6 rounded-full text-xl shadow-2xl shadow-lime-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Start Creating in This Style
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            {/* Pricing Badge */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-slate-800/50 rounded-full px-3 py-1 border border-slate-600">
                <DollarSign className="w-4 h-4 text-slate-400 mr-1" />
                <span className="text-sm font-medium text-slate-300">Starting at only $99.99</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-blue-400/20">
              <img 
                src="/lovable-uploads/f9e1b137-663e-403f-8117-56679fe2de93.png"
                alt="Electric Bloom Style Example"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-slate-900 rounded-full p-3 shadow-lg border border-blue-400/30">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElectricBloomHero;
