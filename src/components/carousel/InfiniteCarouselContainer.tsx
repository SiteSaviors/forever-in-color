
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

  // Calculate which cards to render for infinite 3D effect
  const getVisibleCards = () => {
    const visibleCards = [];
    const totalCards = 7; // Show 7 cards for seamless 3D loop
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
      className="relative h-[600px] flex items-center justify-center overflow-hidden"
      style={{
        perspective: '1200px',
        perspectiveOrigin: 'center center',
        transform: `translateY(${parallaxOffset.cards}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Subtle gradient fog on edges for atmospheric depth */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-gray-50/80 via-transparent to-transparent" />
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-gray-50/80 via-transparent to-transparent" />
      </div>
      
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ 
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center'
        }}
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
