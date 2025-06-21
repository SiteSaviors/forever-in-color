
import { Card, CardContent } from "@/components/ui/card";

const DecoLuxeGallery = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/538dcdf0-4fce-48ea-be55-314d68926919.png",
      alt: "Deco Luxe Portrait Example"
    },
    {
      src: "/lovable-uploads/926c93e6-a27d-48b4-aa84-9c3fa773bb4e.png",
      alt: "Art Deco Luxury Style"
    },
    {
      src: "/lovable-uploads/60a93ae3-c149-4515-aa89-356396b7ff33.png",
      alt: "Geometric Elegance Example"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Style Gallery</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <Card key={index} className="overflow-hidden bg-white border-amber-200 hover:border-emerald-300 transition-colors shadow-lg hover:shadow-xl">
              <CardContent className="p-0">
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeGallery;
