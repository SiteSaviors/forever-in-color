const LaunchpadLayout = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex items-center gap-3 text-sm text-indigo-300 uppercase tracking-[0.3em] mb-6">
        <span className="w-2 h-2 rounded-full bg-indigo-300" /> Launchpad
      </div>
      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold">Step 1 • Upload & Choose Style</h2>
          <p className="text-white/70 text-lg max-w-3xl">
            The launchpad keeps upload, crop, and style exploration in one split view. As soon as you tap a style, the
            preview rail streams results with blur skeletons to eliminate dead time.
          </p>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-semibold">Upload & Smart Crop</h3>
              <p className="text-sm text-white/70">
                Drag a photo. We detect orientation, suggest smart crops, and auto-advance the progress tracker.
              </p>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img src="https://images.unsplash.com/photo-1508264165352-258a6c62f3e8?auto=format&fit=crop&w=800&q=80" alt="Upload flow" className="h-48 w-full object-cover" />
              </div>
              <button className="rounded-full border border-white/40 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition">
                Upload Photo
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xl font-semibold">Live Preview Rail</h3>
              <p className="text-sm text-white/70">
                Parallel requests generate multiple styles in seconds. Choose your favorite to continue.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                {['Watercolor Dreams', 'Pastel Bliss', 'Neon Bloom', 'Monochrome Muse'].map((style) => (
                  <div key={style} className="h-28 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-end p-3">
                    <span>{style}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <aside className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-semibold">Preview Summary</h3>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex justify-between"><span>Photo</span><span>Awaiting upload</span></div>
            <div className="flex justify-between"><span>Style</span><span>—</span></div>
            <div className="flex justify-between"><span>Status</span><span>Idle</span></div>
          </div>
          <button className="rounded-full bg-white text-slate-900 font-semibold px-4 py-2" disabled>
            Continue to Studio
          </button>
          <p className="text-xs text-white/60">
            Once a preview renders, the CTA unlocks. The sticky order rail mirrors this panel throughout the flow.
          </p>
        </aside>
      </div>
    </section>
  );
};

export default LaunchpadLayout;
