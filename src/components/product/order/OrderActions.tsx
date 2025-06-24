
import { Button } from "@/components/ui/button";

interface OrderActionsProps {
  total: number;
}

const OrderActions = ({ total }: OrderActionsProps) => {
  return (
    <div className="space-y-3">
      <Button 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
        size="lg"
      >
        Complete Order • ${total.toFixed(2)}
      </Button>
      <p className="text-xs text-center text-gray-500">
        Secure checkout powered by Stripe • 30-day money-back guarantee
      </p>
    </div>
  );
};

export default OrderActions;
