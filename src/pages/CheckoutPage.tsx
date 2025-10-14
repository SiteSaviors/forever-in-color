import FounderNavigation from '@/components/navigation/FounderNavigation';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import CheckoutFormShell from '@/components/checkout/CheckoutFormShell';

const CheckoutPage = () => {
  return (
    <div className="min-h-screen text-white">
      <FounderNavigation />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(129,80,255,0.45),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(32,224,255,0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#08021a_0%,#140b35_38%,#1b1149_65%,#050116_100%)] opacity-95" />
        <div className="relative mx-auto w-full max-w-[1600px] px-6 pb-20 pt-32">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            Wondertone Studio
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Finish Your Masterpiece
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Confirm your contact details, shipping address, and payment method. We hand-finish every canvas and send progress updates along the way.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <CheckoutSummary />
          </aside>
          <section>
            <CheckoutFormShell />
          </section>
        </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
