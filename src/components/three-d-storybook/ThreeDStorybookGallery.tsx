
import StyleGallery from "@/components/shared/StyleGallery";

const ThreeDStorybookGallery = () => {
  const items = [
    {
      id: "3d-storybook-1",
      src: "/lovable-uploads/163d0898-810c-431b-a6c9-04c7e8423791.png",
      alt: "3D Storybook Character Example",
    },
    {
      id: "3d-storybook-2",
      src: "/lovable-uploads/60a93ae3-c149-4515-aa89-356396b7ff33.png",
      alt: "Animated Style Portrait",
    },
    {
      id: "3d-storybook-3",
      src: "/lovable-uploads/917203b5-e096-43e3-a992-115124cf0e42.png",
      alt: "Colorful 3D Art Example",
    },
  ];

  return (
    <StyleGallery
      items={items}
      sectionClassName="py-16 bg-gradient-to-br from-purple-50 to-pink-50"
      containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      titleText="Style Gallery"
      titleClassName="text-3xl font-bold text-center text-gray-900 mb-12"
      gridClassName="grid md:grid-cols-3 gap-8"
      cardClassName="overflow-hidden bg-white border-pink-200 hover:border-purple-300 transition-colors shadow-lg"
      imgClassName="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"
    />
  );
};

export default ThreeDStorybookGallery;
