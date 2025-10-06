import { Sparkles, Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/nice-snow.png')]" />
      <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.4em] bg-white/15 rounded-full">
              <Sparkles className="w-4 h-4" />
              Instant Preview Engine
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight drop-shadow-lg">
              Bring memories to life with museum-grade AI art and Living Canvas AR.
            </h1>
            <p className="text-lg text-white/80 max-w-xl leading-relaxed">
              Wondertone merges human storytelling with a powerful studio workflow. Upload once, explore curated styles,
              and checkout with physical canvas, instant digital, and AR experiences in minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/create" className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 font-semibold px-6 py-3 shadow-lg shadow-indigo-500/40 transition hover:-translate-y-1">
                Start Creating
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/create" state={{ preselectedStyle: 'watercolor-dreams' }} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-white/80 backing hover:bg-white/15">
                Browse Styles
                <Play className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-white/20 blur-3xl" />
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80"
                alt="Wondertone preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md rounded-full px-4 py-2 text-xs font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Live preview ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
