
import { Button } from "@/components/ui/button";

const CarouselCTA = () => {
  return (
    <div className="text-center mt-12">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Photo?</h3>
        <p className="text-gray-600 mb-6">
          Choose your favorite style and start creating your custom artwork in minutes
        </p>
        <Button 
          onClick={() => window.location.href = '/product'}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold border-0"
        >
          Start Creating Now
        </Button>
      </div>
    </div>
  );
};

export default CarouselCTA;
