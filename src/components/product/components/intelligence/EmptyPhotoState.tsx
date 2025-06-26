
import { Sparkles } from "lucide-react";

const EmptyPhotoState = () => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-purple-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Upload Your Photo First
      </h3>
      <p className="text-gray-600">
        Once you upload a photo, our AI will instantly show you personalized style recommendations
      </p>
    </div>
  );
};

export default EmptyPhotoState;
