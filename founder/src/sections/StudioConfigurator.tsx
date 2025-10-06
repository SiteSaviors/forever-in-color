import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import { useFounderStore } from '@/store/useFounderStore';
import StickyOrderRail from '@/components/studio/StickyOrderRail';
import LivingCanvasModal from '@/components/studio/LivingCanvasModal';

const StudioConfigurator = () => {
  const enhancements = useFounderStore((state) => state.enhancements);
  const toggleEnhancement = useFounderStore((state) => state.toggleEnhancement);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const previews = useFounderStore((state) => state.previews);
  const preview = currentStyle ? previews[currentStyle.id] : undefined;

  return (
    <section className="bg-slate-900 py-24">
      <Section className="space-y-10">
        <div className="flex items-center gap-3 text-sm text-brand-indigo uppercase tracking-[0.3em]">
          <span className="w-2 h-2 rounded-full bg-brand-indigo" /> Studio
        </div>
        <h2 className="text-3xl font-semibold">Steps 2–4 • Configure, Upsell, Checkout</h2>
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-10">
          <Card glass className="space-y-6">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Canvas Preview</div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 relative">
              {preview?.status === 'loading' && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
              {preview?.status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-red-300 bg-red-500/10">
                  Preview failed. Try another style.
                </div>
              )}
              <img
                src={
                  preview?.data?.url ??
                  currentStyle?.preview ??
                  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
                }
                alt="Studio preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-2">Size & Orientation</h3>
                <p>Responsive layout keeps preview cached while switching between 16:9, square, or portrait.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-2">Enhancements</h3>
                <p>Toggle frames, Living Canvas, and bundles with inline demos + price feedback.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-2">Sticky Order Rail</h3>
                <p>Mirrors selections, surfaces loyalty offers, and keeps checkout one tap away.</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Enhancements</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {enhancements.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleEnhancement(item.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      item.enabled ? 'border-emerald-300 bg-emerald-500/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <h4 className="text-white font-semibold mb-1">{item.name}</h4>
                    <p className="text-xs text-white/70 mb-3">{item.description}</p>
                    <span className="text-sm font-semibold text-emerald-200">${item.price.toFixed(2)}</span>
                    <span className="block text-[10px] text-white/50 mt-2">
                      {item.enabled ? 'Tap to remove' : 'Tap to add'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
          <StickyOrderRail />
        </div>
      </Section>
      <LivingCanvasModal />
    </section>
  );
};

export default StudioConfigurator;
