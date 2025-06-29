
import { Card, CardContent } from "@/components/ui/card";

interface CanvasWallMockupProps {
  imageUrl: string;
  size: string;
  styleName: string;
}

const CanvasWallMockup = ({ imageUrl, size, styleName }: CanvasWallMockupProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-video">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative shadow-2xl">
              <img
                src={imageUrl}
                alt={`${styleName} preview`}
                className="rounded-lg max-h-64 object-contain"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                {size}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CanvasWallMockup;
