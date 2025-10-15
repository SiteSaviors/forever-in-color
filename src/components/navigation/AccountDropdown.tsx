import { Suspense } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

type AccountDropdownProps = {
  accountInitial: string;
  sessionHydrated: boolean;
  isAuthenticated: boolean;
  userEmail: string;
  tierLabel: string;
  remainingTokenDisplay: string;
  onNavigate: (path: string) => void;
  onOpenAuthModal: (mode: 'signin' | 'signup') => void;
  onSignOut: () => Promise<void> | void;
  canUpgrade: boolean;
};

const AccountButton = ({
  accountInitial,
  label,
}: {
  accountInitial: string;
  label: string;
}) => (
  <button
    type="button"
    className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-white transition-all duration-200 hover:scale-105 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/80"
    aria-label={label}
  >
    <span className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-purple-500/40 via-indigo-500/40 to-blue-500/40 text-sm font-semibold text-white">
      {accountInitial}
    </span>
  </button>
);

const AccountDropdown = ({
  accountInitial,
  sessionHydrated,
  isAuthenticated,
  userEmail,
  tierLabel,
  remainingTokenDisplay,
  onNavigate,
  onOpenAuthModal,
  onSignOut,
  canUpgrade,
}: AccountDropdownProps) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <AccountButton
        accountInitial={accountInitial}
        label={isAuthenticated ? 'Account menu' : 'Sign in'}
      />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content
      sideOffset={12}
      align="end"
      className="z-50 w-64 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-[0_25px_80px_rgba(76,29,149,0.45)] backdrop-blur-xl"
    >
      <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
        {sessionHydrated ? (isAuthenticated ? 'Signed In' : 'Guest Mode') : 'Loading…'}
      </DropdownMenu.Label>
      <div className="space-y-2 px-3 pb-3 text-sm text-white/80">
        {isAuthenticated ? (
          <>
            <p className="font-semibold text-white">{userEmail}</p>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Tier</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/70">
                {tierLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Tokens left</span>
              <span>{remainingTokenDisplay}</span>
            </div>
          </>
        ) : (
          <p className="text-white/60">
            Sign in to sync your creations, unlock more tokens, and pick up where you left off.
          </p>
        )}
      </div>
      <DropdownMenu.Separator className="my-2 h-px bg-white/10" />
      {sessionHydrated ? (
        isAuthenticated ? (
          <>
            <DropdownMenu.Item
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              onSelect={(event) => {
                event.preventDefault();
                onNavigate('/studio/gallery');
              }}
            >
              My Gallery
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              onSelect={(event) => {
                event.preventDefault();
                onNavigate('/studio/usage');
              }}
            >
              Token History
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              onSelect={(event) => {
                event.preventDefault();
                void onSignOut();
              }}
            >
              Sign out
            </DropdownMenu.Item>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <DropdownMenu.Item
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              onSelect={(event) => {
                event.preventDefault();
                onOpenAuthModal('signin');
              }}
            >
              Sign in
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              onSelect={(event) => {
                event.preventDefault();
                onOpenAuthModal('signup');
              }}
            >
              Create account
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              onSelect={(event) => {
                event.preventDefault();
                onNavigate('/pricing');
              }}
            >
              Explore plans
            </DropdownMenu.Item>
          </div>
        )
      ) : (
        <p className="px-3 py-2 text-center text-xs text-white/50">Preparing your studio…</p>
      )}
      {isAuthenticated && canUpgrade && (
        <div className="mt-2 px-3">
          <button
            type="button"
            onClick={() => onNavigate('/pricing')}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Upgrade membership
          </button>
        </div>
      )}
    </DropdownMenu.Content>
  </DropdownMenu.Root>
);

export { AccountButton };
export type { AccountDropdownProps };

const AccountDropdownWrapper = (props: AccountDropdownProps) => (
  <Suspense
    fallback={
      <AccountButton
        accountInitial={props.accountInitial}
        label={props.isAuthenticated ? 'Account menu' : 'Sign in'}
      />
    }
  >
    <AccountDropdown {...props} />
  </Suspense>
);

export default AccountDropdownWrapper;
