
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-base font-semibold"
            size="lg"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyOrderCTA;
