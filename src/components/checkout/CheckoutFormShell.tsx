import { Fragment, useMemo } from 'react';
import Card from '@/components/ui/Card';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import ContactForm from '@/components/checkout/ContactForm';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentStep from '@/components/checkout/PaymentStep';
import ReviewCard from '@/components/checkout/ReviewCard';

const stepCopy: Record<
  ReturnType<typeof useCheckoutStore.getState>['step'],
  { title: string; description: string }
> = {
  contact: {
    title: 'Contact Details',
    description: 'We use this to send order confirmations and studio updates.',
  },
  shipping: {
    title: 'Shipping Address',
    description: 'Tell us where to deliver your finished canvas masterpiece.',
  },
  payment: {
    title: 'Payment Method',
    description: 'Secure payment processed through Stripe with 3D Secure support.',
  },
  review: {
    title: 'Review & Confirm',
    description: 'One last look before we hand your canvas off to production.',
  },
};

const CheckoutFormShell = () => {
  const { step, setStep } = useCheckoutStore();
  const copy = stepCopy[step];
  const headline = useMemo(() => copy.title, [copy.title]);

  return (
    <Fragment>
      <CheckoutProgress />
      <Card glass className="space-y-8 border border-white/10 bg-white/5 p-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Wondertone Checkout
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-white">{headline}</h1>
          <p className="mt-2 text-sm text-white/60">{copy.description}</p>
        </div>

        {step === 'contact' && <ContactForm />}

        {step === 'shipping' && <ShippingForm />}

        {step === 'payment' && (
          <PaymentStep
            onSuccess={() => setStep('review')}
            onBack={() => setStep('shipping')}
          />
        )}

        {step === 'review' && (
          <ReviewCard
            onBackToContact={() => setStep('contact')}
            onBackToShipping={() => setStep('shipping')}
          />
        )}

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-xs text-white/50">
          <span>
            Need help? Reply to your Wondertone concierge email for white-glove support or DM @Wondertone.
          </span>
          <span>✨</span>
        </div>
      </Card>
    </Fragment>
  );
};

export default CheckoutFormShell;
