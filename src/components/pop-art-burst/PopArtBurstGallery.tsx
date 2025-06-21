
import { Card, CardContent } from "@/components/ui/card";

const PopArtBurstGallery = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/723f2a1a-0e03-4c36-a8d3-a930c81a7d08.png",
      alt: "Pop Art Burst Portrait Example"
    },
    {
      src: "/lovable-uploads/58ce8c1f-4fcb-4135-a850-600a0915b141.png",
      alt: "Comic Style Portrait Example"
    },
    {
      src: "/lovable-uploads/f9e1b137-663e-403f-8117-56679fe2de93.png",
      alt: "Retro Pop Art Example"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Style Gallery</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <Card key={index} className="overflow-hidden bg-white border-2 border-gray-200 hover:border-red-300 transition-colors">
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

export default PopArtBurstGallery;
