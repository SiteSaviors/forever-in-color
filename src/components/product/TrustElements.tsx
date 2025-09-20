import { Truck, Shield, Award } from "lucide-react";
const TrustElements = () => {
  return <div className="mt-6 mb-4 my-[11px]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Free Shipping */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-xl border border-white/40 hover:shadow-2xl hover:bg-white/30 transition-all duration-300 backdrop-saturate-150">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-green-100/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <Truck className="w-3 h-3 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-xs md:text-sm drop-shadow-sm">Free Shipping</h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed drop-shadow-sm">
              On all domestic orders!
            </p>
          </div>

          {/* Satisfaction Guarantee */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-xl border border-white/40 hover:shadow-2xl hover:bg-white/30 transition-all duration-300 backdrop-saturate-150">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-blue-100/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <Shield className="w-3 h-3 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-xs md:text-sm drop-shadow-sm">30-Day Guarantee</h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed drop-shadow-sm">
              Satisfaction guarantee
            </p>
          </div>

          {/* Premium Canvas */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-xl border border-white/40 hover:shadow-2xl hover:bg-white/30 transition-all duration-300 backdrop-saturate-150">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-purple-100/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <Award className="w-3 h-3 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-xs md:text-sm drop-shadow-sm">Museum Quality</h3>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed drop-shadow-sm">
              Premium 1.25" canvas
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default TrustElements;