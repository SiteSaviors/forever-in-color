import { RefObject } from 'react';
import CanvasOrderSummary from '@/components/studio/CanvasOrderSummary';

type SuccessTimelineItem = {
  icon: string;
  title: string;
  body: string;
};

interface CanvasCheckoutSuccessStepProps {
  timeline: SuccessTimelineItem[];
  shareFeedback: string | null;
  onShare: () => void;
  onReturn: () => void;
  total: number;
  orientationPreviewPending: boolean;
  frameSectionRef: RefObject<HTMLElement | null>;
  sizeSectionRef: RefObject<HTMLElement | null>;
  scrollToSection: (ref: RefObject<HTMLElement | null>) => void;
  renderTrustSignals: () => JSX.Element;
  renderTestimonialCard: () => JSX.Element;
}

const CanvasCheckoutSuccessStep = ({
  timeline,
  shareFeedback,
  onShare,
  onReturn,
  total,
  orientationPreviewPending,
  frameSectionRef,
  sizeSectionRef,
  scrollToSection,
  renderTrustSignals,
  renderTestimonialCard,
}: CanvasCheckoutSuccessStepProps) => (
  <section className="space-y-8 px-6 pb-10 transition duration-200 motion-safe:animate-[slideFade_240ms_ease-out]">
    <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-purple-900/60 via-slate-950 to-slate-950/95 p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.65)]">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-500/30 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-48 w-48 rounded-full bg-emerald-400/20 blur-[100px]" />
      <div className="relative space-y-3 text-center">
        <span className="text-xs uppercase tracking-[0.35em] text-white/60">Wondertone Checkout</span>
        <h2 className="text-3xl font-semibold">Your canvas is officially in production</h2>
        <p className="text-white/70">
          Our atelier is stretching your piece, applying finishes, and preparing premium packaging.
        </p>
      </div>
      <div className="relative mt-8 grid gap-4 md:grid-cols-3">
        {timeline.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
            <div className="text-xl">{item.icon}</div>
            <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
            <p className="text-xs text-white/70">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="relative mt-8 flex flex-col gap-3 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-center">
        <button
          type="button"
          className="w-full rounded-2xl bg-white/90 px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-white sm:w-auto"
          onClick={onReturn}
        >
          Return to Studio
        </button>
        <button
          type="button"
          className="w-full rounded-2xl border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white/90 transition hover:border-white/60 sm:w-auto"
          onClick={onShare}
        >
          Share the excitement →
        </button>
      </div>
      {shareFeedback ? <p className="mt-3 text-center text-xs text-white/70">{shareFeedback}</p> : null}
    </div>
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="space-y-6 lg:flex-1">
        <CanvasOrderSummary
          total={total}
          onEditFrame={() => scrollToSection(frameSectionRef)}
          onEditSize={() => scrollToSection(sizeSectionRef)}
          orientationPreviewPending={orientationPreviewPending}
        />
      </div>
      <div className="space-y-6 lg:w-[300px]">
        {renderTrustSignals()}
        {renderTestimonialCard()}
      </div>
    </div>
  </section>
);

export default CanvasCheckoutSuccessStep;
