
import { Card, CardContent } from "@/components/ui/card";
import { Users, Palette, Heart } from "lucide-react";

const ArtisticMashupFeatures = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Story-Driven Moments</h3>
              <p className="text-gray-600">Perfect for friend groups, memories, and milestone celebrations</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Palette className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Creative Personalities</h3>
              <p className="text-gray-600">For those who love color, chaos, and artistic expression</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personal & Unique</h3>
              <p className="text-gray-600">Less traditional, more personal—artwork that tells your story</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ArtisticMashupFeatures;
