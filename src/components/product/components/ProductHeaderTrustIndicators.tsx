
import { Crown, Shield, Truck } from "lucide-react";

interface ProductHeaderTrustIndicatorsProps {}

const ProductHeaderTrustIndicators = ({}: ProductHeaderTrustIndicatorsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-12">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        <div className="relative flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <div className="font-bold text-purple-700 text-lg">Premium Quality</div>
            <div className="text-sm text-purple-600">Museum-grade canvas</div>
          </div>
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        <div className="relative flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <div className="font-bold text-green-700 text-lg">Secure Checkout</div>
            <div className="text-sm text-green-600">SSL protected</div>
          </div>
        </div>
      </div>
      
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        <div className="relative flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-700 text-lg">Free Shipping</div>
            <div className="text-sm text-blue-600">Orders $75+</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeaderTrustIndicators;
