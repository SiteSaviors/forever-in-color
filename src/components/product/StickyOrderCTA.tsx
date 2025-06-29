
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface StickyOrderCTAProps {
  total: number;
  isVisible: boolean;
  onPlaceOrder: () => void;
}

const StickyOrderCTA = ({ total, isVisible, onPlaceOrder }: StickyOrderCTAProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-lg font-bold text-gray-900">${total.toFixed(2)}</p>
        </div>
        <Button 
          onClick={onPlaceOrder}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Place Order
        </Button>
      </div>
    </div>
  );
};

export default StickyOrderCTA;
