import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ArtStylesGallery = () => {
  const artStyles = [
    {
      id: 1,
      name: "Neon Synthwave",
      description: "Retro-futuristic vibes with electric colors and cyberpunk aesthetics",
      colors: ["from-pink-500", "via-purple-600", "to-cyan-400"],
      popular: true,
      image: "/lovable-uploads/1210f9a1-2907-4774-88bc-e3f3c22f6055.png"
    },
    {
      id: 2,
      name: "Watercolor Dreams",
      description: "Soft, flowing watercolor effects with gentle color bleeds",
      colors: ["from-blue-300", "via-purple-300", "to-pink-300"],
      popular: false
    },
    {
      id: 3,
      name: "Pop Art Burst",
      description: "Bold, vibrant colors inspired by classic pop art movement",
      colors: ["from-red-500", "via-yellow-400", "to-blue-500"],
      popular: true
    },
    {
      id: 4,
      name: "Minimalist Line",
      description: "Clean, elegant line art with sophisticated simplicity",
      colors: ["from-gray-600", "via-gray-800", "to-black"],
      popular: false
    },
    {
      id: 5,
      name: "Oil Painting Classic",
      description: "Rich, textured brushstrokes reminiscent of traditional oil paintings",
      colors: ["from-amber-600", "via-orange-700", "to-red-800"],
      popular: false
    },
    {
      id: 6,
      name: "Digital Glitch",
      description: "Modern digital art with glitch effects and pixel distortion",
      colors: ["from-green-400", "via-blue-500", "to-purple-600"],
      popular: true
    },
    {
      id: 7,
      name: "Cartoon Style Portrait",
      description: "Bold, fun, and full of personality. Your photo turned into a clean, vibrant cartoon—like a scene from your favorite animated movie or video game. Perfect for pets, families, or even your car.",
      colors: ["from-orange-400", "via-red-500", "to-pink-500"],
      popular: true
    },
    {
      id: 8,
      name: "Charcoal Sketch Style",
      description: "Timeless and elegant. A soft, hand-drawn black-and-white sketch that looks like it came straight out of an artist's notebook. Great for memorials, meaningful gifts, or classic home portraits.",
      colors: ["from-gray-400", "via-gray-600", "to-gray-800"],
      popular: false
    },
    {
      id: 9,
      name: "Painterly Impressionist Style",
      description: "Like a painting you'd find in a gallery. Inspired by artists like Monet, this style uses brush-like textures and dreamy colors to transform your photo into emotional, fine-art decor.",
      colors: ["from-blue-400", "via-green-500", "to-yellow-400"],
      popular: true
    },
    {
      id: 10,
      name: "Urban Graffiti Style",
      description: "Edgy, colorful, and full of attitude. A street-art-inspired look with layered textures, spray paint effects, and bold energy. Perfect for bold personalities, pets with attitude, or modern spaces.",
      colors: ["from-purple-500", "via-pink-500", "to-orange-500"],
      popular: false
    }
  ];

  return (
    <section id="styles" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Art Style
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your photos into stunning artwork with our curated collection of artistic styles. 
            Each style is carefully crafted to bring out the unique beauty in your memories.
          </p>
        </div>

        {/* Art Styles Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {artStyles.map((style) => (
                <CarouselItem key={style.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 hover:border-purple-200 h-full">
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Style Preview */}
                      <div className="relative h-80 overflow-hidden">
                        {style.image ? (
                          <img 
                            src={style.image} 
                            alt={style.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <div className={`absolute inset-0 bg-gradient-to-br ${style.colors.join(' ')} opacity-90`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center text-white space-y-2">
                                <div className="w-20 h-20 border-4 border-white/50 rounded-full flex items-center justify-center mx-auto">
                                  <div className="w-12 h-12 bg-white/30 rounded-full"></div>
                                </div>
                                <p className="text-sm font-medium opacity-90">Photo Transform</p>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {/* Popular Badge */}
                        {style.popular && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold">
                              Popular
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Style Info */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{style.name}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed flex-1">{style.description}</p>
                        
                        {/* Color Indicators */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex space-x-1">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[0]}`}></div>
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[1]}`}></div>
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[2]}`}></div>
                          </div>
                          <button className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors">
                            Try This Style →
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Can't decide? Upload your photo and preview all styles!</p>
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Upload & Preview All Styles
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArtStylesGallery;
