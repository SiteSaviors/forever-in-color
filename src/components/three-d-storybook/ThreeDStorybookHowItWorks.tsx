
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Wand2, Download, Smile } from "lucide-react";

const ThreeDStorybookHowItWorks = () => {
  const steps = [
    {
      icon: <Upload className="w-8 h-8 text-pink-500" />,
      title: "Upload Your Photo",
      description: "Choose your favorite memory to transform into a lovable 3D character"
    },
    {
      icon: <Wand2 className="w-8 h-8 text-purple-500" />,
      title: "AI Magic Happens",
      description: "Our AI creates expressive features, big eyes, and playful proportions"
    },
    {
      icon: <Smile className="w-8 h-8 text-blue-500" />,
      title: "Review & Love",
      description: "See your memory transformed into a joyful, animated character"
    },
    {
      icon: <Download className="w-8 h-8 text-orange-500" />,
      title: "Print & Display",
      description: "Receive your adorable 3D storybook art ready to brighten any space"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 border-0">
              <CardContent className="pt-6 pb-8">
                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThreeDStorybookHowItWorks;
