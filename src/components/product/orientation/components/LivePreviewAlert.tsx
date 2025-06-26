
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye } from "lucide-react";

interface LivePreviewAlertProps {
  userImageUrl: string | null;
}

const LivePreviewAlert = ({ userImageUrl }: LivePreviewAlertProps) => {
  if (!userImageUrl) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Eye className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>✨ Live Preview:</strong> The canvases below show exactly how your photo will look in each orientation. This is your actual image positioned on the final product!
      </AlertDescription>
    </Alert>
  );
};

export default LivePreviewAlert;
