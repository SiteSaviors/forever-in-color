
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    step: "1",
    title: "Upload Your Photo",
    description: "Choose your favorite photo to transform into art"
  },
  {
    step: "2", 
    title: "Select Art Style",
    description: "Pick from our collection of AI-powered art styles"
  },
  {
    step: "3",
    title: "Preview in AR",
    description: "Use your phone to see how it looks in your space"
  }
];

const ARHowItWorks = () => {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">
          How AR Preview Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.step} className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ARHowItWorks;
