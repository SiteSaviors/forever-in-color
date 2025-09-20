
import { Button } from "@/components/ui/button";
import { ShoppingCart, Sparkles } from "lucide-react";

interface DesktopLayoutProps {
  selectedSize: string;
  basePrice: number;
  customizationPrice: number;
  totalPrice: number;
  savings: number;
  isProcessing: boolean;
  onQuickPurchase: () => void;
}

const DesktopLayout = ({
  selectedSize,
  basePrice,
  customizationPrice,
  totalPrice,
  savings,
  isProcessing,
  onQuickPurchase
}: DesktopLayoutProps) => {
  return (
    <div className="hidden md:flex md:items-center gap-3 md:gap-0 md:justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-600">Your Canvas</span>
          {selectedSize && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full whitespace-nowrap">
              {selectedSize}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          {basePrice > 0 && (
            <div className="text-gray-500">
              Base: <span className="font-semibold">${basePrice.toFixed(2)}</span>
            </div>
          )}
          
          {customizationPrice > 0 && (
            <div className="text-gray-500">
              Add-ons: <span className="font-semibold text-purple-600">+${customizationPrice.toFixed(2)}</span>
            </div>
          )}
          
          {savings > 0 && (
            <div className="text-green-600 font-medium">Save ${savings}!</div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-4">
        <div className="text-right">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold text-gray-900 font-poppins tracking-tight">
            ${totalPrice > 0 ? (totalPrice - savings).toFixed(2) : '0.00'}
          </div>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-base px-4 py-2 whitespace-nowrap"
          size="default"
          disabled={totalPrice === 0 || isProcessing}
          onClick={onQuickPurchase}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Buy Now'}
        </Button>
      </div>
    </div>
  );
};

export default DesktopLayout;
