import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useFounderStore } from '@/store/useFounderStore';

const StickyOrderRail = () => {
  const enhancements = useFounderStore((state) => state.enhancements);
  const total = useFounderStore((state) => state.computedTotal());
  const basePrice = useFounderStore((state) => state.basePrice);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const toggleEnhancement = useFounderStore((state) => state.toggleEnhancement);

  const enabledEnhancements = enhancements.filter((item) => item.enabled);
  const hasEnhancements = enabledEnhancements.length > 0;

  return (
    <aside className="md:sticky md:top-24">
      <Card glass className="space-y-6 border-2 border-white/20">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Your Order</h3>
          <p className="text-sm text-white/70">Ready to complete your masterpiece</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-sm font-medium text-white">{currentStyle?.name ?? 'Canvas'}</span>
            <span className="text-base font-bold text-white">${basePrice.toFixed(2)}</span>
          </div>
          {enabledEnhancements.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 animate-scaleIn"
            >
              <span className="text-sm font-medium text-purple-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {item.name}
              </span>
              <span className="text-base font-bold text-white">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400/40">
          <span className="text-base font-bold text-white">Total</span>
          <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
        </div>

        <button className="w-full bg-gradient-cta text-white font-bold text-lg px-6 py-4 rounded-xl shadow-glow-purple hover:shadow-glow-purple hover:scale-[1.02] transition-all duration-300">
          Complete Your Order →
        </button>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure checkout • Free shipping over $100</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <span>Ships in 3-5 business days</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>100% satisfaction guarantee</span>
          </div>
        </div>

        {hasEnhancements && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-400/30 animate-fadeIn">
            <p className="text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              You've added premium enhancements!
            </p>
            <p className="text-xs text-white/60 mt-1">Your artwork will be truly exceptional</p>
          </div>
        )}
      </Card>
    </aside>
  );
};

export default StickyOrderRail;
