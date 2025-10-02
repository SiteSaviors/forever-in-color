
import { Loader2 } from "@/components/ui/icons";

interface AIAnalysisStatusProps {
  isAnalyzing: boolean;
}

const AIAnalysisStatus = ({ isAnalyzing }: AIAnalysisStatusProps) => {
  if (!isAnalyzing) return null;

  return (
    <div className="text-center py-6">
      <div className="p-6 md:p-8 bg-gradient-to-br from-cyan-50 via-violet-50 to-fuchsia-50 rounded-2xl border border-cyan-100 max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-4">
          <div className="relative p-3 bg-gradient-to-br from-cyan-100/80 to-violet-100/80 rounded-xl shadow-lg backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 to-violet-400/10 blur-sm -z-10" />
          </div>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 font-poppins tracking-tight">
          ✨ AI Style Analysis in Progress
        </h3>
        <p className="text-gray-700 text-base md:text-lg font-medium leading-relaxed">
          Our advanced AI is analyzing your photo's composition, colors, and mood to curate the perfect style matches...
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
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
