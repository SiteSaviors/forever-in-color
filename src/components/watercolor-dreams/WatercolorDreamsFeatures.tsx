
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Palette, Star } from "lucide-react";

const WatercolorDreamsFeatures = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Creative Spaces</h3>
              <p className="text-gray-600">Energetic artwork that inspires creativity and passion</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Palette className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Modern Art Lovers</h3>
              <p className="text-gray-600">Bold, contemporary style for those who love expressive art</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Star className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Statement Pieces</h3>
              <p className="text-gray-600">Dramatic artwork that becomes the focal point of any room</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WatercolorDreamsFeatures;
