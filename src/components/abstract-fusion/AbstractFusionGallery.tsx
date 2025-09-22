
import StyleGallery from "@/components/shared/StyleGallery";

const AbstractFusionGallery = () => {
  const items = [
    {
      id: "abstract-fusion-1",
      src: "/lovable-uploads/917203b5-e096-43e3-a992-115124cf0e42.png",
      alt: "Abstract Fusion Portrait Example",
    },
    {
      id: "abstract-fusion-2",
      src: "/lovable-uploads/723f2a1a-0e03-4c36-a8d3-a930c81a7d08.png",
      alt: "Pop Art Style Example",
    },
    {
      id: "abstract-fusion-3",
      src: "/lovable-uploads/60a93ae3-c149-4515-aa89-356396b7ff33.png",
      alt: "Artistic Mashup Example",
    },
  ];

  return (
    <StyleGallery
      items={items}
      sectionClassName="py-16 bg-white"
      containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      titleText="Style Gallery"
      titleClassName="text-3xl font-bold text-center text-gray-900 mb-12"
      gridClassName="grid md:grid-cols-3 gap-8"
      cardClassName="overflow-hidden"
      imgClassName="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
    />
  );
};

export default AbstractFusionGallery;
