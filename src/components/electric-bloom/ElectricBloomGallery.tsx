
import StyleGallery from "@/components/shared/StyleGallery";

const ElectricBloomGallery = () => {
  const items = [
    {
      id: "electric-bloom-1",
      src: "/lovable-uploads/f9e1b137-663e-403f-8117-56679fe2de93.png",
      alt: "Electric Bloom Portrait Example",
    },
    {
      id: "electric-bloom-2",
      src: "/lovable-uploads/58ce8c1f-4fcb-4135-a850-600a0915b141.png",
      alt: "Neon Aura Style Example",
    },
    {
      id: "electric-bloom-3",
      src: "/lovable-uploads/723f2a1a-0e03-4c36-a8d3-a930c81a7d08.png",
      alt: "Cyberpunk Glow Example",
    },
  ];

  return (
    <StyleGallery
      items={items}
      sectionClassName="py-16 bg-slate-900"
      containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      titleText="Style Gallery"
      titleClassName="text-3xl font-bold text-center text-white mb-12"
      gridClassName="grid md:grid-cols-3 gap-8"
      cardClassName="overflow-hidden bg-slate-800 border-slate-600 hover:border-blue-500/30 transition-colors"
      imgClassName="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
    />
  );
};

export default ElectricBloomGallery;
