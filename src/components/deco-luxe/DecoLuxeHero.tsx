
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, DollarSign } from "lucide-react";

interface DecoLuxeHeroProps {
  onStartCreating: () => void;
}

const DecoLuxeHero = ({ onStartCreating }: DecoLuxeHeroProps) => {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-slate-50 via-amber-50 to-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">
                Luxurious Elegance
              </Badge>
              <h1 className="text-8xl lg:text-12xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent animate-pulse">
                  Deco Luxe
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                "Classic glam. Contemporary twist."
              </p>
            </div>
            
            <Button 
              onClick={onStartCreating}
              className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-gray-900 px-12 py-6 rounded-full text-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Start Creating in This Style
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            {/* Pricing Badge */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
                <DollarSign className="w-4 h-4 text-gray-600 mr-1" />
                <span className="text-sm font-medium text-gray-700">Starting at only $99.99</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png"
                alt="Deco Luxe Style Example"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeHero;
