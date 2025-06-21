
import { Upload, Palette, Settings, Package } from "lucide-react";

const ElectricBloomHowItWorks = () => {
  return (
    <section className="py-16 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-black font-bold" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Choose Style</h3>
            <p className="text-gray-400 text-sm">Select Electric Bloom</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-black font-bold" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Upload Photo</h3>
            <p className="text-gray-400 text-sm">Share your electric moment</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-black font-bold" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Electrify</h3>
            <p className="text-gray-400 text-sm">Choose size & add AR</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-black font-bold" />
            </div>
            <h3 className="font-semibold mb-2 text-white">Illuminate Your Space</h3>
            <p className="text-gray-400 text-sm">Ready to glow & inspire</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElectricBloomHowItWorks;
