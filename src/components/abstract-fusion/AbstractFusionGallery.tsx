
import { Card, CardContent } from "@/components/ui/card";

const AbstractFusionGallery = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/917203b5-e096-43e3-a992-115124cf0e42.png",
      alt: "Abstract Fusion Portrait Example"
    },
    {
      src: "/lovable-uploads/723f2a1a-0e03-4c36-a8d3-a930c81a7d08.png",
      alt: "Pop Art Style Example"
    },
    {
      src: "/lovable-uploads/60a93ae3-c149-4515-aa89-356396b7ff33.png",
      alt: "Artistic Mashup Example"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Style Gallery</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <Card key={index} className="overflow-hidden">
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

export default AbstractFusionGallery;
