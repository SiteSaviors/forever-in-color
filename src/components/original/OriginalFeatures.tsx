
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Clock, Shield } from "@/components/ui/icons";

const OriginalFeatures = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Camera className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cherished Moments</h3>
              <p className="text-gray-600">Preserve your perfect photos exactly as captured</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Professional Portraits</h3>
              <p className="text-gray-600">Showcase professional photography with crisp clarity</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Memory Preservation</h3>
              <p className="text-gray-600">Keep precious memories vibrant for years to come</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default OriginalFeatures;
