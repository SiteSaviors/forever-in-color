
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PastelBlissGallery = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const galleryImages = [
    {
      before: "https://images.unsplash.com/photo-1494790108755-2616b332a7c9?w=400&h=400&fit=crop&crop=face",
      after: "/lovable-uploads/926c93e6-a27d-48b4-aa84-9c3fa773bb4e.png",
      type: "Portrait"
    },
    {
      before: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      after: "/lovable-uploads/926c93e6-a27d-48b4-aa84-9c3fa773bb4e.png",
      type: "Wedding"
    },
    {
      before: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      after: "/lovable-uploads/926c93e6-a27d-48b4-aa84-9c3fa773bb4e.png",
      type: "Family"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">See the Transformation</h2>
        
        <div className="relative">
          <div className="flex justify-center">
            <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl">
              {/* Before Image */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1 text-gray-600">Original Photo</h3>
                <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={galleryImages[currentImageIndex].before}
                    alt="Original photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* After Image */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1 text-pink-600">Pastel Bliss</h3>
                <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={galleryImages[currentImageIndex].after}
                    alt="Pastel Bliss style"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <button 
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <button 
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
          
          {/* Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-pink-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PastelBlissGallery;
