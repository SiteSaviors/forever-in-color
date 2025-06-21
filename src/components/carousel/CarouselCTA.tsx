
import { Button } from "@/components/ui/button";

const CarouselCTA = () => {
  return (
    <div className="text-center mt-12">
      <div className="bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/40 max-w-3xl mx-auto relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/20 rounded-3xl"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            Ready to Transform Your Photo?
          </h3>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed font-medium max-w-xl mx-auto">
            Choose your favorite style and start creating your custom artwork in minutes
          </p>
          <Button 
            onClick={() => window.location.href = '/product'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-semibold border-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start Creating Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarouselCTA;
