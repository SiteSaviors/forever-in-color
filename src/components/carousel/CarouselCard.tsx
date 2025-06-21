
import { Button } from "@/components/ui/button";
import { ArtStyle } from "@/types/artStyle";
import { Sparkles } from "lucide-react";

interface CarouselCardProps {
  style: ArtStyle;
  isCenter: boolean;
  onClick: (style: ArtStyle) => void;
}

const CarouselCard = ({ style, isCenter, onClick }: CarouselCardProps) => {
  return (
    <div
      className={`w-80 h-96 cursor-pointer transition-all duration-300 flex-shrink-0 mx-4 ${
        isCenter ? 'transform scale-105' : 'opacity-75 hover:opacity-90'
      }`}
      onClick={() => onClick(style)}
    >
      <div className="w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-xl">
        {/* Image */}
        <div className="relative h-60 overflow-hidden">
          <img
            src={style.image}
            alt={style.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
            <div className="bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 text-gray-900 font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0">
              ✨ Transform Your Photo
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-36 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-1 text-xl leading-tight">{style.name}</h3>
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">{style.description}</p>
          </div>
          
          {/* Button - always visible */}
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white border-0 transition-all duration-300 transform hover:scale-105 rounded-xl font-bold text-sm py-3 shadow-lg hover:shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
              onClick(style);
            }}
          >
            <span className="flex items-center justify-center gap-2">
              Try This Style
              <Sparkles className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CarouselCard;
