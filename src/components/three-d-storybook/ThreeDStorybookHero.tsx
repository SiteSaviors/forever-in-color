
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Heart, DollarSign } from "@/components/ui/icons";

interface ThreeDStorybookHeroProps {
  onStartCreating: () => void;
}

const ThreeDStorybookHero = ({ onStartCreating }: ThreeDStorybookHeroProps) => {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0%,transparent_50%)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-pink-500/20 text-pink-700 border-pink-400/30">
                Pixar Magic
              </Badge>
              <h1 className="text-6xl lg:text-8xl font-bold mb-6">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  3D Storybook
                </span>
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                "Playful, animated, and full of personality."
              </p>
            </div>
            
            <Button 
              onClick={onStartCreating}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-12 py-6 rounded-full text-xl shadow-2xl shadow-pink-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Start Creating in This Style
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>

            {/* Pricing Badge */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white/50 rounded-full px-3 py-1 border border-pink-200">
                <DollarSign className="w-4 h-4 text-pink-600 mr-1" />
                <span className="text-sm font-medium text-pink-800">Starting at only $99.99</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
              <img 
                src="/lovable-uploads/163d0898-810c-431b-a6c9-04c7e8423791.png"
                alt="3D Storybook Style Example"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent"></div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-pink-500 rounded-full p-3 shadow-lg border border-white animate-bounce">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeDStorybookHero;
