import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';

const styleCards = [
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    description: 'Soft washes with gentle light leaks perfect for portraits and weddings.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'neon-bloom',
    name: 'Neon Bloom',
    description: 'Electric palettes and bloom edges for nightlife captured in motion.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'monochrome-muse',
    name: 'Monochrome Muse',
    description: 'Silver gelatin inspired black & white portraiture with cinematic grain.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  },
];

const StyleShowcase = () => {
  return (
    <Section id="styles" data-founder-anchor="styles">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-pink">Curated Styles</p>
          <h2 className="text-3xl font-semibold mt-2">Browse signature looks crafted for emotion</h2>
        </div>
        <button className="text-sm text-brand-indigo hover:text-white transition">View All Styles →</button>
      </div>
      <p className="text-white/70 max-w-3xl mb-10">
        Every style is handcrafted alongside artists and storytellers. Click through to see how Wondertone balances tone,
        brushwork, and AR overlays for different memories.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {styleCards.map((style) => (
          <Card key={style.id} className="overflow-hidden flex flex-col">
            <img src={style.image} alt={style.name} className="h-48 w-full object-cover" />
            <div className="p-6 space-y-3 flex-1 flex flex-col">
              <h3 className="text-xl font-semibold">{style.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{style.description}</p>
              <button className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800 transition">
                Try This Style
              </button>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default StyleShowcase;
