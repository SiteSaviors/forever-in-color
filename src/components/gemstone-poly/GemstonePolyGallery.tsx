
import { Card, CardContent } from "@/components/ui/card";

const GemstonePolyGallery = () => {
  const galleryImages = [
    {
      src: "/lovable-uploads/933dd4e5-58bc-404d-8c89-a93dcce93079.png",
      alt: "Gemstone Poly Portrait Example"
    },
    {
      src: "/lovable-uploads/163d0898-810c-431b-a6c9-04c7e8423791.png",
      alt: "3D Storybook Style Example"
    },
    {
      src: "/lovable-uploads/66954ae0-a880-40e9-9ca0-2892f4396b82.png",
      alt: "Deco Luxe Example"
    }
  ];

  return (
    <section className="py-16 bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Style Gallery</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {galleryImages.map((image, index) => (
            <Card key={index} className="overflow-hidden bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-cyan-400/30 backdrop-blur-sm">
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

export default GemstonePolyGallery;
