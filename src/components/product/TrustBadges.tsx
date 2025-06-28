
import { Shield, Award, Truck, Heart } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      title: "100% Secure",
      description: "Your photos are safe with us"
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Museum-grade canvas materials"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On all orders over $75"
    },
    {
      icon: Heart,
      title: "Love Guarantee", 
      description: "30-day money back promise"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div key={index} className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{badge.title}</h3>
            <p className="text-sm text-gray-600">{badge.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default TrustBadges;
