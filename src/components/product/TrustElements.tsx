
import { Truck, Shield, Award } from "lucide-react";

const TrustElements = () => {
  return (
    <div className="bg-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
            <Shield className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <div className="font-semibold text-gray-900 text-lg mb-1">30-Day Guarantee</div>
            <div className="text-sm text-gray-600">Money back if not satisfied</div>
          </div>
          
          <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
            <Truck className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <div className="font-semibold text-gray-900 text-lg mb-1">Free Shipping</div>
            <div className="text-sm text-gray-600">On all domestic orders</div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
            <Award className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <div className="font-semibold text-gray-900 text-lg mb-1">Museum Quality</div>
            <div className="text-sm text-gray-600">Premium 1.25" canvas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustElements;
