
import { Card, CardContent } from "@/components/ui/card";
import UploadDropzone from "./UploadDropzone";
import UploadFeatures from "./UploadFeatures";
import UploadCTA from "./UploadCTA";

interface PhotoUploadMainProps {
  onImageUpload: (file: File) => Promise<void>;
  initialImage?: string | null;
}

const PhotoUploadMain = ({
  onImageUpload,
  initialImage
}: PhotoUploadMainProps) => {
  return (
    <Card className="w-full overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-0">
        <div className="relative">
          {/* Premium Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 40% 80%, rgba(255, 204, 112, 0.1) 0%, transparent 50%)`
            }} />
          </div>

          <div className="relative p-8 lg:p-12">
            <UploadDropzone
              onImageUpload={onImageUpload}
              initialImage={initialImage}
            />
            
            {/* Enhanced Features */}
            <div className="mt-6">
              <UploadFeatures />
            </div>
            
            {/* CTA Button */}
            <UploadCTA onImageUpload={onImageUpload} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadMain;
