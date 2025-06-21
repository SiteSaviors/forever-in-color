
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
      className="relative h-[480px] flex items-center justify-center overflow-hidden -mt-8"
      style={{
        perspective: '1200px',
        transform: `translateY(${parallaxOffset.cards}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Enhanced atmospheric depth with gradient fog */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 pointer-events-none z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/3 to-black/8 rounded-3xl blur-3xl transform translate-y-12 scale-125"></div>
      
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ transformStyle: 'preserve-3d' }}
      >
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
