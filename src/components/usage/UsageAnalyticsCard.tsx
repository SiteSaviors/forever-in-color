import { useMemo } from 'react';
import { TrendingUp, Calendar, Zap } from 'lucide-react';

type UsageAnalyticsCardProps = {
  remainingTokens: number | null;
  quota: number | null;
  renewAt: string | null;
};

const UsageAnalyticsCard = ({ remainingTokens, quota, renewAt }: UsageAnalyticsCardProps) => {
  const tokensUsed = useMemo(() => {
    if (remainingTokens == null || quota == null) return 0;
    return Math.max(0, quota - remainingTokens);
  }, [remainingTokens, quota]);

  const usagePercentage = useMemo(() => {
    if (quota == null || quota === 0) return 0;
    return Math.min(100, (tokensUsed / quota) * 100);
  }, [tokensUsed, quota]);

  const daysUntilRenew = useMemo(() => {
    if (!renewAt) return null;
    const now = new Date();
    const renewDate = new Date(renewAt);
    const diffTime = renewDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  }, [renewAt]);

  const getProgressColor = () => {
    if (usagePercentage < 50) return 'from-emerald-500 to-teal-500';
    if (usagePercentage < 80) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Usage Overview</h2>
        <p className="text-sm text-white/60">Track your token consumption this period</p>
      </div>

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Tokens Used */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-400/40">
                <Zap className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Tokens Used</p>
                <p className="text-2xl font-bold text-white">{tokensUsed}</p>
              </div>
            </div>
          </div>

          {/* Tokens Remaining */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-400/40">
                <TrendingUp className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Remaining</p>
                <p className="text-2xl font-bold text-white">
                  {remainingTokens == null ? '∞' : remainingTokens}
                </p>
              </div>
            </div>
          </div>

          {/* Days Until Renew */}
          {daysUntilRenew !== null && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/40">
                  <Calendar className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Renews In</p>
                  <p className="text-2xl font-bold text-white">
                    {daysUntilRenew} day{daysUntilRenew !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Usage Progress</span>
            <span className="text-sm text-white/60">
              {tokensUsed} / {quota == null ? '∞' : quota} tokens
            </span>
          </div>
          <div className="relative h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${usagePercentage}%` }}
            />
            {/* Glow effect */}
            <div
              className={`absolute inset-y-0 left-0 h-full bg-gradient-to-r ${getProgressColor()} opacity-50 blur-md transition-all duration-500`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <div className="mt-2 text-center text-xs text-white/50">
            {usagePercentage.toFixed(1)}% of quota used
          </div>
        </div>

        {/* Mock Chart Placeholder */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Usage Trend (Last 30 Days)</h3>
          <div className="flex h-32 items-end justify-between gap-2">
            {[...Array(7)].map((_, i) => {
              const height = Math.random() * 100;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full overflow-hidden rounded-t-lg bg-white/10">
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40">Day {i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageAnalyticsCard;
