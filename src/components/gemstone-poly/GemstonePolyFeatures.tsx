
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Gift, Crown } from "@/components/ui/icons";

const GemstonePolyFeatures = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Modern Portraits</h3>
              <p className="text-gray-600">Transform loved ones into stunning geometric art</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Crown className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Pet & Family Art</h3>
              <p className="text-gray-600">Create eye-catching displays with strong emotional energy</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Gift className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Digital Art Lovers</h3>
              <p className="text-gray-600">Perfect for fans of modern decor and unique visual storytelling</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GemstonePolyFeatures;
