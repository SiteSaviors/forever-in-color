
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

  // Calculate which cards to render for premium infinite effect
  const getVisibleCards = () => {
    const visibleCards = [];
    const totalCards = 9; // Show 9 cards for more premium feel
    const startIndex = centerOffset + currentIndex - Math.floor(totalCards / 2);
    
    for (let i = 0; i < totalCards; i++) {
      const cardIndex = (startIndex + i) % infiniteStyles.length;
      const relativePosition = i - Math.floor(totalCards / 2); // -4 to 4
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
      className="relative h-[700px] flex items-center justify-center perspective-[1500px] -mt-12"
      style={{
        transform: `translateY(${parallaxOffset.cards}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Enhanced container with circular depth illusion */}
      <div className="absolute inset-0 bg-gradient-radial from-white/20 via-purple-50/30 to-pink-100/40 rounded-full blur-3xl transform scale-150 opacity-60"></div>
      
      {/* Circular track indicator */}
      <div className="absolute inset-0 border border-white/20 rounded-full transform scale-110 opacity-30"></div>
      <div className="absolute inset-0 border border-white/10 rounded-full transform scale-125 opacity-20"></div>
      
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
