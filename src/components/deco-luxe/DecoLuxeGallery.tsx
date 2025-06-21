
import { Card, CardContent } from "@/components/ui/card";

const DecoLuxeGallery = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      alt: "Deco Luxe Portrait Example"
    },
    {
      src: "/lovable-uploads/623707ee-39fd-4a88-9362-3db250f9bfcb.png",
      alt: "Art Deco Style Example"
    },
    {
      src: "/lovable-uploads/926c93e6-a27d-48b4-aa84-9c3fa773bb4e.png",
      alt: "Geometric Elegance Example"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-stone-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-stone-800 mb-4 font-serif">Style Gallery</h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Experience the sophisticated blend of Art Deco elegance and modern refinement. 
            Each piece showcases geometric patterns, metallic accents, and timeless luxury.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <Card key={index} className="overflow-hidden bg-white border-2 border-amber-200/50 hover:border-amber-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
              <CardContent className="p-0 relative group">
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Art Deco corner decoration */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-amber-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-amber-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeGallery;
