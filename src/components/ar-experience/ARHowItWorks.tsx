
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Palette, Mic, Smartphone } from 'lucide-react';

const ARHowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Photo",
      description: "Choose your most precious memory - a family photo, beloved pet, or special moment.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Palette,
      title: "Select Art Style",
      description: "Transform it with our AI into stunning art - oil painting, watercolor, or modern styles.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Mic,
      title: "Record Voice Memory",
      description: "Add their voice telling a story, singing, or just saying 'I love you' - up to 60 seconds.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Smartphone,
      title: "Scan & Experience",
      description: "Point your phone at the canvas, and watch them come alive in augmented reality.",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">How AR Memory Canvas Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Four simple steps to transform a photo into a living, breathing memory that speaks to you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">The Magic Happens When You Scan</h3>
            <p className="text-purple-100">
              Your canvas becomes a window to the past. Every scan brings back not just their image, but their presence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ARHowItWorks;
