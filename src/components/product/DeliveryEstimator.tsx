
import { Truck, Calendar, MapPin } from "@/components/ui/icons";
import { Card, CardContent } from "@/components/ui/card";

const DeliveryEstimator = () => {
  // Calculate delivery dates (4-7 days from now)
  const today = new Date();
  const earliestDelivery = new Date(today);
  earliestDelivery.setDate(today.getDate() + 4);
  
  const latestDelivery = new Date(today);
  latestDelivery.setDate(today.getDate() + 7);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Fast Delivery</h4>
            <p className="text-sm text-gray-600">Your canvas will arrive in 4-7 business days</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Expected delivery: {formatDate(earliestDelivery)} - {formatDate(latestDelivery)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Ships from our US production facility</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-gray-500">
            🎨 <strong>Production time:</strong> 2-3 days • 📦 <strong>Shipping:</strong> 2-4 days
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryEstimator;
