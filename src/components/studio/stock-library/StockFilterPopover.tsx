import { useMemo, useState, useId } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, Filter } from 'lucide-react';
import { useFounderStore } from '@/store/useFounderStore';

const FILTER_ICON_CLASSES =
  'rounded-full border border-white/15 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60 p-2.5 text-white/80 shadow-[0_10px_30px_rgba(2,6,23,0.35)] backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.3),0_10px_30px_rgba(2,6,23,0.35)] hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

const ToggleChip = ({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) => {
  const inputId = useId();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggle();
  };

  return (
    <label
      htmlFor={inputId}
      className="group relative inline-flex cursor-pointer rounded-full bg-gradient-to-r from-fuchsia-500/60 via-purple-500/60 to-cyan-400/60 p-[1px] transition-all duration-200 hover:from-fuchsia-500/80 hover:via-purple-500/80 hover:to-cyan-400/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-fuchsia-300/70 focus-within:ring-offset-2 focus-within:ring-offset-slate-950 active:scale-95"
      onClick={handleClick}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={active}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
      />
      <span
        className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          active
            ? 'bg-slate-950/90 text-white shadow-[0_6px_20px_rgba(120,80,255,0.25)]'
            : 'bg-slate-900/70 text-white/55 group-hover:bg-slate-900/80 group-hover:text-white/80'
        }`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
            active
              ? 'border-transparent bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
              : 'border-white/30 bg-transparent text-transparent group-hover:border-white/50'
          }`}
          aria-hidden="true"
        >
          {active && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
        <span className="font-poppins text-left leading-tight">{label}</span>
      </span>
    </label>
  );
};

const StockFilterPopover = () => {
  const [open, setOpen] = useState(false);
  const accessFilters = useFounderStore((state) => state.accessFilters);
  const orientationFilters = useFounderStore((state) => state.orientationFilters);
  const toggleAccess = useFounderStore((state) => state.toggleAccessFilter);
  const toggleOrientation = useFounderStore((state) => state.toggleOrientationFilter);
  const resetFilters = useFounderStore((state) => state.resetFilters);
  const hasActiveFilters = useFounderStore((state) => state.hasActiveFilters());

  const badgeCount = useMemo(() => {
    const accessDisabled = Object.values(accessFilters).filter((value) => !value).length;
    const orientationDisabled = Object.values(orientationFilters).filter((value) => !value).length;
    return accessDisabled + orientationDisabled;
  }, [accessFilters, orientationFilters]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className={`relative ${FILTER_ICON_CLASSES}`} aria-label="Filter stock images">
          <Filter className="h-5 w-5" />
          {badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
              {badgeCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={12}
          className="z-[100] focus:outline-none"
          collisionPadding={16}
          onInteractOutside={(e) => {
            // Only close on true outside clicks (not clicks within the popover content)
            const target = e.target as HTMLElement;
            if (target.closest('[data-radix-popper-content-wrapper]')) {
              e.preventDefault();
            }
          }}
        >
          <div
            className="w-[280px] rounded-3xl border-2 border-white/15 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.3),_rgba(2,6,23,0.95))] p-4 shadow-[0_25px_60px_rgba(4,7,29,0.65)] backdrop-blur-xl pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="space-y-4 text-sm text-white/80">
              {/* Access Section */}
              <div>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Access</p>
                <div className="flex flex-wrap gap-2">
                  <ToggleChip label="Free" active={accessFilters.free} onToggle={() => toggleAccess('free')} />
                  <ToggleChip
                    label="Premium"
                    active={accessFilters.premium}
                    onToggle={() => toggleAccess('premium')}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Orientation Section */}
              <div>
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Orientation</p>
                <div className="flex flex-wrap gap-2">
                  <ToggleChip
                    label="Portrait"
                    active={orientationFilters.vertical}
                    onToggle={() => toggleOrientation('vertical')}
                  />
                  <ToggleChip
                    label="Horizontal"
                    active={orientationFilters.horizontal}
                    onToggle={() => toggleOrientation('horizontal')}
                  />
                  <ToggleChip
                    label="Square"
                    active={orientationFilters.square}
                    onToggle={() => toggleOrientation('square')}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Reset Button */}
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setOpen(false);
                }}
                className={`w-full rounded-full border px-4 py-2.5 text-sm font-poppins font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  hasActiveFilters
                    ? 'border-white/30 text-white hover:border-white/60 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'border-white/10 text-white/40 cursor-not-allowed'
                }`}
                disabled={!hasActiveFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
          <Popover.Arrow className="z-[90] fill-slate-900/80" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default StockFilterPopover;
