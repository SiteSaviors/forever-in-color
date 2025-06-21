
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Gift } from "lucide-react";

const EmbroideredMomentsFeatures = () => {
  return (
    <section className="py-16 bg-orange-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 bg-white border-amber-200 hover:shadow-lg hover:shadow-amber-500/10 transition-shadow">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Family Portraits</h3>
              <p className="text-gray-600">Perfect for family portraits, baby gifts, or pet keepsakes</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-white border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-shadow">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Handmade Feel</h3>
              <p className="text-gray-600">For customers who love a handmade or vintage aesthetic</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 bg-white border-red-200 hover:shadow-lg hover:shadow-red-500/10 transition-shadow">
            <CardContent className="pt-6">
              <Gift className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Love & Tradition</h3>
              <p className="text-gray-600">Celebrating love, comfort, and tradition in a modern way</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default EmbroideredMomentsFeatures;
