
import { Upload, PenTool, Settings, Package } from "lucide-react";

const ArtisanCharcoalHowItWorks = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Choose Style</h3>
            <p className="text-gray-600 text-sm">Select Artisan Charcoal</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-stone-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Upload Photo</h3>
            <p className="text-gray-600 text-sm">Share your meaningful image</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-stone-700 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Personalize</h3>
            <p className="text-gray-600 text-sm">Choose size & add AR</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Receive Your Art</h3>
            <p className="text-gray-600 text-sm">Ready to display with pride</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtisanCharcoalHowItWorks;
