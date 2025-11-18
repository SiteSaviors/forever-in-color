import { RefObject } from 'react';
import CanvasCheckoutStepIndicator from '@/components/studio/CanvasCheckoutStepIndicator';
import ContactForm from '@/components/checkout/ContactForm';
import CanvasOrderSummary from '@/components/studio/CanvasOrderSummary';

interface CanvasCheckoutContactStepProps {
  onBack: () => void;
  onNext: () => void;
  total: number;
  orientationPreviewPending: boolean;
  frameSectionRef: RefObject<HTMLElement | null>;
  sizeSectionRef: RefObject<HTMLElement | null>;
  scrollToSection: (ref: RefObject<HTMLElement | null>) => void;
  renderTrustSignals: () => JSX.Element;
  renderTestimonialCard: () => JSX.Element;
}

const CanvasCheckoutContactStep = ({
  onBack,
  onNext,
  total,
  orientationPreviewPending,
  frameSectionRef,
  sizeSectionRef,
  scrollToSection,
  renderTrustSignals,
  renderTestimonialCard,
}: CanvasCheckoutContactStepProps) => (
  <section className="space-y-6 px-6 pb-10 transition duration-200 motion-safe:animate-[slideFade_240ms_ease-out]">
    <div className="flex flex-wrap items-center justify-between gap-3 text-white/60">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold hover:text-white"
      >
        <span aria-hidden="true" className="text-lg">
          ←
        </span>
        Back to Canvas Setup
      </button>
      <span className="text-xs uppercase tracking-[0.28em]">Step 2 · Contact</span>
    </div>
    <CanvasCheckoutStepIndicator />
    <div className="rounded-3xl border border-white/12 bg-slate-950/75 p-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Who should we reach?</p>
        <p className="text-base text-white/80">
          We’ll send studio confirmations, shipping timelines, and concierge support to this inbox.
        </p>
      </div>
      <div className="mt-6">
        <ContactForm onNext={onNext} />
      </div>
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

export default CanvasCheckoutContactStep;
