
interface CarouselBackgroundProps {
  parallaxOffset: { background: number };
}

const CarouselBackground = ({ parallaxOffset }: CarouselBackgroundProps) => {
  return (
    <div 
      className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
      style={{
        transform: `translateY(${parallaxOffset.background}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-white/40 via-purple-50/60 to-pink-100/80"></div>
      
      {/* Subtle cloud-like patterns with individual parallax speeds */}
      <div 
        className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-purple-100/30 to-transparent rounded-full blur-3xl"
        style={{
          transform: `translate(${parallaxOffset.background * 0.3}px, ${parallaxOffset.background * 0.5}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      ></div>
      <div 
        className="absolute top-32 right-20 w-80 h-80 bg-gradient-to-bl from-pink-100/40 to-transparent rounded-full blur-3xl"
        style={{
          transform: `translate(${-parallaxOffset.background * 0.4}px, ${parallaxOffset.background * 0.3}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      ></div>
      <div 
        className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-tr from-blue-100/30 to-transparent rounded-full blur-3xl"
        style={{
          transform: `translate(${parallaxOffset.background * 0.2}px, ${-parallaxOffset.background * 0.4}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      ></div>
      <div 
        className="absolute bottom-32 right-1/3 w-64 h-64 bg-gradient-to-tl from-purple-100/25 to-transparent rounded-full blur-3xl"
        style={{
          transform: `translate(${-parallaxOffset.background * 0.3}px, ${-parallaxOffset.background * 0.2}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      ></div>
    </div>
  );
};

export default CarouselBackground;
