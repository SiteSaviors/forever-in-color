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
  const fullStars = Math.floor(rating);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 ${className}`}>
      {/* Customer Photos Stack */}
      {customerPhotos.length > 0 && (
        <div className="flex items-center -space-x-3">
          {customerPhotos.slice(0, 4).map((photo, index) => (
            <div
              key={index}
              className="relative w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800"
            >
              <img
                src={photo}
                alt={`Customer ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="relative w-10 h-10 rounded-full border-2 border-slate-900 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">+{customerCount}</span>
          </div>
        </div>
      )}

      {/* Star Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={`w-5 h-5 ${
                index < fullStars
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-yellow-400/30'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <span className="text-white">{rating.toFixed(1)}</span>
          <span className="text-white/30">/</span>
          <span className="text-white/70">5</span>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-6 w-px bg-white/20" />

      {/* Review Count */}
      <div className="flex items-center gap-2 text-sm text-white/80">
        <span className="font-medium">{reviewCount.toLocaleString()}</span>
        <span className="text-white/50">reviews</span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-6 w-px bg-white/20" />

      {/* Canvases Shipped */}
      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4 text-emerald-400" />
        <span className="font-medium text-white">{customerCount}</span>
        <span className="text-white/50">canvases shipped</span>
      </div>
    </div>
  );
};

export default TrustStrip;
