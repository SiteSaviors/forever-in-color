
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Layers, DollarSign } from "@/components/ui/icons";

interface AbstractFusionHeroProps {
  onStartCreating: () => void;
}

const AbstractFusionHero = ({ onStartCreating }: AbstractFusionHeroProps) => {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
                Modern Art Fusion
              </Badge>
              <h1 className="text-8xl lg:text-12xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">Abstract 
Fusion</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                "Dynamic swirls and vibrant colors blend in perfect harmony"
              </p>
            </div>
            
            <Button 
              onClick={onStartCreating} 
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-16 py-8 rounded-full text-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Start Creating in This Style
              <ArrowRight className="w-8 h-8 ml-4" />
            </Button>

            {/* Pricing Badge */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
                <DollarSign className="w-4 h-4 text-gray-600 mr-1" />
                <span className="text-sm font-medium text-gray-700">Starting at only $119.99</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="/lovable-uploads/917203b5-e096-43e3-a992-115124cf0e42.png" 
                alt="Abstract Fusion Style Example" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AbstractFusionHero;
