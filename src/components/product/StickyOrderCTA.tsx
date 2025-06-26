
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Shield, Truck } from "lucide-react";

interface StickyOrderCTAProps {
  total: number;
  isVisible: boolean;
  onPlaceOrder: () => void;
}

const StickyOrderCTA = ({ total, isVisible, onPlaceOrder }: StickyOrderCTAProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-3 sm:p-4 safe-area-inset-bottom">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Mobile Layout */}
        <div className="flex sm:hidden items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-600">Total</div>
            <div className="text-lg font-bold text-gray-900 truncate">${total.toFixed(2)}</div>
          </div>
          <Button 
            onClick={onPlaceOrder}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 font-semibold flex-shrink-0 touch-manipulation min-h-[48px]"
            size="lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Order Now</span>
          </Button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          {/* Trust Elements */}
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-600" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-blue-600" />
              <span>Free Shipping</span>
            </div>
          </div>

          {/* Order Total & CTA */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-lg font-bold text-gray-900">${total.toFixed(2)}</div>
            </div>
            <Button 
              onClick={onPlaceOrder}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-base font-semibold touch-manipulation min-h-[48px]"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Place Order
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Trust Elements */}
        <div className="flex sm:hidden justify-center gap-3 sm:gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span>30-Day Guarantee</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span>4-7 Day Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyOrderCTA;
