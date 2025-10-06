const highlights = [
  {
    title: 'Canvas Preview',
    body: 'Keep the artwork in full view while editing orientation, frame, and Living Canvas settings.',
  },
  {
    title: 'Real-time Pricing',
    body: 'Sticky order rail updates with canvas, add-ons, token bundles, and shipping thresholds.',
  },
  {
    title: 'Living Canvas Modal',
    body: 'After first preview completes, launch a micro-interaction that triple boosts AR attachments.',
  },
];

const StudioConfigurator = () => {
  return (
    <section className="bg-slate-900 py-24">
      <div className="max-w-6xl mx-auto px-6 space-y-10">
        <div className="flex items-center gap-3 text-sm text-indigo-300 uppercase tracking-[0.3em]">
          <span className="w-2 h-2 rounded-full bg-indigo-300" /> Studio
        </div>
        <h2 className="text-3xl font-semibold">Steps 2–4 • Configure, Upsell, Checkout</h2>
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Canvas Preview</div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
              <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" alt="Studio preview" className="w-full h-full object-cover" />
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70">
              {highlights.map((item) => (
                <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <aside className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <span className="text-sm font-semibold">$148.99</span>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between"><span>24" x 18" Canvas</span><span>$129.00</span></li>
              <li className="flex justify-between"><span>Floating Frame (Walnut)</span><span>$29.00</span></li>
              <li className="flex justify-between"><span>Living Canvas AR</span><span>$59.99</span></li>
              <li className="flex justify-between"><span>Canvas + Digital Bundle</span><span>$14.99</span></li>
            </ul>
            <button className="w-full rounded-full bg-slate-900 text-white py-3 font-semibold">Complete Order • $148.99</button>
            <p className="text-xs text-slate-500">
              Guest checkout, Apple Pay, and token top-up routes integrate here while keeping AI generation session live.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default StudioConfigurator;
