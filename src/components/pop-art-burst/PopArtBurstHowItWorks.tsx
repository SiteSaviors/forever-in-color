
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Wand2, Download } from "@/components/ui/icons";

const PopArtBurstHowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Photo",
      description: "Choose a clear photo with good lighting for the best pop art transformation"
    },
    {
      icon: Wand2,
      title: "AI Creates Pop Art",
      description: "Our AI adds bold outlines, vibrant colors, and halftone textures in comic book style"
    },
    {
      icon: Download,
      title: "Receive Your Canvas",
      description: "Get your custom pop art masterpiece printed on premium canvas and shipped free"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-yellow-50 to-red-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">From photo to pop art masterpiece in three simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="text-center p-8 bg-white border-2 border-gray-200 relative">
                <CardContent className="pt-6">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                    {index + 1}
                  </div>
                  <Icon className="w-12 h-12 text-red-500 mx-auto mb-4 mt-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstHowItWorks;
