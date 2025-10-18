import { clsx } from 'clsx';

type StudioEmptyStateProps = {
  onUpload: () => void;
  onBrowseStyles: () => void;
  launchflowOpen: boolean;
};

const StudioEmptyState = ({ onUpload, onBrowseStyles, launchflowOpen }: StudioEmptyStateProps) => (
  <div className="absolute inset-0 flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
    <div className="relative w-full max-w-[420px] sm:max-w-xl overflow-hidden rounded-[2.5rem] border-2 border-dashed border-white/15 bg-slate-950/70 px-6 py-10 text-center shadow-[0_32px_120px_rgba(35,48,94,0.55)] backdrop-blur-xl sm:px-8 sm:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_60%)] opacity-75" />
      <div className="relative space-y-5 sm:space-y-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-glow-purple sm:h-16 sm:w-16">
          <svg className="h-6 w-6 text-white sm:h-8 sm:w-8" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} fill="none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M12 4v9" />
          </svg>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white sm:text-2xl">Upload your photo to preview here</h3>
          <p className="text-sm text-white/70 sm:text-base">
            Launchflow expands inline so you can crop smartly without losing sight of the configurator.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onUpload}
            disabled={launchflowOpen}
            className={clsx(
              'rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
              launchflowOpen
                ? 'cursor-default bg-white/15 text-white/70'
                : 'bg-gradient-cta text-white shadow-glow-purple hover:shadow-glow-purple'
            )}
          >
            {launchflowOpen ? 'Launchflow open…' : 'Upload photo'}
          </button>
          <button
            type="button"
            onClick={onBrowseStyles}
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Browse styles first
          </button>
        </div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">
          No demo previews • Your photo leads the canvas
        </p>
      </div>
    </div>
  </div>
);

export default StudioEmptyState;
