
import { Upload, Crown, Settings, Package } from "lucide-react";

const DecoLuxeHowItWorks = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-amber-50 to-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-stone-800 mb-12 font-serif">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold mb-3 text-stone-800 text-lg">Choose Style</h3>
            <p className="text-stone-600 text-sm leading-relaxed">Select Deco Luxe for sophisticated Art Deco elegance</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold mb-3 text-stone-800 text-lg">Upload Photo</h3>
            <p className="text-stone-600 text-sm leading-relaxed">Share your image to transform into luxury art</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold mb-3 text-stone-800 text-lg">Personalize</h3>
            <p className="text-stone-600 text-sm leading-relaxed">Choose size and add premium AR features</p>
          </div>
          
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-semibold mb-3 text-stone-800 text-lg">Receive Your Art</h3>
            <p className="text-stone-600 text-sm leading-relaxed">Ready to display with timeless sophistication</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeHowItWorks;
