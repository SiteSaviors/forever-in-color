
import { Truck, Shield, Award } from "lucide-react";

const TrustElements = () => {
  return (
    <div className="mt-8 mb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Free Shipping */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Free Shipping</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              On all domestic orders!
            </p>
          </div>

          {/* Satisfaction Guarantee */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">30-Day Guarantee</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              Satisfaction guarantee
            </p>
          </div>

          {/* Premium Canvas */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Museum Quality</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              Premium 1.25" canvas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustElements;
