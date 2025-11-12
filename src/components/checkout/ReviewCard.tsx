import { memo } from 'react';
import Card from '@/components/ui/Card';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { format } from 'date-fns';
import { shallow } from 'zustand/shallow';

type ReviewCardProps = {
  onBackToContact: () => void;
  onBackToShipping: () => void;
};

const ReviewCardComponent = ({ onBackToContact, onBackToShipping }: ReviewCardProps) => {
  const { contact, shipping } = useCheckoutStore(
    (state) => ({
      contact: state.contact,
      shipping: state.shipping,
    }),
    shallow
  );
  const estimatedShipDate = format(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    'MMMM d'
  );

  return (
    <Card glass className="space-y-6 border border-white/10 bg-white/5 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Review your details</h2>
        <p className="mt-2 text-sm text-white/60">
          Confirm the information below before we finalize your Wondertone canvas.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Contact</p>
              <p className="mt-2 text-sm text-white">
                {contact.firstName || contact.lastName
                  ? `${contact.firstName} ${contact.lastName}`.trim()
                  : 'Missing name'}
              </p>
              <p className="text-xs text-white/70">{contact.email || 'Missing email'}</p>
              {contact.phone && (
                <p className="text-xs text-white/40">Phone: {contact.phone}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onBackToContact}
              className="text-xs font-semibold text-purple-300 hover:text-purple-200"
            >
              Edit
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Shipping</p>
              <p className="mt-2 text-sm text-white">
                {shipping.addressLine1 || 'Street address missing'}
              </p>
              {shipping.addressLine2 && (
                <p className="text-xs text-white/70">{shipping.addressLine2}</p>
              )}
              <p className="text-xs text-white/70">
                {[shipping.city, shipping.region, shipping.postalCode].filter(Boolean).join(', ') || 'City / State / Postal code missing'}
              </p>
              <p className="text-xs text-white/70">{shipping.country}</p>
            </div>
            <button
              type="button"
              onClick={onBackToShipping}
              className="text-xs font-semibold text-purple-300 hover:text-purple-200"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-400/40 bg-purple-500/20 p-5 text-sm text-purple-100">
        <p className="font-semibold">Next steps</p>
        <ul className="mt-2 space-y-2 text-xs">
          <li>• Stripe payment integration lands in the next milestone—stay tuned.</li>
          <li>• Once paid, your order locks in and our artisans start production immediately.</li>
          <li>• Estimated ship date: <span className="font-semibold">{estimatedShipDate}</span>.</li>
        </ul>
      </div>
    </Card>
  );
};

const ReviewCard = memo(ReviewCardComponent);

export default ReviewCard;
