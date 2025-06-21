
import { Card, CardContent } from "@/components/ui/card";

const EmbroideredMomentsGallery = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/6371ab02-6a24-43ef-98b7-42de878f265a.png",
      alt: "Embroidered Moments Portrait Example"
    },
    {
      src: "/lovable-uploads/917203b5-e096-43e3-a992-115124cf0e42.png",
      alt: "Hand-stitched Style Example"
    },
    {
      src: "/lovable-uploads/60a93ae3-c149-4515-aa89-356396b7ff33.png",
      alt: "Textile Art Example"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Style Gallery</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <Card key={index} className="overflow-hidden border-2 border-amber-200 hover:border-orange-300 transition-colors">
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

export default EmbroideredMomentsGallery;
