import { memo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export type MembershipPortalIntent = 'cancel' | 'update';

type MembershipConfirmationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierLabel: string;
  renewAt: string | null;
  remainingTokens: number | null;
  quota: number | null;
  onRequestPortal: (intent: MembershipPortalIntent) => void;
  intentLoading: MembershipPortalIntent | null;
};

const formatRenewalLabel = (renewAt: string | null) => {
  if (!renewAt) return 'Renews monthly';
  const date = new Date(renewAt);
  if (Number.isNaN(date.getTime())) return 'Renews monthly';
  return `Renews on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

const MembershipConfirmationModalComponent = ({
  open,
  onOpenChange,
  tierLabel,
  renewAt,
  remainingTokens,
  quota,
  onRequestPortal,
  intentLoading,
}: MembershipConfirmationModalProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm" />
      <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-[0_25px_80px_rgba(15,10,45,0.65)]">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-xs font-semibold uppercase tracking-[0.32em] text-white/50">
              Manage Membership
            </Dialog.Title>
            <button
              type="button"
              aria-label="Close manage membership"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-5 text-sm text-white/80">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.28em] text-white/60">Current tier</span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm font-semibold text-white">
                  {tierLabel}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                <span>{formatRenewalLabel(renewAt)}</span>
                <span>
                  Tokens {remainingTokens == null ? '∞' : Math.max(0, remainingTokens)}
                  {quota != null ? ` / ${quota}` : ''}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-white/80">
              <p className="text-base font-semibold text-white">Are you sure you want to change or cancel?</p>
              <p>
                Cancelling will pause auto-renew, and you keep access until the end of this cycle. Updating payment details or switching tiers will soon hand off to a secure Stripe billing portal.
              </p>
              <p className="text-white/60">Select an option below. Well wire these actions to Stripe as soon as the portal integration ships.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              className="flex-1 rounded-2xl border border-white/20 bg-rose-500/25 px-4 py-3 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/35 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onRequestPortal('cancel')}
              disabled={intentLoading !== null}
            >
              {intentLoading === 'cancel' ? 'Preparing…' : 'Cancel subscription'}
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onRequestPortal('update')}
              disabled={intentLoading !== null}
            >
              {intentLoading === 'update' ? 'Preparing…' : 'Update payment method'}
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl border border-white/20 bg-emerald-500/20 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
              onClick={() => onOpenChange(false)}
            >
              Keep current plan
            </button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const MembershipConfirmationModal = memo(MembershipConfirmationModalComponent);

export default MembershipConfirmationModal;
