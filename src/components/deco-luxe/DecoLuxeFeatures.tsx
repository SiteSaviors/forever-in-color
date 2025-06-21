
import { Card, CardContent } from "@/components/ui/card";
import { Diamond, Crown, Heart } from "lucide-react";

const DecoLuxeFeatures = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Diamond className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sophisticated Portraits</h3>
              <p className="text-gray-600">Elegant artwork with geometric precision and luxurious appeal</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Crown className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wedding & Anniversary Gifts</h3>
              <p className="text-gray-600">Timeless elegance perfect for celebrating special moments</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">High-End Decor</h3>
              <p className="text-gray-600">Personalized keepsakes that add luxury to any space</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeFeatures;
