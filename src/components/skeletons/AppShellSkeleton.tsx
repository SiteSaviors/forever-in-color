import type { ReactElement } from 'react';

type AppShellSkeletonProps = {
  label?: string;
};

const baseStyles =
  'min-h-screen w-full bg-slate-950 text-white flex items-center justify-center px-6 py-24';

const AppShellSkeleton = ({ label = 'Loading Wondertone…' }: AppShellSkeletonProps): ReactElement => {
  return (
    <div className={baseStyles} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
        <p className="text-sm font-medium tracking-[0.28em] uppercase text-white/60">{label}</p>
      </div>
    </div>
  );
};

export default AppShellSkeleton;

