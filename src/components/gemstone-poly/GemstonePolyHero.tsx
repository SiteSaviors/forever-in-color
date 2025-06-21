
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface GemstonePolyHeroProps {
  onStartCreating: () => void;
}

const GemstonePolyHero = ({ onStartCreating }: GemstonePolyHeroProps) => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center overflow-hidden">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 transform rotate-45 rounded-lg"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 transform rotate-12 rounded-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 transform -rotate-12 rounded-lg"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-amber-400 to-orange-500 transform rotate-45 rounded-lg"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="w-12 h-12 text-cyan-400 mr-4" />
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            Gemstone Poly
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-cyan-200 mb-8 max-w-3xl mx-auto leading-relaxed">
          Modern geometry meets radiant emotion
        </p>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-white mb-6">Crystalline Art, Digitally Sculpted</h2>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              Transform your photo into a shimmering mosaic of angular color — like a memory sculpted from light and crystal. 
              Inspired by gemstone facets and abstract geometry, this style blends sharp lines with soft gradients to create 
              a bold, modern portrait that feels both artistic and emotionally vibrant.
            </p>
            <p className="text-lg text-cyan-200 mb-8">
              It's a contemporary twist on polygonal art — polished, prismatic, and full of life.
            </p>
            <Button 
              onClick={onStartCreating}
              size="lg" 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create Your Gemstone Art
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <div className="relative">
            <div className="relative bg-gradient-to-br from-purple-800/30 to-blue-800/30 backdrop-blur-sm rounded-2xl p-8 border border-cyan-400/20">
              <img 
                src="/lovable-uploads/933dd4e5-58bc-404d-8c89-a93dcce93079.png"
                alt="Gemstone Poly Art Example"
                className="w-full rounded-lg shadow-2xl hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-pulse delay-75"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GemstonePolyHero;
