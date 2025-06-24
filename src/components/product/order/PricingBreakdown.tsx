
import { Badge } from "@/components/ui/badge";

interface PricingBreakdownProps {
  subtotal: number;
  shipping: number;
  total: number;
}

const PricingBreakdown = ({ subtotal, shipping, total }: PricingBreakdownProps) => {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Shipping</span>
        <span className="text-gray-900 font-medium">
          {shipping === 0 ? (
            <Badge variant="secondary" className="text-green-700 bg-green-100 text-xs">
              Free
            </Badge>
          ) : (
            `$${shipping.toFixed(2)}`
          )}
        </span>
      </div>
      {subtotal > 75 && (
        <div className="text-xs text-green-600 text-right">
          🎉 You qualify for free shipping!
        </div>
      )}
      <div className="flex justify-between text-lg font-bold pt-2 border-t">
        <span className="text-gray-900">Total</span>
        <span className="text-gray-900">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PricingBreakdown;
