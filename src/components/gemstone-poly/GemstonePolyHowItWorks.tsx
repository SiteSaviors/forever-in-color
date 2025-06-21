
import { Upload, Gem, Settings, Package } from "lucide-react";

const GemstonePolyHowItWorks = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gem className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Choose Style</h3>
            <p className="text-gray-600 text-sm">Select Gemstone Poly</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Upload Photo</h3>
            <p className="text-gray-600 text-sm">Share your meaningful moment</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Personalize</h3>
            <p className="text-gray-600 text-sm">Choose size & add AR</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Receive Your Art</h3>
            <p className="text-gray-600 text-sm">Ready to display & admire</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GemstonePolyHowItWorks;
