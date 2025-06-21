
import { Upload, Palette, Settings, Package } from "lucide-react";

const EmbroideredMomentsHowItWorks = () => {
  return (
    <section className="py-16 bg-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">Choose Style</h3>
            <p className="text-gray-600 text-sm">Select Embroidered Moments</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">Upload Photo</h3>
            <p className="text-gray-600 text-sm">Share your precious moment</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">Craft</h3>
            <p className="text-gray-600 text-sm">Choose size & add AR</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-900">Treasure Forever</h3>
            <p className="text-gray-600 text-sm">A modern heirloom to cherish</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmbroideredMomentsHowItWorks;
