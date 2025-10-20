import type { ReactElement } from 'react';

const StudioShellSkeleton = (): ReactElement => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <div className="h-6 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="grid h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="hidden h-full border-r border-white/10 lg:block">
          <div className="h-full w-full animate-pulse bg-white/5" />
        </div>
        <div className="flex h-full flex-col">
          <div className="flex-1 animate-pulse bg-white/5" />
          <div className="border-t border-white/10 px-6 py-4">
            <div className="mx-auto h-10 w-full max-w-sm animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioShellSkeleton;

