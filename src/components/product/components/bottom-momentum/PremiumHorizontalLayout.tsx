
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Crown, Sparkles, TrendingUp } from "lucide-react";

interface PremiumHorizontalLayoutProps {
  selectedSize: string;
  basePrice: number;
  customizationPrice: number;
  totalPrice: number;
  savings: number;
  isProcessing: boolean;
  onQuickPurchase: () => void;
}

const PremiumHorizontalLayout = ({
  selectedSize,
  basePrice,
  customizationPrice,
  totalPrice,
  savings,
  isProcessing,
  onQuickPurchase
}: PremiumHorizontalLayoutProps) => {
  return (
    <div className="flex items-center justify-between gap-8">
      {/* Left: Product Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              Premium Canvas Print
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {selectedSize} • Museum Quality
            </p>
          </div>
        </div>

        <Separator orientation="vertical" className="h-12 bg-gray-200" />

        {/* Pricing Breakdown */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Base</p>
            <p className="text-lg font-bold text-gray-900">${basePrice}</p>
          </div>
          
          {customizationPrice > 0 && (
            <>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Add-ons</p>
                <p className="text-lg font-bold text-purple-600">+${customizationPrice}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Pricing & CTA */}
      <div className="flex items-center gap-6">
        {/* Savings Badge */}
        {savings > 0 && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 px-3 py-1.5 text-sm font-semibold">
            <TrendingUp className="w-4 h-4 mr-1" />
            Save ${savings}
          </Badge>
        )}

        {/* Total Price */}
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">${totalPrice}</span>
            {savings > 0 && (
              <span className="text-lg text-gray-400 line-through">${totalPrice + savings}</span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onQuickPurchase}
          disabled={isProcessing}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-200 min-w-[180px]"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Complete Order
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PremiumHorizontalLayout;
