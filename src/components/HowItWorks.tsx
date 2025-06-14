
import { Upload, Palette, Smartphone, Package, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: Upload,
      title: "Upload Your Photo",
      description: "Choose any photo from your device or social media. High-resolution images work best for stunning results.",
      color: "from-pink-500 to-purple-600"
    },
    {
      id: 2,
      icon: Palette,
      title: "Choose Your Style",
      description: "Select from 10+ artistic styles including watercolor, pop art, neon synthwave, and more to transform your photo.",
      color: "from-purple-500 to-blue-600"
    },
    {
      id: 3,
      icon: Smartphone,
      title: "Optional AR & Customizations",
      description: "Preview your artwork in AR, adjust the size, choose frame options, and see how it looks in your space.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      id: 4,
      icon: Package,
      title: "Get Your Art",
      description: "We print your custom artwork on premium canvas, frame it beautifully, and ship it directly to your door.",
      color: "from-cyan-500 to-pink-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How It{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your memories into stunning framed canvas artwork in just 4 simple steps. 
            From upload to delivery, we make it effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between mb-16">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step Card */}
                <div className="group relative">
                  <div className="text-center">
                    {/* Icon */}
                    <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-gray-800">{step.id}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="max-w-xs">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>

                {/* Arrow (except for last step) */}
                {index < steps.length - 1 && (
                  <div className="mx-8 flex-shrink-0">
                    <ArrowRight className="w-8 h-8 text-purple-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                <div className="flex items-start space-x-4">
                  {/* Icon and Line */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-3 border-gray-100 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-gray-800">{step.id}</span>
                    </div>

                    {/* Connecting Line (except for last step) */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-purple-200 to-purple-100"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">2-3</div>
            <div className="text-gray-600 text-sm">Business Days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">10+</div>
            <div className="text-gray-600 text-sm">Art Styles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">Premium</div>
            <div className="text-gray-600 text-sm">Canvas Quality</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">Free</div>
            <div className="text-gray-600 text-sm">Shipping</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Start Creating Your Art
          </button>
          <p className="text-gray-500 text-sm mt-3">No account required to get started</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
