
import { Upload, Sparkles, Settings, Package } from "lucide-react";

const GemstonePolyHowItWorks = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Choose Gemstone Poly</h3>
            <p className="text-gray-300 text-sm">Select crystalline transformation</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Upload Photo</h3>
            <p className="text-gray-300 text-sm">Share your precious moment</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Customize Options</h3>
            <p className="text-gray-300 text-sm">Select size & add AR magic</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Receive Your Gem</h3>
            <p className="text-gray-300 text-sm">Prismatic, modern perfection</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GemstonePolyHowItWorks;
