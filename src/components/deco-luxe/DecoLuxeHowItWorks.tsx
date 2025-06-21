
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Sparkles, Download } from "lucide-react";

const DecoLuxeHowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="w-8 h-8 text-amber-600" />,
      title: "Upload Your Photo",
      description: "Choose a high-quality photo that captures the essence you want to transform"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-emerald-600" />,
      title: "AI Art Magic",
      description: "Our advanced AI applies Art Deco elegance with geometric patterns and metallic accents"
    },
    {
      icon: <Download className="w-8 h-8 text-rose-600" />,
      title: "Receive Your Masterpiece",
      description: "Get your sophisticated Deco Luxe artwork delivered as a premium canvas print"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-amber-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DecoLuxeHowItWorks;
