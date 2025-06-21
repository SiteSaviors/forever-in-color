
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

const CalmWatercolorARPreview = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Bring Your Art to Life</h2>
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Play className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Add AR Magic (Optional)</h3>
          <p className="text-gray-600 mb-6">
            Include a QR code that brings your Calm Watercolor to life with a short video when scanned with any smartphone.
          </p>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default CalmWatercolorARPreview;
