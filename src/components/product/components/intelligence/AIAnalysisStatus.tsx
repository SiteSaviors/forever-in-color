
import { Loader2, Sparkles } from "lucide-react";

interface AIAnalysisStatusProps {
  isAnalyzing: boolean;
}

const AIAnalysisStatus = ({ isAnalyzing }: AIAnalysisStatusProps) => {
  if (!isAnalyzing) return null;

  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-full border border-purple-200">
        <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
        <span className="text-sm font-medium text-purple-700">
          AI analyzing your photo for perfect style matches...
        </span>
      </div>
      
      {/* Loading Skeleton for Hero Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="loading-shimmer rounded-2xl h-64 animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};

export default AIAnalysisStatus;
