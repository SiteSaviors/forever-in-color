
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, DollarSign } from "lucide-react";

interface EmbroideredMomentsHeroProps {
  onStartCreating: () => void;
}

const EmbroideredMomentsHero = ({ onStartCreating }: EmbroideredMomentsHeroProps) => {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">
                Hand-stitched Charm
              </Badge>
              <h1 className="text-8xl lg:text-12xl font-bold mb-6">
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Embroidered Moments
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                "Hand-stitched charm, digitally reimagined."
              </p>
            </div>
            
            <Button 
              onClick={onStartCreating}
              className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white font-bold px-12 py-6 rounded-full text-xl hover:shadow-2xl hover:shadow-amber-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Start Creating in This Style
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            {/* Pricing Badge */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white/50 rounded-full px-3 py-1 border border-amber-200">
                <DollarSign className="w-4 h-4 text-amber-600 mr-1" />
                <span className="text-sm font-medium text-amber-700">Starting at only $109.99</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/20">
              <img 
                src="/lovable-uploads/6371ab02-6a24-43ef-98b7-42de878f265a.png"
                alt="Embroidered Moments Style Example"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg border border-amber-500/30">
              <Heart className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmbroideredMomentsHero;
