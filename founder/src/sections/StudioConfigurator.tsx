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
          <div className="space-y-8">
            <Card glass className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">Your Artwork Preview</h3>
                <p className="text-base text-white/70">See how your canvas will look in stunning detail</p>
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/20 relative shadow-2xl bg-gradient-preview-bg">
                {preview?.status === 'loading' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                    <div className="absolute inset-0 preview-skeleton" />
                  </div>
                )}
                {preview?.status === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-red-500/10 border-2 border-red-400/30">
                    <svg className="w-12 h-12 text-red-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-base font-semibold text-red-300">Preview generation failed</p>
                    <p className="text-sm text-white/60 mt-1">Try selecting a different style</p>
                  </div>
                )}
                <img
                  src={
                    preview?.data?.url ??
                    currentStyle?.preview ??
                    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt="Your artwork preview"
                  className="w-full h-full object-cover"
                />
                {preview?.status === 'ready' && (
                  <div className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-purple-500/90 text-white text-xs font-semibold shadow-glow-soft backdrop-blur-sm animate-scaleIn">
                    <span className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Ready to print
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Enhance Your Art</h3>
                <p className="text-base text-white/70">Make your canvas even more special with premium options</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {enhancements.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleEnhancement(item.id)}
                    className={`group rounded-2xl border-2 p-5 text-left transition-all duration-300 ${
                      item.enabled
                        ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-glow-soft scale-[1.02]'
                        : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        item.enabled ? 'bg-purple-500 shadow-glow-soft' : 'bg-white/10 group-hover:bg-white/20'
                      }`}>
                        {item.enabled ? (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </div>
                      <span className="text-lg font-bold text-white">${item.price.toFixed(2)}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{item.name}</h4>
                    <p className="text-sm text-white/70 mb-3 leading-relaxed">{item.description}</p>
                    <span className={`text-xs font-semibold transition-colors ${
                      item.enabled ? 'text-purple-300' : 'text-white/50 group-hover:text-white/70'
                    }`}>
                      {item.enabled ? '✓ Added to order' : '+ Add to order'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <StickyOrderRail />
        </div>
      </Section>
      <LivingCanvasModal />
    </section>
  );
};

export default StudioConfigurator;
