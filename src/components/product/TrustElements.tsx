
import { Check } from "lucide-react";

const TrustElements = () => {
  return (
    <div className="mt-12 text-center">
      <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>Free shipping on all orders</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>30-day satisfaction guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>Premium 1.25" depth canvas</span>
        </div>
      </div>
    </div>
  );
};

export default TrustElements;
