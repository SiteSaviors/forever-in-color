import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useFounderStore } from '@/store/useFounderStore';

const StickyOrderRail = () => {
  const enhancements = useFounderStore((state) => state.enhancements);
  const total = useFounderStore((state) => state.computedTotal());
  const basePrice = useFounderStore((state) => state.basePrice);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const toggleEnhancement = useFounderStore((state) => state.toggleEnhancement);

  return (
    <aside className="md:sticky md:top-24">
      <Card className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
          <span className="text-sm font-semibold text-slate-500">${total.toFixed(2)}</span>
        </div>
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex justify-between">
            <span>{currentStyle?.name ?? 'Canvas'} • Base</span>
            <span>${basePrice.toFixed(2)}</span>
          </li>
          {enhancements
            .filter((item) => item.enabled)
            .map((item) => (
              <li key={item.id} className="flex justify-between text-emerald-600">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </li>
            ))}
        </ul>
        <Button className="w-full">Complete Order • ${total.toFixed(2)}</Button>
        <div className="space-y-3 text-sm text-slate-500">
          {enhancements.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleEnhancement(item.id)}
              className={`w-full text-left px-3 py-2 rounded-xl border transition ${
                item.enabled
                  ? 'border-emerald-300 bg-emerald-500/10 text-emerald-600'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="text-xs">{item.enabled ? 'Added' : `+$${item.price.toFixed(2)}`}</span>
              </div>
              <p className="text-xs mt-1 opacity-70">{item.description}</p>
            </button>
          ))}
        </div>
      </Card>
    </aside>
  );
};

export default StickyOrderRail;
