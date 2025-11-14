import * as Dialog from '@radix-ui/react-dialog';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { memo } from 'react';
import TokenHistoryMiniList from '@/components/navigation/TokenHistoryMiniList';

type TokenBalanceDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierLabel: string;
  remainingTokens: number | null;
  renewAt: string | null;
  onManageMembership: () => void;
  isLoading: boolean;
};

const formatRenewalDate = (renewAt: string | null) => {
  if (!renewAt) return 'Auto-renews monthly';
  const date = new Date(renewAt);
  if (Number.isNaN(date.getTime())) return 'Auto-renews monthly';
  return `Renews ${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
};

const TokenBalanceDrawerComponent = ({ open, onOpenChange, tierLabel, remainingTokens, renewAt, onManageMembership, isLoading }: TokenBalanceDrawerProps) => {
  const tokenDisplay = isLoading ? '—' : remainingTokens == null ? '∞' : Math.max(0, remainingTokens).toString();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm" />
        <Dialog.Content
          className={clsx(
            'fixed inset-y-0 right-0 z-50 w-full max-w-md',
            'border-l border-white/10 bg-gradient-to-b from-[#5B35F0]/95 via-[#4431C4]/95 to-[#1A1F33]/95',
            'shadow-[0_25px_80px_rgba(28,4,84,0.65)]'
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <Dialog.Title className="text-sm font-semibold uppercase tracking-[0.35em] text-white/60">
                Token Balance
              </Dialog.Title>
              <p className={clsx('text-2xl font-semibold text-white', isLoading && 'animate-pulse text-white/40')}>{tokenDisplay} {isLoading ? '' : 'tokens'}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
              aria-label="Close token drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 px-6 py-6 text-white">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Tier</span>
                <span className={clsx('rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/90', isLoading && 'animate-pulse text-transparent')}>{isLoading ? '•••' : tierLabel}</span>
              </div>
              <div className={clsx('mt-4 text-sm text-white/60', isLoading && 'animate-pulse text-transparent')}>{isLoading ? '•••' : formatRenewalDate(renewAt)}</div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/15"
                onClick={() => {
                  console.info('[TokenDrawer] Token top-ups coming soon.');
                }}
              >
                Top up tokens (coming soon)
              </button>
              <button
                type="button"
                className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/80 transition hover:bg-white/10"
                onClick={() => {
                  onManageMembership();
                }}
              >
                Manage membership
              </button>
            </div>

            <TokenHistoryMiniList loading={isLoading} />

            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
              <p className="font-semibold text-white">Need the full breakdown?</p>
              <p className="mt-1 text-white/70">View your complete token history, analytics, and CSV exports.</p>
              <Link
                to="/studio/usage"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-purple-200"
                onClick={() => onOpenChange(false)}
              >
                Go to usage →
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const TokenBalanceDrawer = memo(TokenBalanceDrawerComponent);

export default TokenBalanceDrawer;
