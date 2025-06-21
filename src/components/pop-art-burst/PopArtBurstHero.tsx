
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

interface PopArtBurstHeroProps {
  onStartCreating: () => void;
}

const PopArtBurstHero = ({ onStartCreating }: PopArtBurstHeroProps) => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-red-100 via-yellow-100 to-blue-100 relative overflow-hidden">
      {/* Comic book style background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 text-6xl font-black text-red-500 transform -rotate-12">POW!</div>
        <div className="absolute bottom-20 right-20 text-4xl font-black text-blue-500 transform rotate-12">BANG!</div>
        <div className="absolute top-1/2 left-1/4 text-3xl font-black text-yellow-500 transform -rotate-6">ZAP!</div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full font-bold mb-8 border-4 border-black shadow-lg">
          <Zap className="w-5 h-5 mr-2" />
          Pop Art Burst
        </div>
        
        <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent leading-tight" 
            style={{ textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000' }}>
          Comic Book Magic
        </h1>
        
        <p className="text-2xl font-bold text-gray-800 mb-4 border-4 border-black bg-white px-6 py-3 inline-block transform -rotate-1">
          Bold, retro, and impossible to ignore.
        </p>
        
        <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
          Transform your photos into vibrant pop art masterpieces with comic book flair, halftone textures, and Warhol-inspired style.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            onClick={onStartCreating}
            size="lg"
            className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white px-8 py-4 text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-black rounded-full"
          >
            Create Your Pop Art
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-red-500 border-2 border-white flex items-center justify-center font-bold text-white">1</div>
              <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center font-bold text-white">2</div>
              <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center font-bold text-white">3</div>
            </div>
            <span className="font-semibold">Join 50k+ pop art creators</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstHero;
