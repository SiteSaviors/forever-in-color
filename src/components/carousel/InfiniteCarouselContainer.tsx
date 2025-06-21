
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

  // Calculate which cards to render for smooth scrolling
  const getVisibleCards = () => {
    const visibleCards = [];
    const totalCards = 7; // Show 7 cards for smooth transitions
    const startIndex = centerOffset + currentIndex - Math.floor(totalCards / 2);
    
    for (let i = 0; i < totalCards; i++) {
      const cardIndex = (startIndex + i) % infiniteStyles.length;
      const relativePosition = i - Math.floor(totalCards / 2); // -3 to 3
      const isCenter = relativePosition === 0;
      
      visibleCards.push({
        style: infiniteStyles[cardIndex],
        isCenter,
        key: `${cardIndex}-${i}` // Unique key for React
      });
    }
    
    return visibleCards;
  };

  return (
    <div 
      className="relative h-[500px] flex items-center justify-center overflow-hidden"
      style={{
        transform: `translateY(${parallaxOffset.cards}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <div 
        className="flex items-center justify-center transition-transform duration-700 ease-out"
        style={{ 
          transform: `translateX(-${currentIndex * 320}px)` // 320px = card width + margin
        }}
      >
        {getVisibleCards().map(({ style, isCenter, key }) => (
          <CarouselCard
            key={key}
            style={style}
            isCenter={isCenter}
            onClick={onStyleClick}
          />
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarouselContainer;
