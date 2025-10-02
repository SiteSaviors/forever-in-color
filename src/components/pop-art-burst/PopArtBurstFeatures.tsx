
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Eye, Star } from "@/components/ui/icons";

const PopArtBurstFeatures = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-red-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-white border-2 border-red-200 hover:shadow-lg hover:shadow-red-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Palette className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Retro Vibes</h3>
              <p className="text-gray-600">Bring vintage comic book energy to any space</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-white border-2 border-yellow-200 hover:shadow-lg hover:shadow-yellow-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Eye className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Bold Statements</h3>
              <p className="text-gray-600">Make an unforgettable visual impact with iconic style</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-white border-2 border-blue-200 hover:shadow-lg hover:shadow-blue-500/20 transition-shadow">
            <CardContent className="pt-6">
              <Star className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Fun Gifts</h3>
              <p className="text-gray-600">Perfect for playful, memorable presents</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstFeatures;
