
import { Card, CardContent } from "@/components/ui/card";
import { Camera, BookOpen, Users } from "@/components/ui/icons";

const ArtisanCharcoalFeatures = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Camera className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Portrait Photography</h3>
              <p className="text-gray-600">Transform professional photos into timeless charcoal masterpieces</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Literary & Academic Gifts</h3>
              <p className="text-gray-600">Sophisticated artwork for book lovers and scholarly spaces</p>
            </CardContent>
          </Card>
          
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-stone-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Professional Settings</h3>
              <p className="text-gray-600">Elegant monochrome art perfect for offices and galleries</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ArtisanCharcoalFeatures;
