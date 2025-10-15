import { Star, Users } from 'lucide-react';

type TrustStripProps = {
  rating?: number;
  reviewCount?: number;
  customerCount?: string;
  customerPhotos?: string[];
  className?: string;
};

const TrustStrip = ({
  rating = 4.9,
  reviewCount = 2341,
  customerCount = '10,000+',
  customerPhotos = [],
  className = '',
}: TrustStripProps) => {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4 ${className}`}>
      {/* Customer Photos Stack + Customer Count - Combined on mobile */}
      {customerPhotos.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-2">
            {customerPhotos.slice(0, 3).map((photo, index) => (
              <div
                key={index}
                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800"
              >
                <img
                  src={photo}
                  alt={`Customer ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-900 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-[10px] sm:text-xs font-bold text-white">+{customerCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Star Rating + Score - Single compact unit - All 5 stars filled */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold whitespace-nowrap">
          <span className="text-white">{rating.toFixed(1)}</span>
          <span className="text-white/30">/</span>
          <span className="text-white/70">5</span>
        </div>
      </div>

      {/* Review Count - Compact */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 whitespace-nowrap">
        <span className="font-medium">{reviewCount.toLocaleString()}</span>
        <span className="text-white/50">reviews</span>
      </div>

      {/* Canvases Shipped - Compact */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
        <span className="font-medium text-white">{customerCount}</span>
        <span className="text-white/50">canvases shipped</span>
      </div>
    </div>
  );
};

export default TrustStrip;
