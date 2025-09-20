
import { Button } from "@/components/ui/button";
import { ShoppingCart, Sparkles } from "lucide-react";

interface MobileLayoutProps {
  selectedSize: string;
  basePrice: number;
  customizationPrice: number;
  totalPrice: number;
  savings: number;
  isProcessing: boolean;
  onQuickPurchase: () => void;
}

const MobileLayout = ({
  selectedSize,
  basePrice,
  customizationPrice,
  totalPrice,
  savings,
  isProcessing,
  onQuickPurchase
}: MobileLayoutProps) => {
  return (
    <div className="flex md:hidden items-center justify-between">
      <div className="flex-1 min-w-0 mr-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-600">Your Canvas</span>
          {selectedSize && (
            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {selectedSize}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          {basePrice > 0 && (
            <div className="text-gray-500">
              Base: <span className="font-semibold">${basePrice.toFixed(2)}</span>
            </div>
          )}
          
          {customizationPrice > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <div className="text-gray-500">
                Add-ons: <span className="font-semibold text-purple-600">+${customizationPrice.toFixed(2)}</span>
              </div>
            </>
          )}
          
          {savings > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <div className="text-green-600 font-medium">Save ${savings}!</div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-lg font-bold text-gray-900 font-poppins tracking-tight">
            ${totalPrice > 0 ? (totalPrice - savings).toFixed(2) : '0.00'}
          </div>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-sm px-3 py-2 whitespace-nowrap"
          size="default"
          disabled={totalPrice === 0 || isProcessing}
          onClick={onQuickPurchase}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {isProcessing ? 'Processing...' : 'Buy Now'}
        </Button>
      </div>
    </div>
  );
};

export default MobileLayout;
