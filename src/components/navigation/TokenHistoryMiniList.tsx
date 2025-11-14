import { memo, useMemo } from 'react';
import { clsx } from 'clsx';

type TokenHistoryEntry = {
  id: string;
  createdAt: string;
  styleName: string;
  tokensSpent: number;
  outcome: 'success' | 'error' | 'pending';
};

// TODO: Replace with real token history fetch (reuse TokenHistoryTable data).
const MOCK_HISTORY: TokenHistoryEntry[] = [
  {
    id: 'history-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    styleName: 'Classic Oil Painting',
    tokensSpent: 1,
    outcome: 'success',
  },
  {
    id: 'history-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    styleName: 'Watercolor Dreams',
    tokensSpent: 1,
    outcome: 'success',
  },
  {
    id: 'history-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    styleName: 'Neon Bloom',
    tokensSpent: 1,
    outcome: 'pending',
  },
];

const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const statusColor = {
  success: 'text-emerald-300',
  error: 'text-rose-300',
  pending: 'text-amber-300',
} as const;

const TokenHistoryMiniListComponent = ({ loading = false }: { loading?: boolean }) => {
  const recentEntries = useMemo(() => MOCK_HISTORY.slice(0, 2), []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded-lg bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded-lg bg-white/10" />
            <div className="h-3 w-2/3 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!recentEntries.length) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/70">
        No recent generations yet.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5">
      <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-white/50">
        Recent Generations
      </div>
      <ul className="divide-y divide-white/10">
        {recentEntries.map((entry) => (
          <li key={entry.id} className="px-4 py-3 text-sm text-white/80">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{entry.styleName}</span>
              <span className="text-white/60">−{entry.tokensSpent}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-white/50">
              <span>{formatRelativeTime(entry.createdAt)}</span>
              <span className={clsx('font-semibold uppercase', statusColor[entry.outcome])}>{entry.outcome}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TokenHistoryMiniList = memo(TokenHistoryMiniListComponent);

export default TokenHistoryMiniList;
