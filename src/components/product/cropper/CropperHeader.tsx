
import { Badge } from "@/components/ui/badge";

const CropperHeader = () => {
  return (
    <div className="text-center space-y-2">
      <Badge variant="secondary" className="bg-purple-100 text-purple-700 font-medium">
        Required Step: Choose Your Canvas Format
      </Badge>
      <p className="text-sm text-gray-600">
        Select your preferred canvas orientation and adjust the crop to highlight the best part of your photo
      </p>
    </div>
  );
};

export default CropperHeader;
