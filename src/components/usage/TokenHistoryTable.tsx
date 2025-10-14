import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

// Mock data - in production, this would come from the preview_logs table
type PreviewLog = {
  id: string;
  createdAt: string;
  styleId: string;
  styleName: string;
  orientation: string;
  tokensSpent: number;
  outcome: 'success' | 'error' | 'pending';
  previewUrl?: string;
};

const MOCK_HISTORY: PreviewLog[] = [
  {
    id: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    styleId: 'classic-oil-painting',
    styleName: 'Classic Oil Painting',
    orientation: 'square',
    tokensSpent: 1,
    outcome: 'success',
    previewUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
  },
  {
    id: '2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    styleId: 'watercolor-dreams',
    styleName: 'Watercolor Dreams',
    orientation: 'horizontal',
    tokensSpent: 1,
    outcome: 'success',
    previewUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400',
  },
  {
    id: '3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    styleId: '3d-storybook',
    styleName: '3D Storybook',
    orientation: 'vertical',
    tokensSpent: 1,
    outcome: 'error',
  },
];

const TokenHistoryTable = () => {
  const [sortBy, setSortBy] = useState<'date' | 'tokens'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'success' | 'error'>('all');

  const sortedHistory = useMemo(() => {
    let filtered = MOCK_HISTORY;

    // Filter by outcome
    if (filterOutcome !== 'all') {
      filtered = filtered.filter((log) => log.outcome === filterOutcome);
    }

    // Sort
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        comparison = a.tokensSpent - b.tokensSpent;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sortBy, sortOrder, filterOutcome]);

  const toggleSort = (column: 'date' | 'tokens') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const OutcomeIcon = ({ outcome }: { outcome: string }) => {
    switch (outcome) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
      {/* Filters */}
      <div className="border-b border-white/10 bg-white/5 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>
          <div className="flex gap-2">
            {(['all', 'success', 'error'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterOutcome(filter)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  filterOutcome === filter
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th
                className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/50 transition hover:text-white"
                onClick={() => toggleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Date
                  {sortBy === 'date' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/50">
                Style
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/50">
                Preview
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/50">
                Orientation
              </th>
              <th
                className="cursor-pointer px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/50 transition hover:text-white"
                onClick={() => toggleSort('tokens')}
              >
                <div className="flex items-center gap-2">
                  Tokens
                  {sortBy === 'tokens' &&
                    (sortOrder === 'asc' ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white/50">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedHistory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-white/50">
                  No preview history found
                </td>
              </tr>
            ) : (
              sortedHistory.map((log) => (
                <tr key={log.id} className="transition hover:bg-white/5">
                  <td className="px-6 py-4 text-sm text-white/70">{formatDate(log.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{log.styleName}</td>
                  <td className="px-6 py-4">
                    {log.previewUrl ? (
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-white/10">
                        <img src={log.previewUrl} alt={log.styleName} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg border border-white/10 bg-white/5" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-white/70">
                      {log.orientation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-purple-300">−{log.tokensSpent}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <OutcomeIcon outcome={log.outcome} />
                      <span className="text-xs font-medium capitalize text-white/70">{log.outcome}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="border-t border-white/10 bg-white/5 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Showing {sortedHistory.length} of {MOCK_HISTORY.length} generations</span>
          <div className="flex gap-2">
            <button className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:bg-white/5" disabled>
              Previous
            </button>
            <button className="rounded-lg border border-white/10 px-3 py-1.5 transition hover:bg-white/5" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenHistoryTable;
