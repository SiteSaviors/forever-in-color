
import { Heart, Clock, Users, Sparkles } from "lucide-react";

const EmotionalJourney = () => {
  const emotionalMoments = [
    {
      icon: Heart,
      title: "The Last Photo",
      story: "Sarah wished she had one more moment with her grandmother. Now, every morning, she scans the QR code and watches Grandma's gentle smile come alive—her voice, her laugh, her love filling the room again.",
      gradient: "from-pink-500 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50"
    },
    {
      icon: Users,
      title: "Growing Up Too Fast",
      story: "\"Mom, look how small I was!\" Emma's daughter gasps as the canvas reveals her first steps, those tiny hands reaching forward. Time may move forward, but some moments deserve to live forever.",
      gradient: "from-purple-500 to-indigo-500",
      bgGradient: "from-purple-50 to-indigo-50"
    },
    {
      icon: Clock,
      title: "Four Paws, One Heart",
      story: "Max may have crossed the rainbow bridge, but his tail still wags in the living room. His family gathers around the canvas, watching him chase butterflies one more time, keeping his spirit alive.",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-purple-300/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-purple-300/30 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 border border-pink-200/60 shadow-lg mb-6">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-medium text-pink-700">Real Stories, Real Magic</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            More Than Art.{" "}
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              It's Love Made Visible.
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every canvas tells a story. Every scan brings back a moment. 
            These aren't just pictures—they're portals to the memories that matter most.
          </p>
        </div>

        {/* Emotional Stories Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {emotionalMoments.map((moment, index) => {
            const Icon = moment.icon;
            return (
              <div 
                key={index}
                className={`relative group cursor-pointer transform transition-all duration-500 hover:scale-105`}
              >
                <div className={`bg-gradient-to-br ${moment.bgGradient} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 h-full`}>
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${moment.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Story Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {moment.title}
                  </h3>

                  {/* Story Content */}
                  <p className="text-gray-700 leading-relaxed text-lg italic">
                    "{moment.story}"
                  </p>

                  {/* Decorative element */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`w-3 h-3 bg-gradient-to-r ${moment.gradient} rounded-full animate-pulse`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emotional Call to Action */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/50">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            What Story Will Your Memory Tell?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Every moment matters. Every memory deserves to live forever. 
            Transform your most precious photos into living art that keeps love alive.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
              <Heart className="w-5 h-5 fill-white" />
              Start Your Story
            </button>
            <p className="text-sm text-gray-500">Join 15,000+ families preserving their memories</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmotionalJourney;
