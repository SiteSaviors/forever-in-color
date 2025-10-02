
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Heart, Crown } from "@/components/ui/icons";

const PastelBlissFeatures = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Eye className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Detailed Portraits</h3>
              <p className="text-gray-600">Capturing every subtle feature with lifelike precision</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Romantic Gifts</h3>
              <p className="text-gray-600">Soft, elegant artwork perfect for anniversaries and weddings</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Crown className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sophisticated Spaces</h3>
              <p className="text-gray-600">Refined artwork that adds elegance to any room</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PastelBlissFeatures;
