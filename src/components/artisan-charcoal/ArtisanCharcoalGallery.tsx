
const ArtisanCharcoalGallery = () => {
  const galleryImages = [
    {
      id: 1,
      src: "/lovable-uploads/8512e20f-df1b-4848-a638-a3f6f930e600.png",
      alt: "Artisan Charcoal Portrait Example 1"
    },
    {
      id: 2,
      src: "/lovable-uploads/8512e20f-df1b-4848-a638-a3f6f930e600.png",
      alt: "Artisan Charcoal Portrait Example 2"
    },
    {
      id: 3,
      src: "/lovable-uploads/8512e20f-df1b-4848-a638-a3f6f930e600.png",
      alt: "Artisan Charcoal Portrait Example 3"
    },
    {
      id: 4,
      src: "/lovable-uploads/8512e20f-df1b-4848-a638-a3f6f930e600.png",
      alt: "Artisan Charcoal Portrait Example 4"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Gallery</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          See how our Artisan Charcoal style transforms ordinary photos into extraordinary hand-drawn masterpieces with rich graphite detail and timeless elegance.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {galleryImages.map((image) => (
            <div key={image.id} className="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <img 
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtisanCharcoalGallery;
