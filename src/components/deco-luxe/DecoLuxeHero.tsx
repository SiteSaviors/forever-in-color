
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles } from "lucide-react";

const DecoLuxeHero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/product", { 
      state: { 
        preSelectedStyle: 15,
        styleName: "Deco Luxe"
      } 
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-stone-900 via-amber-900 to-stone-800">
      {/* Art Deco Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #fbbf24 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #f59e0b 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      {/* Geometric Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 border-2 border-amber-400/30 rotate-45 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-yellow-500/20 rotate-12"></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rotate-45"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600/20 to-yellow-500/20 backdrop-blur-sm border border-amber-400/30 rounded-full px-6 py-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200 font-medium">Premium Art Deco Style</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent font-serif">
                Deco Luxe
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 font-light max-w-3xl mx-auto leading-relaxed">
              Sophisticated Art Deco elegance with geometric patterns and luxurious metallic accents
            </p>
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-stone-300 leading-relaxed mb-8">
              Deco Luxe blends the rich elegance of Art Deco with sleek, modern design. Featuring bold symmetry, 
              metallic accents, and geometric grace, this style brings timeless sophistication into the present. 
              Think Great Gatsby meets modern editorial — structured yet soft, iconic yet current.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105 border border-amber-500/50"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your Deco Luxe Art
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-amber-400/50 text-amber-200 hover:bg-amber-500/10 px-8 py-4 text-lg font-semibold rounded-lg backdrop-blur-sm"
            >
              View Gallery
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-lg mx-auto flex items-center justify-center border border-amber-400/30">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-200">Geometric Grace</h3>
              <p className="text-stone-300">Bold symmetry and clean lines with Art Deco sophistication</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-lg mx-auto flex items-center justify-center border border-amber-400/30">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-200">Metallic Accents</h3>
              <p className="text-stone-300">Luxurious gold highlights and elegant color palettes</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-yellow-600/20 rounded-lg mx-auto flex items-center justify-center border border-amber-400/30">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-amber-200">Timeless Elegance</h3>
              <p className="text-stone-300">Classic glamour with contemporary refinement</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeHero;
