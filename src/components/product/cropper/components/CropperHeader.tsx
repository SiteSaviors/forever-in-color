
import { Crop, Sparkles } from "lucide-react";

const CropperHeader = () => {
  return (
    <div className="text-center space-y-4">
      {/* Hero-Level Premium Icon */}
      <div className="flex justify-center">
        <div className="relative p-4 bg-gradient-to-br from-cyan-100/80 to-fuchsia-100/80 rounded-2xl shadow-2xl backdrop-blur-sm">
          <Crop className="w-8 h-8 text-cyan-600" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-fuchsia-500 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/10 to-fuchsia-400/10 blur-sm -z-10" />
        </div>
      </div>

      {/* Hero-Level Premium Typography */}
      <div className="space-y-4">
        <h2 className="text-4xl lg:text-5xl font-black text-white font-montserrat tracking-tight drop-shadow-2xl leading-tight">
          Perfect Your
          <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent font-oswald text-5xl lg:text-6xl">
            COMPOSITION
          </span>
        </h2>
        <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-poppins">
          Adjust your photo and select the perfect canvas orientation. Our AI has detected the optimal crop for your image.
        </p>
      </div>

      {/* Hero-Level Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full shadow-lg shadow-cyan-500/30" />
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full shadow-lg shadow-cyan-500/30" />
          <div className="w-6 h-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full shadow-lg shadow-violet-500/30" />
          <div className="w-2 h-2 bg-white/30 rounded-full" />
        </div>
        <span className="text-sm text-white/80 ml-3 font-medium drop-shadow-sm">Step 1 of 4</span>
      </div>
    </div>
  );
};

export default CropperHeader;
