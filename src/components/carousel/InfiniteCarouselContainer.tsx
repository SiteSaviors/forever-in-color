
import { artStyles } from '@/data/artStyles';
import { ArtStyle } from '@/types/artStyle';
import CarouselCard from './CarouselCard';

interface InfiniteCarouselContainerProps {
  currentIndex: number;
  parallaxOffset: { cards: number };
  onStyleClick: (style: ArtStyle) => void;
}

const InfiniteCarouselContainer = ({ 
  currentIndex, 
  parallaxOffset, 
  onStyleClick 
}: InfiniteCarouselContainerProps) => {
  // Create infinite loop by tripling the array
  const infiniteStyles = [...artStyles, ...artStyles, ...artStyles];
  const centerOffset = artStyles.length; // Start at middle set

  // Calculate which cards to render for the 3D circular layout
  const getVisibleCards = () => {
    const visibleCards = [];
    const totalCards = 5; // Show 5 cards like in the reference image
    const startIndex = centerOffset + currentIndex - Math.floor(totalCards / 2);
    
    for (let i = 0; i < totalCards; i++) {
      const cardIndex = (startIndex + i) % infiniteStyles.length;
      const relativePosition = i - Math.floor(totalCards / 2); // -2 to 2
      visibleCards.push({
        style: infiniteStyles[cardIndex],
        position: relativePosition,
        key: `${cardIndex}-${i}` // Unique key for React
      });
    }
    
    return visibleCards;
  };

  return (
    <div 
      className="relative h-[700px] flex items-center justify-center perspective-[2000px]"
      style={{
        transform: `translateY(${parallaxOffset.cards}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Enhanced 3D stage with circular depth */}
      <div className="absolute inset-0 bg-gradient-radial from-white/30 via-purple-50/20 to-pink-100/30 rounded-full blur-3xl transform scale-150 opacity-40"></div>
      
      {/* Reflective floor effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100/20 via-transparent to-transparent"></div>
      
      {/* 3D container with proper circular arrangement */}
      <div className="relative w-full h-full transform-style-preserve-3d">
        {getVisibleCards().map(({ style, position, key }) => (
          <CarouselCard
            key={key}
            style={style}
            position={position}
            onClick={onStyleClick}
          />
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarouselContainer;
