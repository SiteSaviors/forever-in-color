
import { DollarSign } from "@/components/ui/icons";
import { SizeOption } from "../types";

interface PriceUpdateDisplayProps {
  selectedSize: string;
  currentSizeOption: SizeOption | null;
}

const PriceUpdateDisplay = ({ selectedSize, currentSizeOption }: PriceUpdateDisplayProps) => {
  if (!selectedSize || !currentSizeOption) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-green-700">
        <DollarSign className="w-5 h-5" />
        <span className="text-lg font-semibold">
          Starting at ${currentSizeOption.salePrice} for {selectedSize} canvas
        </span>
      </div>
      <p className="text-sm text-green-600 mt-1">
        Final price will be calculated with your customizations
      </p>
    </div>
  );
};

export default PriceUpdateDisplay;
