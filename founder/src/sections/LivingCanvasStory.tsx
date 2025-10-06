import { Sparkles, Video, Heart } from 'lucide-react';

const LivingCanvasStory = () => {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Living Canvas</p>
          <h2 className="text-3xl font-semibold">Memories that play back whenever you need them</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Attach a 30-second Living Canvas video to every Wondertone print. Scan the embedded QR marker to see the
            hug, the laugh, the vows—all in motion. No app downloads. No friction. Just pure emotion at the point of
            gifting.
          </p>
          <ul className="space-y-4 text-white/70">
            <li className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-300 mt-1" />
              <span><strong>Magic in every frame.</strong> We blend physical canvas with augmented storytelling to create heirlooms that move.</span>
            </li>
            <li className="flex items-start gap-3">
              <Video className="w-5 h-5 text-emerald-300 mt-1" />
              <span><strong>10s to relive a moment.</strong> Scan, tap, and rewatch without apps or passwords.</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-emerald-300 mt-1" />
              <span><strong>Perfect for tributes & celebrations.</strong> Weddings, memorials, milestone birthdays—Living Canvas keeps the story alive.</span>
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 bg-emerald-500/20 blur-3xl" />
          <div className="relative rounded-3xl overflow-hidden border border-emerald-200/40 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl p-6">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80"
                alt="Living canvas demo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-emerald-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                QR Ready
              </span>
              <span>View a sample →</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LivingCanvasStory;
