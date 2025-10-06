import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Clock } from 'lucide-react';

const FooterCTA = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-16">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <div className="relative max-w-5xl mx-auto px-6 text-center space-y-10">
        <h2 className="text-4xl font-semibold">Ready to deliver the world’s most meaningful art gifts?</h2>
        <p className="text-white/70 max-w-2xl mx-auto text-lg">
          Join tens of thousands of families, memory artists, and thoughtful gifters who trust Wondertone to preserve
          their stories across canvas, AR, and digital keepsakes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/create" className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 font-semibold px-6 py-3 shadow-lg hover:-translate-y-1 transition">
            Start Creating Now
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-white/80 hover:bg-white/10 transition">
            View Marketplace Preview
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-3">
            <Users className="w-6 h-6 text-indigo-300" />
            <div>
              <h4 className="font-semibold">Social proof engine</h4>
              <p className="text-sm text-white/70">Smart momentum modules encourage hesitant visitors with live stories.</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-300" />
            <div>
              <h4 className="font-semibold">Trust built in</h4>
              <p className="text-sm text-white/70">Stripe, Supabase, and multi-region caching keep transactions secure and fast.</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-3">
            <Clock className="w-6 h-6 text-indigo-300" />
            <div>
              <h4 className="font-semibold">Time-to-wow under 10s</h4>
              <p className="text-sm text-white/70">Parallel preview generation & cache warming keep excitement high.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterCTA;
