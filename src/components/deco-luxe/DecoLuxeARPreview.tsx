
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

const DecoLuxeARPreview = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Bring Your Art to Life</h2>
        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 rounded-2xl p-8 border border-amber-200">
          <div className="flex items-center justify-center mb-6">
            <Play className="w-12 h-12 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Add AR Magic (Optional)</h3>
          <p className="text-gray-600 mb-6">
            Include a QR code that brings your Deco Luxe artwork to life with elegant geometric animations and golden light effects when scanned with any smartphone.
          </p>
          <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeARPreview;
