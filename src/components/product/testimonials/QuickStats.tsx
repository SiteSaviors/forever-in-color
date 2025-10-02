
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, Camera, Heart, LucideIcon } from "@/components/ui/icons";

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

const QuickStats = () => {
  const quickStats: StatItem[] = [
    { icon: Users, label: "Happy Customers", value: "50,000+" },
    { icon: Star, label: "Average Rating", value: "4.9/5" },
    { icon: Camera, label: "Canvases Created", value: "75,000+" },
    { icon: Heart, label: "Love Stories", value: "12,500+" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      {quickStats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="text-center bg-white/80 backdrop-blur-sm border-gray-200">
            <CardContent className="pt-6">
              <IconComponent className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickStats;
