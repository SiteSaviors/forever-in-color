
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

  // Calculate which cards to render for infinite effect
  const getVisibleCards = () => {
    const visibleCards = [];
    const totalCards = 7; // Show 7 cards for seamless loop
    const startIndex = centerOffset + currentIndex - Math.floor(totalCards / 2);
    
    for (let i = 0; i < totalCards; i++) {
      const cardIndex = (startIndex + i) % infiniteStyles.length;
      const relativePosition = i - Math.floor(totalCards / 2); // -3 to 3
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
      className="relative h-[700px] flex items-center justify-center perspective-[2000px] -mt-12"
      style={{
        transform: `translateY(${parallaxOffset.cards}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Enhanced container shadow for grounding effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10 rounded-3xl blur-2xl transform translate-y-8 scale-110"></div>
      
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
