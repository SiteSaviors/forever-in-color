
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Gift, Crown } from "lucide-react";

const ClassicOilFeatures = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Memorial Art</h3>
              <p className="text-gray-600">Honor loved ones with dignified, timeless portraits</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Crown className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Grandparents & Heirlooms</h3>
              <p className="text-gray-600">Create family treasures to pass down generations</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Gift className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wedding & Anniversary Gifts</h3>
              <p className="text-gray-600">Celebrate love with museum-quality romance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ClassicOilFeatures;
