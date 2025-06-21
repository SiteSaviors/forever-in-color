
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

const ArtisticMashupARPreview = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Bring Your Art to Life</h2>
        <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-8 border border-orange-200">
          <div className="flex items-center justify-center mb-6">
            <Play className="w-12 h-12 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Add AR Magic (Optional)</h3>
          <p className="text-gray-600 mb-6">
            Include a QR code that brings your Artistic Mashup to life with layered animations and creative transitions when scanned with any smartphone.
          </p>
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default ArtisticMashupARPreview;
