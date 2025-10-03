
import { Shield, Truck, Award, Star, CheckCircle } from "@/components/ui/icons";

const TrustBadges = () => {
  return (
    <div className="space-y-6">
      {/* Main Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
          <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="font-semibold text-gray-900 text-sm">30-Day Guarantee</div>
          <div className="text-xs text-gray-600">Money back if not satisfied</div>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
          <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="font-semibold text-gray-900 text-sm">Free Shipping</div>
          <div className="text-xs text-gray-600">On all domestic orders</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="font-semibold text-gray-900 text-sm">Museum Quality</div>
          <div className="text-xs text-gray-600">Premium 1.25" canvas</div>
        </div>
      </div>

      {/* Additional Reassurance */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">Secure SSL encrypted checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">Order tracking & updates</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">Expert customer support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-700">Fast 3-5 day production</span>
          </div>
        </div>
      </div>

      {/* Customer Reviews Summary */}
      <div className="text-center py-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="font-semibold text-gray-900">4.9/5</span>
        </div>
        <p className="text-sm text-gray-600">
          Join over <strong>50,000+ happy customers</strong> who transformed their memories into art
        </p>
      </div>
    </div>
  );
};

export default TrustBadges;
