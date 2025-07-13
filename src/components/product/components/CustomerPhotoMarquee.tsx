
import React from 'react';

// TypeScript interfaces for the component
interface CustomerPhoto {
  id: string;
  src: string;
  alt: string;
  style: string;
}

interface CustomerPhotoMarqueeProps {
  className?: string;
}

// Curated customer photos from existing uploads - Top layer (moving right to left)
const topLayerPhotos: CustomerPhoto[] = [
  {
    id: 'photo-1',
    src: '/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png',
    alt: 'Customer canvas art - Classic Oil style',
    style: 'Classic Oil'
  },
  {
    id: 'photo-2',
    src: '/lovable-uploads/7db3e997-ea34-4d40-af3e-67b693dc0544.png',
    alt: 'Customer canvas art - Abstract Fusion style',
    style: 'Abstract Fusion'
  },
  {
    id: 'photo-3',
    src: '/lovable-uploads/9eb9363d-dc17-4df1-a03d-0c5fb463a473.png',
    alt: 'Customer canvas art - Watercolor Dreams style',
    style: 'Watercolor Dreams'
  },
  {
    id: 'photo-4',
    src: '/lovable-uploads/79613d9d-74f9-4f65-aec0-50fd2346a131.png',
    alt: 'Customer canvas art - Pop Art Burst style',
    style: 'Pop Art Burst'
  },
  {
    id: 'photo-5',
    src: '/lovable-uploads/581d73aa-03e2-4173-838a-61286c6fb31c.png',
    alt: 'Customer canvas art - Neon Splash style',
    style: 'Neon Splash'
  },
  {
    id: 'photo-6',
    src: '/lovable-uploads/60a93ae3-c149-4515-aa89-356396b7ff33.png',
    alt: 'Customer canvas art - Electric Bloom style',
    style: 'Electric Bloom'
  },
  {
    id: 'photo-7',
    src: '/lovable-uploads/5e67d281-e2f5-4b6b-942d-32f66511851e.png',
    alt: 'Customer canvas art - Pastel Bliss style',
    style: 'Pastel Bliss'
  },
  {
    id: 'photo-8',
    src: '/lovable-uploads/c0f1ce8f-22e6-44e5-89d9-2b3327371fea.png',
    alt: 'Customer canvas art - Artisan Charcoal style',
    style: 'Artisan Charcoal'
  }
];

// Curated customer photos from existing uploads - Bottom layer (moving left to right)
const bottomLayerPhotos: CustomerPhoto[] = [
  {
    id: 'photo-9',
    src: '/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png',
    alt: 'Customer canvas art - Gemstone Poly style',
    style: 'Gemstone Poly'
  },
  {
    id: 'photo-10',
    src: '/lovable-uploads/d53ba462-1fad-4ba8-8ac5-273c9a81b396.png',
    alt: 'Customer canvas art - Deco Luxe style',
    style: 'Deco Luxe'
  },
  {
    id: 'photo-11',
    src: '/lovable-uploads/f3b1dcfb-6c61-4acc-bab4-7467747bbe19.png',
    alt: 'Customer canvas art - 3D Storybook style',
    style: '3D Storybook'
  },
  {
    id: 'photo-12',
    src: '/lovable-uploads/926c93e6-a27d-48b4-aa84-9c3fa773bb4e.png',
    alt: 'Customer canvas art - Original style',
    style: 'Original'
  },
  {
    id: 'photo-13',
    src: '/lovable-uploads/b55f8c5c-6c04-4840-9058-b673bb17e2ea.png',
    alt: 'Customer canvas art transformation',
    style: 'Mixed Style'
  },
  {
    id: 'photo-14',
    src: '/lovable-uploads/e235cbba-357a-429f-a7f3-43e8b187823b.png',
    alt: 'Customer canvas art masterpiece',
    style: 'Premium Style'
  },
  {
    id: 'photo-15',
    src: '/lovable-uploads/f9da9750-5b5c-40c0-adeb-92bb010bc33c.png',
    alt: 'Customer canvas art creation',
    style: 'Classic Style'
  },
  {
    id: 'photo-16',
    src: '/lovable-uploads/917203b5-e096-43e3-a992-115124cf0e42.png',
    alt: 'Customer canvas art showcase',
    style: 'Modern Style'
  }
];

const CustomerPhotoMarquee: React.FC<CustomerPhotoMarqueeProps> = ({ className = '' }) => {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      {/* Container for both marquee layers */}
      <div className="relative">
        {/* Top Layer - Moving Right to Left */}
        <div className="flex gap-4 mb-4">
          <div className="flex gap-4 animate-marquee-right">
            {topLayerPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex-shrink-0 relative group"
              >
                <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Optional: Style label on hover */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {photo.style}
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {topLayerPhotos.map((photo) => (
              <div
                key={`${photo.id}-duplicate`}
                className="flex-shrink-0 relative group"
              >
                <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {photo.style}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Layer - Moving Left to Right */}
        <div className="flex gap-4">
          <div className="flex gap-4 animate-marquee-left">
            {bottomLayerPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex-shrink-0 relative group"
              >
                <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {photo.style}
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {bottomLayerPhotos.map((photo) => (
              <div
                key={`${photo.id}-duplicate`}
                className="flex-shrink-0 relative group"
              >
                <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                    {photo.style}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPhotoMarquee;
