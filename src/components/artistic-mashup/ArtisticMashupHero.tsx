
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Layers, DollarSign } from "lucide-react";

interface ArtisticMashupHeroProps {
  onStartCreating: () => void;
}

const ArtisticMashupHero = ({ onStartCreating }: ArtisticMashupHeroProps) => {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-orange-50 via-red-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
                Handcrafted Fusion
              </Badge>
              <h1 className="text-8xl lg:text-12xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 bg-clip-text text-transparent">Artistic 
Mashup</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                "A creative collision of styles—bold, expressive, and one of a kind"
              </p>
            </div>
            
            <Button 
              onClick={onStartCreating} 
              className="bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 text-white px-16 py-8 rounded-full text-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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
                src="/lovable-uploads/60a93ae3-c149-4515-aa89-356396b7ff33.png" 
                alt="Artistic Mashup Style Example" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
              <Layers className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisticMashupHero;
