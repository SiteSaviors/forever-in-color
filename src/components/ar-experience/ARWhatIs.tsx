
import { Upload, Wand2, Printer, Smartphone } from '@/components/ui/icons';

const ARWhatIs = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Photo",
      description: "Share your precious moment with us",
      detail: "Any photo becomes a living memory"
    },
    {
      icon: Wand2,
      title: "AI Video Generation",
      description: "We create a 5–30s AI-powered video",
      detail: "Motion, voice, and sound brought to life"
    },
    {
      icon: Printer,
      title: "Premium Canvas Print",
      description: "Your canvas printed with embedded QR code",
      detail: "Museum-quality printing with AR technology"
    },
    {
      icon: Smartphone,
      title: "Scan & Experience",
      description: "Watch your memory come alive",
      detail: "Full color, motion, and sound on any smartphone"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">How We Bring Your Memories to Life</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            It's more than art — it's a living memory. Every canvas becomes a portal to relive your most precious moments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-2">{step.description}</p>
                <p className="text-sm text-purple-600 italic">{step.detail}</p>
              </div>
              
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent transform -translate-y-1/2 z-0"></div>
              )}
            </div>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Lost Loved Ones", description: "Hear their voice speaking again", emoji: "💝" },
            { title: "Cherished Pets", description: "Watch them bark, smile, or move", emoji: "🐕" },
            { title: "Wedding Moments", description: "Relive your vows and first kiss", emoji: "💒" },
            { title: "Family Stories", description: "Grandparent's voice reading letters", emoji: "👴" }
          ].map((useCase, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-3">{useCase.emoji}</div>
              <h4 className="font-semibold text-gray-900 mb-2">{useCase.title}</h4>
              <p className="text-gray-600 text-sm">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ARWhatIs;
