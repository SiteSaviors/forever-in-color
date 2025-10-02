import { memo } from "react";

const RouteSuspenseFallback = memo(() => {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-purple-900 text-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-white/40" />
          <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Wondertone</p>
          <p className="text-lg font-semibold">Preparing your premium canvas experience…</p>
        </div>
      </div>
    </div>
  );
});

RouteSuspenseFallback.displayName = "RouteSuspenseFallback";

export default RouteSuspenseFallback;
