
import { CheckCircle } from "lucide-react";

interface OrientationHeaderProps {
  selectedOrientation: string;
}

const OrientationHeader = ({ selectedOrientation }: OrientationHeaderProps) => {
  return (
    <div className="text-center mb-8 p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-2xl border border-teal-100">
      <h4 className="text-2xl font-bold text-gray-900 mb-3 font-poppins tracking-tight">
        ✨ Step 2: Choose Layout
      </h4>
      <p className="text-gray-600 text-lg mb-3">We've auto-selected the perfect orientation based on your photo crop</p>
      <div className="flex items-center justify-center gap-2 text-teal-600">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Auto-detected: {selectedOrientation.charAt(0).toUpperCase() + selectedOrientation.slice(1)}</span>
      </div>
    </div>
  );
};

export default OrientationHeader;
