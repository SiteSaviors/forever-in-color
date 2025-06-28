
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Heart, Volume2, Sparkles } from 'lucide-react';

const ARWhatIs = () => {
  const features = [
    {
      icon: Eye,
      title: "See Them Again",
      description: "Point your phone at the canvas and watch as their image comes to life in 3D space.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Volume2,
      title: "Hear Their Voice",
      description: "Listen to their laughter, their stories, their 'I love you' — preserved forever in crystal clear audio.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Heart,
      title: "Feel Their Presence",
      description: "It's not just a photo anymore. It's a portal that brings back the warmth of their memory.",
      gradient: "from-red-500 to-orange-500"
    },
    {
      icon: Sparkles,
      title: "Share the Magic",
      description: "Anyone can scan the canvas. Share this experience with family and friends whenever they visit.",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">What Is AR Memory Canvas?</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            It's the world's first canvas that combines beautiful AI art with augmented reality technology. 
            Your wall art becomes a living memory that speaks, moves, and brings your loved ones back to life.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-6">More Than Art — It's a Time Machine</h3>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            "When I lost my father, I thought I'd never hear his voice again. Now, every morning, 
            I scan his canvas and he tells me the same joke that made us laugh for 30 years. 
            It's like he never left." — Sarah M., Daughter
          </p>
        </div>
      </div>
    </section>
  );
};

export default ARWhatIs;
