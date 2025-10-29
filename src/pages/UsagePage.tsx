import { useState } from 'react';
import { ArrowLeft, Download, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEntitlementsState } from '@/store/hooks/useEntitlementsStore';
import { useSessionState } from '@/store/hooks/useSessionStore';
import TokenHistoryTable from '@/components/usage/TokenHistoryTable';
import UsageAnalyticsCard from '@/components/usage/UsageAnalyticsCard';
import TierRecommendation from '@/components/usage/TierRecommendation';

const UsagePage = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'analytics'>('history');
  const { entitlements } = useEntitlementsState();
  const { sessionUser } = useSessionState();

  const tierLabel = entitlements.tier.charAt(0).toUpperCase() + entitlements.tier.slice(1);
  const remainingDisplay = entitlements.remainingTokens == null ? '∞' : entitlements.remainingTokens;
  const quotaDisplay = entitlements.quota == null ? '∞' : entitlements.quota;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/create"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Token Usage</h1>
                <p className="text-sm text-white/60">
                  Track your generation history and usage patterns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-white/50">Current Tier</p>
                    <p className="text-sm font-semibold text-white">{tierLabel}</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="text-right">
                    <p className="text-xs text-white/50">Tokens</p>
                    <p className="text-sm font-semibold text-white">
                      {remainingDisplay} / {quotaDisplay}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'history'
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {activeTab === 'history' ? (
          <div className="space-y-6">
            {/* Export Button */}
            <div className="flex justify-end">
              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            {/* Token History Table */}
            <TokenHistoryTable />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Usage Analytics */}
            <UsageAnalyticsCard
              remainingTokens={entitlements.remainingTokens}
              quota={entitlements.quota}
              renewAt={entitlements.renewAt}
            />

            {/* Tier Recommendation */}
            {sessionUser && <TierRecommendation currentTier={entitlements.tier} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsagePage;
