
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

const ThreeDStorybookARPreview = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Bring Your Character to Life</h2>
        <div className="bg-gradient-to-br from-pink-100/50 to-purple-100/50 rounded-2xl p-8 border border-pink-200">
          <div className="flex items-center justify-center mb-6">
            <Play className="w-12 h-12 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Add AR Magic (Optional)</h3>
          <p className="text-gray-700 mb-6">
            Include a QR code that brings your 3D storybook character to life with animated expressions, playful movements, and interactive gestures when scanned with any smartphone.
          </p>
          <Badge className="bg-pink-500/20 text-pink-700 border-pink-500/30">
            Available with AR upgrade
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default ThreeDStorybookARPreview;
