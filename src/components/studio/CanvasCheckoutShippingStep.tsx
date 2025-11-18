import { RefObject } from 'react';
import CanvasCheckoutStepIndicator from '@/components/studio/CanvasCheckoutStepIndicator';
import ShippingForm from '@/components/checkout/ShippingForm';
import CanvasOrderSummary from '@/components/studio/CanvasOrderSummary';

interface CanvasCheckoutShippingStepProps {
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

const CanvasCheckoutShippingStep = ({
  onBack,
  onNext,
  total,
  orientationPreviewPending,
  frameSectionRef,
  sizeSectionRef,
  scrollToSection,
  renderTrustSignals,
  renderTestimonialCard,
}: CanvasCheckoutShippingStepProps) => (
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
        Back to Contact Details
      </button>
      <span className="text-xs uppercase tracking-[0.28em]">Step 3 · Shipping</span>
    </div>
    <CanvasCheckoutStepIndicator />
    <div className="rounded-3xl border border-white/12 bg-slate-950/75 p-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Where should we deliver?</p>
        <p className="text-base text-white/80">
          Provide a trusted address for insured delivery. We’ll share tracking the moment your canvas ships.
        </p>
      </div>
      <div className="mt-6">
        <ShippingForm onBack={onBack} onNext={onNext} />
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

export default CanvasCheckoutShippingStep;
