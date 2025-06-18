import { Upload, Palette, Settings, Package, ArrowRight } from "lucide-react";
const HowItWorks = () => {
  const steps = [{
    id: 1,
    icon: Upload,
    title: "Upload Your Photo",
    description: "Share a meaningful photo—loved ones, pets, homes, cars, or anything that holds special significance to you.",
    color: "from-purple-500 to-blue-500",
    image: "/lovable-uploads/57c424be-c5d9-4b6f-88fc-9ce28c38c109.png"
  }, {
    id: 2,
    icon: Palette,
    title: "Choose Your Style",
    description: "Select from 20+ artistic styles including watercolor, poster, pop art, neon, and more to transform your photo.",
    color: "from-pink-500 to-purple-500",
    image: "/lovable-uploads/e0c0451d-410c-44df-a788-593bfecb9b68.png"
  }, {
    id: 3,
    icon: Settings,
    title: "Add Customizations & Optional AR",
    description: "Choose size, orientation, and frame. to boost image quality or add a QR code for a magical AR experience.",
    color: "from-purple-500 to-pink-500",
    video: true
  }, {
    id: 4,
    icon: Package,
    title: "Get Your Art",
    description: "Unbox your one-of-a-kind creation—delivered ready to hang, gift, or share. A modern heirloom made just for you that lasts a lifetime.",
    color: "from-gray-400 to-gray-600",
    image: "/lovable-uploads/6ac56455-7d7e-4734-a024-eaecc752e908.png"
  }];
  return <section id="how-it-works" className="py-20 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            How It{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">Transform your memories into stunning framed canvas artwork in just 4 simple steps. 
Include a QR Code that brings your canvas to life with a 5 to 30 second video. 
 From upload to delivery, we make it effortless.</p>
        </div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => <div key={step.id} className="relative group">
              {/* Step Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/50">
                {/* Step Number Badge */}
                <div className={`
                  absolute -top-4 left-8 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg
                  bg-gradient-to-r ${step.color}
                `}>
                  {step.id}
                </div>

                {/* Photo Frame or Video */}
                <div className="mb-6 mt-4">
                  <div className={`
                    relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg
                    bg-gradient-to-br ${step.color} p-1
                  `}>
                    <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                      {step.video ? <div className="w-full h-full relative">
                          <iframe src="https://player.vimeo.com/video/1094210360?badge=0&autopause=0&autoplay=1&loop=1&player_id=0&app_id=58479&muted=1" className="absolute top-0 left-0 w-full h-full" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" title="AR Demo Video" />
                        </div> : <img src={step.image} alt={`Step ${step.id}`} className="w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>

                {/* Icon */}
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
                  bg-gradient-to-r ${step.color}
                `}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Arrow connector (desktop only) */}
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-purple-500" />
                  </div>
                </div>}
            </div>)}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">2-3</div>
            <div className="text-gray-600 text-sm">Business Days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">20+</div>
            <div className="text-gray-600 text-sm">Art Styles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Premium</div>
            <div className="text-gray-600 text-sm">Canvas Quality</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Free</div>
            <div className="text-gray-600 text-sm">Shipping</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg">
            Start Creating Your Art
          </button>
          <p className="text-gray-500 text-sm mt-3">No account required to get started</p>
        </div>
      </div>
    </section>;
};
export default HowItWorks;