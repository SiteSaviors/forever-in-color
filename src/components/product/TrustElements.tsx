
import { Truck, Shield, Award } from "lucide-react";

const TrustElements = () => {
  return (
    <div className="mt-6 mb-4 my-[11px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Free Shipping */}
          <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <Truck className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Free Shipping</span>
          </div>

          {/* Satisfaction Guarantee */}
          <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">100% Satisfaction</span>
          </div>

          {/* Premium Canvas */}
          <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <Award className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Premium Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustElements;
