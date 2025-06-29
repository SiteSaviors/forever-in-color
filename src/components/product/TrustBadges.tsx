
import { Shield, Star, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const trustBadges = [
  {
    icon: Shield,
    text: "Secure Payment",
    description: "256-bit SSL encryption"
  },
  {
    icon: Star,
    text: "5-Star Rated",
    description: "Thousands of happy customers"
  },
  {
    icon: Truck,
    text: "Fast Delivery",
    description: "5-7 business days"
  }
];

const TrustBadges = () => {
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      {trustBadges.map((badge, index) => {
        const IconComponent = badge.icon;
        return (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-800 border-green-200"
          >
            <IconComponent className="w-4 h-4" />
            <div className="text-left">
              <div className="font-semibold text-sm">{badge.text}</div>
              <div className="text-xs opacity-80">{badge.description}</div>
            </div>
          </Badge>
        );
      })}
    </div>
  );
};

export default TrustBadges;
