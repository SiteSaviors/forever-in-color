
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Shield, Clock } from "lucide-react";

interface PricingSummaryItem {
  label: string;
  price: number;
  isIncluded?: boolean;
}

interface PricingSummaryProps {
  items: PricingSummaryItem[];
  subtotal: number;
  shipping?: number;
  total: number;
  size?: string;
  styleName?: string;
}

const PricingSummary = memo(({
  items,
  subtotal,
  shipping = 0,
  total,
  size,
  styleName
}: PricingSummaryProps) => {
  const trustFeatures = [
    { icon: Truck, text: "Free shipping", subtext: "5-7 business days" },
    { icon: Shield, text: "Satisfaction guaranteed", subtext: "30-day returns" },
    { icon: Clock, text: "Fast production", subtext: "Ships within 2 days" }
  ];

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Order Summary
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Fast Delivery
          </Badge>
        </CardTitle>
        {(size || styleName) && (
          <div className="text-sm text-gray-600">
            {styleName && <span>{styleName}</span>}
            {size && styleName && <span> • </span>}
            {size && <span>{size}</span>}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="text-sm font-medium">
                {item.isIncluded ? (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Included
                  </Badge>
                ) : (
                  `$${item.price.toFixed(2)}`
                )}
              </span>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Subtotal</span>
            <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm">Shipping</span>
            <span className="text-sm font-medium">
              {shipping === 0 ? (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Free
                </Badge>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">Total</span>
          <span className="text-xl font-bold text-purple-600">${total.toFixed(2)}</span>
        </div>
        
        <div className="space-y-2 pt-4 border-t border-gray-100">
          {trustFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <IconComponent className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-xs font-medium text-gray-700">{feature.text}</div>
                  <div className="text-xs text-gray-500">{feature.subtext}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

PricingSummary.displayName = 'PricingSummary';

export default PricingSummary;
