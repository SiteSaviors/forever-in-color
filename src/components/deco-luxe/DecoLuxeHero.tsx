
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface DecoLuxeHeroProps {
  onStartCreating: () => void;
}

const DecoLuxeHero = ({ onStartCreating }: DecoLuxeHeroProps) => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wide uppercase">Deco Luxe Style</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Classic Glam with a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-emerald-600">
                  Contemporary Twist
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Deco Luxe blends the rich elegance of Art Deco with sleek, modern design. 
                Featuring bold symmetry, metallic accents, and geometric grace that brings 
                timeless sophistication into the present.
              </p>
              <p className="text-lg text-gray-500 italic">
                Think Great Gatsby meets modern editorial — structured yet soft, iconic yet current.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onStartCreating}
                className="bg-gradient-to-r from-amber-600 to-emerald-600 text-white px-8 py-6 text-lg rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Create Your Deco Luxe Art
              </Button>
              <Button 
                variant="outline" 
                className="border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-6 text-lg rounded-full"
              >
                View Gallery
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-emerald-100 p-8 border border-amber-200/50">
              <img 
                src="/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png"
                alt="Deco Luxe Art Style Example"
                className="w-full h-full object-cover rounded-xl shadow-2xl"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-400 to-emerald-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-emerald-400 to-amber-400 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeHero;
