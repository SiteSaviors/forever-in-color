const styleCards = [
  {
    name: 'Watercolor Dreams',
    description: 'Soft washes with gentle light leaks perfect for portraits and weddings.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Neon Bloom',
    description: 'Electric palettes and bloom edges for nightlife captured in motion.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Monochrome Muse',
    description: 'Silver gelatin inspired black & white portraiture with cinematic grain.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  },
];

const StyleShowcase = () => {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Curated Styles</p>
          <h2 className="text-3xl font-semibold mt-2">Browse signature looks crafted for emotion</h2>
        </div>
        <button className="text-sm text-indigo-300 hover:text-white transition">View All Styles →</button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {styleCards.map((style) => (
          <div key={style.name} className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <img src={style.image} alt={style.name} className="h-48 w-full object-cover" />
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-semibold">{style.name}</h3>
              <p className="text-sm text-slate-600">{style.description}</p>
              <button className="w-full rounded-full bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800 transition">
                Try This Style
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StyleShowcase;
