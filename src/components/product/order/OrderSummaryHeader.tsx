
import { ShoppingCart } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

const OrderSummaryHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" />
        Order Summary
      </CardTitle>
    </CardHeader>
  );
};

export default OrderSummaryHeader;
