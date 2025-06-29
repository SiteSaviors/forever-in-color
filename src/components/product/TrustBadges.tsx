
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Truck, RotateCcw, Star } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: "Secure Payment",
      description: "256-bit SSL encryption"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over $75"
    },
    {
      icon: RotateCcw,
      title: "30-Day Returns",
      description: "Money-back guarantee"
    },
    {
      icon: Star,
      title: "5-Star Reviews",
      description: "Trusted by thousands"
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Why Choose Us?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-2">
                <badge.icon className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-sm mb-1">{badge.title}</h4>
              <p className="text-xs text-gray-600">{badge.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustBadges;
