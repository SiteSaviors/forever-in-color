
import { Truck, Shield, Award } from "lucide-react";

const TrustElements = () => {
  return (
    <div className="mt-6 mb-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Free Shipping */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-md border border-white/30 hover:shadow-lg hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-green-100/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Truck className="w-3 h-3 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-xs md:text-sm">Free Shipping</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              On all domestic orders!
            </p>
          </div>

          {/* Satisfaction Guarantee */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-md border border-white/30 hover:shadow-lg hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-blue-100/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-3 h-3 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-xs md:text-sm">30-Day Guarantee</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Satisfaction guarantee
            </p>
          </div>

          {/* Premium Canvas */}
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 md:p-4 shadow-md border border-white/30 hover:shadow-lg hover:bg-white/80 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-purple-100/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Award className="w-3 h-3 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-xs md:text-sm">Museum Quality</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Premium 1.25" canvas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustElements;
