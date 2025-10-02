
import { Card, CardContent } from "@/components/ui/card";
import { Smile, Palette, Sparkles, Camera } from "@/components/ui/icons";

const ThreeDStorybookFeatures = () => {
  const features = [
    {
      icon: <Smile className="w-8 h-8 text-pink-500" />,
      title: "Expressive Characters",
      description: "Large eyes, rounded features, and joyful expressions that capture personality"
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-500" />,
      title: "Vibrant Colors",
      description: "Saturated, playful colors that pop off the page with cartoon-like appeal"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-blue-500" />,
      title: "Smooth 3D Modeling",
      description: "Polished 3D rendering with smooth curves and animated-quality finish"
    },
    {
      icon: <Camera className="w-8 h-8 text-orange-500" />,
      title: "Cinematic Quality",
      description: "Professional animation studio quality inspired by Pixar and modern 3D films"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Style Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-pink-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreeDStorybookFeatures;
