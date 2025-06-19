
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

const ArtStylesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(7); // Start with middle item
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const artStyles = [
    {
      id: 1,
      name: "Watercolor Dreams",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Soft, flowing watercolor techniques"
    },
    {
      id: 2,
      name: "Classic Oil Painting",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Rich, textured oil painting style"
    },
    {
      id: 3,
      name: "Pop Art Burst",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Bold, vibrant pop art aesthetics"
    },
    {
      id: 4,
      name: "Neon Nights",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Electric neon glow effects"
    },
    {
      id: 5,
      name: "Vintage Poster",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Retro poster design style"
    },
    {
      id: 6,
      name: "Abstract Fusion",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Modern abstract interpretation"
    },
    {
      id: 7,
      name: "Pencil Sketch",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Detailed pencil drawing style"
    },
    {
      id: 8,
      name: "Digital Dreams",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Futuristic digital art style"
    },
    {
      id: 9,
      name: "Impressionist",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Classic impressionist technique"
    },
    {
      id: 10,
      name: "Comic Book",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Bold comic book illustration"
    },
    {
      id: 11,
      name: "Minimalist Line",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Clean, minimalist line art"
    },
    {
      id: 12,
      name: "Vintage Film",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Classic film photography feel"
    },
    {
      id: 13,
      name: "Graffiti Street",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Urban street art style"
    },
    {
      id: 14,
      name: "Renaissance",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Classical renaissance painting"
    },
    {
      id: 15,
      name: "Cyberpunk",
      image: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      description: "Futuristic cyberpunk aesthetic"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artStyles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, artStyles.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + artStyles.length) % artStyles.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % artStyles.length);
  };

  const handleStyleClick = (style: typeof artStyles[0]) => {
    // Navigate to product configurator
    window.location.href = '/product';
  };

  const getCardStyle = (index: number) => {
    const diff = index - currentIndex;
    const absDistance = Math.abs(diff);
    
    if (absDistance === 0) {
      // Center card
      return {
        transform: 'translateX(0) scale(1) rotateY(0deg)',
        zIndex: 10,
        opacity: 1,
        filter: 'brightness(1)'
      };
    } else if (absDistance === 1) {
      // Adjacent cards
      const side = diff > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 300}px) scale(0.8) rotateY(${-side * 25}deg)`,
        zIndex: 5,
        opacity: 0.7,
        filter: 'brightness(0.7)'
      };
    } else if (absDistance === 2) {
      // Second-level cards
      const side = diff > 0 ? 1 : -1;
      return {
        transform: `translateX(${side * 450}px) scale(0.6) rotateY(${-side * 45}deg)`,
        zIndex: 2,
        opacity: 0.4,
        filter: 'brightness(0.5)'
      };
    } else {
      // Hidden cards
      return {
        transform: 'translateX(0) scale(0.4)',
        zIndex: 1,
        opacity: 0,
        filter: 'brightness(0.3)'
      };
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Palette className="w-8 h-8 text-purple-600 mr-3" />
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Art Styles
              </span>
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Swipe to discover your perfect match — Each style transforms your photo into a unique masterpiece
          </p>
        </div>

        {/* 3D Carousel */}
        <div className="relative h-[500px] flex items-center justify-center perspective-1000">
          <div className="relative w-full h-full">
            {artStyles.map((style, index) => (
              <div
                key={style.id}
                className="absolute left-1/2 top-1/2 w-80 h-96 cursor-pointer transition-all duration-700 ease-out transform-gpu"
                style={{
                  ...getCardStyle(index),
                  marginLeft: '-160px',
                  marginTop: '-192px',
                }}
                onClick={() => handleStyleClick(style)}
              >
                <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 text-gray-900 font-medium text-sm shadow-lg">
                        Imagine your photo in this style
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{style.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{style.description}</p>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStyleClick(style);
                      }}
                    >
                      Try This Style
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-20"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Style indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {artStyles.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-purple-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Photo?</h3>
            <p className="text-gray-600 mb-6">
              Choose your favorite style and start creating your custom artwork in minutes
            </p>
            <Button 
              onClick={() => window.location.href = '/product'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold border-0"
            >
              Start Creating Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtStylesCarousel;
