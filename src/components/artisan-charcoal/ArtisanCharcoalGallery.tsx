
import StyleGallery from "@/components/shared/StyleGallery";

const ArtisanCharcoalGallery = () => {
  const items = [
    { id: "artisan-charcoal-1", src: "/lovable-uploads/8512e20f-df1b-4848-a638-a3f6f930e600.png", alt: "Artisan Charcoal Portrait Example 1" },
    { id: "artisan-charcoal-2", src: "/lovable-uploads/8512e20f-df1b-4848-a638-a3f6f930e600.png", alt: "Artisan Charcoal Portrait Example 2" },
    { id: "artisan-charcoal-3", src: "/lovable-uploads/8512e20f-df1b-4848-a638-a3f6f930e600.png", alt: "Artisan Charcoal Portrait Example 3" },
    { id: "artisan-charcoal-4", src: "/lovable-uploads/8512e20f-df1b-4848-a638-a3f6f930e600.png", alt: "Artisan Charcoal Portrait Example 4" },
  ];

  return (
    <StyleGallery
      items={items}
      sectionClassName="py-16 bg-white"
      containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      titleText="Gallery"
      titleClassName="text-3xl font-bold text-center text-gray-900 mb-4"
      descriptionText="See how our Artisan Charcoal style transforms ordinary photos into extraordinary hand-drawn masterpieces with rich graphite detail and timeless elegance."
      descriptionClassName="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
      gridClassName="grid md:grid-cols-2 lg:grid-cols-2 gap-8"
      cardClassName="aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      imgClassName="w-full h-full object-cover"
      useCardWrapper={false}
    />
  );
};

export default ArtisanCharcoalGallery;
