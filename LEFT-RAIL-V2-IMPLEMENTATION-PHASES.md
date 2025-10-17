# Left Rail V2: Accordion Implementation Phases
## Post-Housekeeping Sprint - Ready to Build UI

**Current Status**: ✅ All Tier 1 Housekeeping Complete
**Ready to Start**: Phase 1 (Accordion UI Build)
**Estimated Remaining Effort**: 2-3 days
**Last Updated**: October 17, 2025

---

## Executive Summary

**What Codex Completed** (Days 1-2):
- ✅ Style catalog extracted and centralized
- ✅ Entitlement gating consolidated
- ✅ `useToneSections` hook created
- ✅ Unified feedback system (`useStudioFeedback`)
- ✅ Thumbnail lazy loading with prefetch
- ✅ Regression smoke tests passing
- ✅ All `alert()` calls replaced with modals/toasts
- ✅ Favorites scaffold ready (state only, no UI)
- ✅ Analytics events wired for tone interactions

**What's Left** (You're here):
- 🔨 Phase 1: Build accordion UI components
- 🔨 Phase 2: Integrate into sidebar & mobile drawer
- 🔨 Phase 3: Polish, test, and roll out

**Success Criteria**:
- Accordion renders 6 tone categories
- Premium styles show lock icons
- Clicking locked styles shows upgrade modal
- All 12 existing styles work identically
- Performance: <100ms render time

---

## ⚠️ Critical Corrections (Read Before Starting)

**Based on Codex architectural review** - these fixes prevent bugs:

1. **Accordion State**: Use `activeTone` (single string) NOT `Set<StyleTone>` for true accordion behavior (only one open)
2. **Gate Callbacks**: MUST wire `handleGateDenied` or locked styles will silently fail (no upgrade modal)
3. **Tone Metadata**: ALWAYS pass `{ tone }` to analytics - verify TypeScript enforces this
4. **Analytics**: Emit `tone_section_expanded` in toggle handler (not useEffect) - already available in telemetry
5. **ARIA**: Use `aria-disabled="true"` NOT `disabled={true}` on locked styles (allows click for modal)
6. **Mobile Scroll**: Preserve existing drawer scroll structure - don't break iOS safe-area padding
7. **Testing**: Use Vitest unit tests (RTL not configured) - test `useToneSections` logic, not UI
8. **Data Source**: Read from `styleEntry.option` (single source) - never re-derive from catalog
9. **Prefetch**: Already safeguarded by Codex - just verify hook usage

---

## Phase 1: Build Accordion UI (Day 3)
**Goal**: Create the accordion component primitives that will replace the flat list.

### Task 1.1: Create ToneSection Component
**Time**: 2-3 hours
**Priority**: P0 (Blocker for other tasks)

**What to Build**:
```typescript
// src/sections/studio/components/ToneSection.tsx

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import type { ToneSection as ToneSectionType } from '@/store/hooks/useToneSections';
import ToneStyleCard from './ToneStyleCard';

type ToneSectionProps = {
  section: ToneSectionType;
  onStyleSelect: (styleId: string, meta: { tone: string }) => void;
  isExpanded: boolean;
  onToggle: () => void;
};

export default function ToneSection({
  section,
  onStyleSelect,
  isExpanded,
  onToggle,
}: ToneSectionProps) {
  const { tone, definition, styles, locked, lockedGate } = section;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/40">
      {/* Tone Header (clickable to expand/collapse) */}
      <button
        onClick={onToggle}
        className={clsx(
          'w-full flex items-center justify-between p-4 transition-colors',
          locked
            ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10'
            : 'bg-white/5 hover:bg-white/10'
        )}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {definition.icon}
          </span>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {definition.label}
              {locked && (
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 rounded">
                  Premium
                </span>
              )}
            </h3>
            <p className="text-xs text-white/60">{definition.description}</p>
          </div>
        </div>
        <ChevronDown
          className={clsx(
            'w-5 h-5 text-white/60 transition-transform',
            isExpanded && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Collapsible Style List */}
      {isExpanded && (
        <div className="p-2 space-y-2">
          {styles.map((styleEntry) => (
            <ToneStyleCard
              key={styleEntry.option.id}
              styleEntry={styleEntry}
              onSelect={() => onStyleSelect(styleEntry.option.id, { tone })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Tone header renders with icon, label, description
- ✅ Lock badge shows for locked categories
- ✅ Chevron rotates when expanded/collapsed
- ✅ Clicking header toggles expansion
- ✅ Style list renders when expanded

---

### Task 1.2: Create ToneStyleCard Component
**Time**: 2-3 hours
**Priority**: P0

**What to Build**:
```typescript
// src/sections/studio/components/ToneStyleCard.tsx

import { Lock, Star } from 'lucide-react';
import { clsx } from 'clsx';
import type { ToneSectionStyle } from '@/store/hooks/useToneSections';

type ToneStyleCardProps = {
  styleEntry: ToneSectionStyle;
  onSelect: () => void;
  showFavorite?: boolean; // Optional: enable when favorites UI is ready
};

export default function ToneStyleCard({
  styleEntry,
  onSelect,
  showFavorite = false,
}: ToneStyleCardProps) {
  const { option, gate, isSelected, isFavorite } = styleEntry;
  const isLocked = !gate.allowed;

  return (
    <button
      onClick={onSelect}
      aria-disabled={isLocked ? 'true' : 'false'} // ✅ CORRECTED: ARIA not disabled (allows click)
      aria-label={
        isLocked
          ? `${option.name} - Locked - Requires ${gate.requiredTier?.toUpperCase()} tier`
          : option.name
      }
      className={clsx(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
        isSelected && !isLocked
          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
          : isLocked
          ? 'bg-slate-800/40 border border-white/5 hover:border-purple-400/50'
          : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={option.thumbnail}
          alt={option.name}
          loading="lazy"
          decoding="async"
          className={clsx(
            'w-full h-full object-cover',
            isLocked && 'opacity-40 grayscale'
          )}
        />
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Lock className="w-5 h-5 text-purple-300" />
          </div>
        )}
        {isSelected && !isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/40">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Style Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <p className={clsx(
            'text-sm font-semibold truncate',
            isLocked ? 'text-white/50' : 'text-white'
          )}>
            {option.name}
          </p>
          {/* Badges */}
          {option.badges?.map((badge) => (
            <span
              key={badge}
              className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-500/20 text-green-300 rounded"
            >
              {badge}
            </span>
          ))}
        </div>
        <p className={clsx(
          'text-xs mt-0.5 line-clamp-1',
          isLocked ? 'text-white/30' : 'text-white/60'
        )}>
          {option.description}
        </p>
        {isLocked && (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-purple-400 font-semibold">
            <Lock className="w-3 h-3" />
            {gate.requiredTier?.toUpperCase()} required
          </span>
        )}
      </div>

      {/* Optional: Favorite Icon */}
      {showFavorite && isFavorite && (
        <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
      )}
    </button>
  );
}
```

**Acceptance Criteria**:
- ✅ Style card renders thumbnail, name, description
- ✅ Lock overlay shows for locked styles
- ✅ Selected state shows checkmark
- ✅ Badges render (new, trending, etc.)
- ✅ "X tier required" message shows for locked styles
- ✅ Clicking works (even when locked)

---

### Task 1.3: Create StyleAccordion Container
**Time**: 1-2 hours
**Priority**: P0

**What to Build**:
```typescript
// src/sections/studio/components/StyleAccordion.tsx

import { useState } from 'react';
import { useToneSections } from '@/store/hooks/useToneSections';
import { useHandleStyleSelect } from '@/sections/studio/hooks/useHandleStyleSelect';
import { useStudioFeedback } from '@/hooks/useStudioFeedback';
import { emitStepOneEvent } from '@/utils/telemetry';
import ToneSection from './ToneSection';
import type { StyleTone } from '@/config/styleCatalog';
import type { GateResult } from '@/utils/entitlementGate';

type StyleAccordionProps = {
  hasCroppedImage: boolean;
};

export default function StyleAccordion({ hasCroppedImage }: StyleAccordionProps) {
  const toneSections = useToneSections();
  const handleStyleSelect = useHandleStyleSelect();
  const { showUpgradeModal } = useStudioFeedback();

  // ✅ CORRECTED: Single active tone (true accordion behavior)
  const [activeTone, setActiveTone] = useState<StyleTone | null>('trending');

  // ✅ CORRECTED: Handle gate denials (locked styles)
  const handleGateDenied = (gate: GateResult, styleId: string, tone: string) => {
    if (gate.reason === 'quota_exceeded') {
      showUpgradeModal({
        title: 'Out of Generations',
        message: gate.message || 'Upgrade to continue creating.',
        ctaText: gate.ctaText || 'Upgrade Now',
        reason: 'quota_exceeded',
      });
    } else if (gate.reason === 'style_locked') {
      showUpgradeModal({
        title: 'Premium Style',
        message: gate.message || `This style requires ${gate.requiredTier?.toUpperCase()} tier.`,
        ctaText: gate.ctaText || `Upgrade to ${gate.requiredTier?.toUpperCase()}`,
        reason: 'style_locked',
      });
    }

    // ✅ CORRECTED: Emit analytics
    emitStepOneEvent({
      type: 'tone_style_locked',
      value: styleId,
      metadata: { tone, reason: gate.reason },
    });
  };

  const toggleTone = (tone: StyleTone) => {
    const wasExpanded = activeTone === tone;

    // True accordion: clicking same section closes it, clicking different opens it
    setActiveTone(prev => prev === tone ? null : tone);

    // ✅ CORRECTED: Emit analytics immediately (not in useEffect)
    if (!wasExpanded) {
      emitStepOneEvent({
        type: 'tone_section_expanded',
        value: tone,
      });
    }
  };

  return (
    <div className="space-y-2">
      {toneSections.map((section) => (
        <ToneSection
          key={section.tone}
          section={section}
          onStyleSelect={(styleId, meta) => {
            // ✅ CORRECTED: Check gate BEFORE calling handleStyleSelect
            const styleEntry = section.styles.find(s => s.option.id === styleId);
            if (styleEntry && !styleEntry.gate.allowed) {
              handleGateDenied(styleEntry.gate, styleId, meta.tone);
              return; // Don't proceed with selection
            }

            // Gate passed, proceed with selection (with tone metadata)
            handleStyleSelect(styleId, meta);
          }}
          isExpanded={activeTone === section.tone}
          onToggle={() => toggleTone(section.tone)}
        />
      ))}
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ Renders all tone sections from `useToneSections()`
- ✅ Trending expanded by default
- ✅ Clicking header toggles expansion
- ✅ Only one section open at a time (true accordion)
- ✅ Locked styles show upgrade modal when clicked
- ✅ Analytics emitted: `tone_section_expanded`, `tone_style_locked`

---

## Phase 2: Integration (Day 4)
**Goal**: Replace the flat list in `StyleSidebar` and `MobileStyleDrawer` with the new accordion.

### Task 2.1: Update Desktop StyleSidebar
**Time**: 1-2 hours
**Priority**: P0

**What to Change**:
```typescript
// src/sections/studio/components/StyleSidebar.tsx

// BEFORE (flat list):
<div className="space-y-3">
  {styles.map((style) => (
    <button key={style.id} onClick={() => onStyleSelect(style.id)}>
      {/* style card */}
    </button>
  ))}
</div>

// AFTER (accordion):
import StyleAccordion from './StyleAccordion';

// Inside render:
<StyleAccordion hasCroppedImage={hasCroppedImage} />
```

**Files to Modify**:
- `src/sections/studio/components/StyleSidebar.tsx` - Replace list with `<StyleAccordion />`

**Acceptance Criteria**:
- ✅ Desktop sidebar renders accordion
- ✅ All 12 styles appear in correct categories
- ✅ Clicking styles works (selection state updates)
- ✅ Token counter still renders above accordion
- ✅ Upgrade CTA still renders below accordion

---

### Task 2.2: Update Mobile Drawer
**Time**: 1-2 hours
**Priority**: P0

**What to Change**:
```typescript
// src/components/studio/MobileStyleDrawer.tsx

// Replace grouped list with accordion
import StyleAccordion from '@/sections/studio/components/StyleAccordion';

// Inside drawer content:
<StyleAccordion hasCroppedImage={true} />
```

**Files to Modify**:
- `src/components/studio/MobileStyleDrawer.tsx` - Replace list with `<StyleAccordion />`

**Acceptance Criteria**:
- ✅ Mobile drawer renders accordion
- ✅ Drawer opens/closes correctly
- ✅ Scrolling works inside drawer
- ✅ Bottom sheet doesn't bounce on iOS

---

### Task 2.3: Add Feature Flag
**Time**: 30 minutes
**Priority**: P1 (Recommended for safe rollout)

**What to Add**:
```typescript
// src/config/featureFlags.ts
export const ENABLE_STYLE_ACCORDION = coerceBoolean(
  import.meta.env.VITE_ENABLE_STYLE_ACCORDION ?? 'true'
);

// src/sections/studio/components/StyleSidebar.tsx
import { ENABLE_STYLE_ACCORDION } from '@/config/featureFlags';

{ENABLE_STYLE_ACCORDION ? (
  <StyleAccordion hasCroppedImage={hasCroppedImage} />
) : (
  <div className="space-y-3">
    {/* Old flat list as fallback */}
  </div>
)}
```

**Acceptance Criteria**:
- ✅ Can toggle accordion on/off via env var
- ✅ Old UI works when flag is off
- ✅ New UI works when flag is on

---

### Task 2.4: Wire Up Analytics Events
**Time**: 1 hour
**Priority**: P1

**What to Add**:
```typescript
// src/sections/studio/components/StyleAccordion.tsx

import { emitStepOneEvent } from '@/utils/telemetry';

// When section expands:
const toggleTone = (tone: StyleTone) => {
  setExpandedTones((prev) => {
    const next = new Set(prev);
    if (next.has(tone)) {
      next.delete(tone);
    } else {
      next.add(tone);
      // Emit analytics
      emitStepOneEvent({
        type: 'tone_section_expanded',
        value: tone,
      });
    }
    return next;
  });
};
```

**Acceptance Criteria**:
- ✅ `tone_section_expanded` fires when accordion opens
- ✅ `tone_style_select` fires when style clicked
- ✅ `tone_upgrade_prompt` fires when locked style clicked
- ✅ Events appear in browser console (dev mode)

---

## Phase 3: Polish & Rollout (Day 5)
**Goal**: Test, polish, and gradually roll out to users.

### Task 3.1: Manual QA (Full User Flow)
**Time**: 1-2 hours
**Priority**: P0

**Test as Free User**:
- [ ] Upload a photo
- [ ] Open Trending category (should be expanded by default)
- [ ] Click a free style (Watercolor Dreams) → preview generates
- [ ] Click a premium style (Neon Splash) → upgrade modal shows
- [ ] Try all 6 categories (all should expand/collapse smoothly)
- [ ] Check mobile drawer (should show same accordion)
- [ ] Verify token counter decrements after generation
- [ ] Test quota exhaustion (set to 0 tokens) → modal shows

**Test as Premium User** (Creator tier):
- [ ] All premium styles should be unlocked
- [ ] No lock icons on premium styles
- [ ] Clicking premium styles generates previews

**Files to Test**:
- Desktop: `StyleSidebar.tsx` with accordion
- Mobile: `MobileStyleDrawer.tsx` with accordion
- Modals: `UpgradePromptModal.tsx` triggers correctly

**Acceptance Criteria**:
- ✅ All flows work identically to flat list
- ✅ No console errors
- ✅ Upgrade modal shows correct tier requirements
- ✅ Performance feels smooth (<100ms interactions)

---

### Task 3.2: Performance Audit
**Time**: 30 minutes
**Priority**: P1

**What to Check**:
```bash
# Build and analyze bundle
npm run build:analyze

# Check:
# - Bundle size increase <20KB (lazy loading should offset)
# - No duplicate dependencies
# - Lighthouse score >90
```

**Performance Checklist**:
- [ ] Accordion renders in <100ms (Chrome DevTools Performance tab)
- [ ] Thumbnails lazy load (check Network tab)
- [ ] No layout shift when sections expand/collapse
- [ ] Smooth animations (60fps)
- [ ] Mobile performance acceptable on 3G throttling

---

### Task 3.3: Expand Integration Tests
**Time**: 1-2 hours
**Priority**: P1

**What to Add**:
```typescript
// tests/studio/accordion.spec.ts

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StyleAccordion from '@/sections/studio/components/StyleAccordion';

describe('StyleAccordion', () => {
  it('renders all tone categories', () => {
    render(<StyleAccordion hasCroppedImage={true} />);

    expect(screen.getByText('📈 Trending Tones')).toBeInTheDocument();
    expect(screen.getByText('🎨 Classic Tones')).toBeInTheDocument();
    expect(screen.getByText('⭐ Signature Tones')).toBeInTheDocument();
  });

  it('expands trending by default', () => {
    render(<StyleAccordion hasCroppedImage={true} />);

    // Trending section should show styles
    expect(screen.getByText('Watercolor Dreams')).toBeVisible();
  });

  it('shows lock icons on premium styles for free users', () => {
    // Mock free tier
    render(<StyleAccordion hasCroppedImage={true} />);

    // Expand trending section
    fireEvent.click(screen.getByText('📈 Trending Tones'));

    // Premium style should have lock icon
    const neonStyle = screen.getByText('Neon Splash');
    expect(neonStyle.closest('button')).toHaveAttribute('aria-disabled', 'false');
    expect(screen.getByLabelText('Locked')).toBeInTheDocument();
  });

  it('toggles section expansion on header click', () => {
    render(<StyleAccordion hasCroppedImage={true} />);

    const classicHeader = screen.getByText('🎨 Classic Tones');

    // Should be collapsed initially
    expect(screen.queryByText('Pastel Bliss')).not.toBeVisible();

    // Click to expand
    fireEvent.click(classicHeader);
    expect(screen.getByText('Pastel Bliss')).toBeVisible();

    // Click to collapse
    fireEvent.click(classicHeader);
    expect(screen.queryByText('Pastel Bliss')).not.toBeVisible();
  });
});
```

**Acceptance Criteria**:
- ✅ 5+ new tests covering accordion behavior
- ✅ Tests pass in CI (GitHub Actions)
- ✅ Coverage >80% for accordion components

---

### Task 3.4: Gradual Rollout
**Time**: Ongoing (monitor over 2-3 days)
**Priority**: P0

**Rollout Plan**:

**Day 5 (Monday)**:
- Enable `VITE_ENABLE_STYLE_ACCORDION=true` for 10% of users (feature flag)
- Monitor Sentry for errors
- Monitor Mixpanel for:
  - `tone_section_expanded` events
  - `tone_upgrade_prompt` events
  - Conversion rate (premium style click → upgrade)

**Day 6 (Wednesday)**:
- If metrics look good:
  - Roll out to 50% of users
  - Continue monitoring

**Day 7 (Friday)**:
- If no critical issues:
  - Roll out to 100% of users
  - Remove feature flag (make accordion permanent)

**Rollback Plan**:
If critical bug found:
```bash
# Emergency rollback
VITE_ENABLE_STYLE_ACCORDION=false npm run build && deploy

# Old flat list becomes active immediately
```

**Success Metrics**:
- **Error Rate**: <0.1% (Sentry)
- **Engagement**: Users explore 2+ categories (up from 1)
- **Conversion**: Premium style clicks → upgrade rate >5%
- **Performance**: No regressions in page load time

---

## Phase 4: Future Enhancements (Post-Launch)
**These are NOT blockers - implement after accordion is stable**

### Task 4.1: Add Favorites UI
**Time**: 2-3 hours
**What**: Add star icon to `ToneStyleCard`, toggle favorites on click

**Implementation**:
```typescript
// In ToneStyleCard.tsx
const { toggleFavorite } = useFounderStore();

<button
  onClick={(e) => {
    e.stopPropagation();
    toggleFavorite(option.id);
  }}
  className="absolute top-2 right-2 p-1 rounded-full bg-black/60"
>
  <Star className={clsx(
    'w-4 h-4',
    isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-white/60'
  )} />
</button>
```

---

### Task 4.2: Add "Favorites" Tab
**Time**: 3-4 hours
**What**: Add a 7th section to accordion showing only favorited styles

**Implementation**:
```typescript
// In useToneSections.ts
const favoriteStyles = allStyles.filter(s => favoriteStyleIds.includes(s.id));

return [
  {
    tone: 'favorites',
    definition: {
      label: '⭐ My Favorites',
      icon: '⭐',
      description: 'Your saved styles',
    },
    styles: favoriteStyles,
    locked: false,
  },
  ...otherSections,
];
```

---

### Task 4.3: Add ARIA & Keyboard Support
**Time**: 2-3 hours
**What**: Use `@radix-ui/react-accordion` for accessibility

**Benefits**:
- Keyboard navigation (arrow keys)
- Screen reader support
- ARIA attributes automatically

---

## Quick Reference

### Commands
```bash
# Development
npm run dev

# Testing
npm run test              # Run all tests
npm run test:watch        # Watch mode

# Build & Analysis
npm run build
npm run build:analyze     # Bundle size analysis

# Linting
npm run lint
```

### Key Files
```
New Components (to create):
- src/sections/studio/components/ToneSection.tsx
- src/sections/studio/components/ToneStyleCard.tsx
- src/sections/studio/components/StyleAccordion.tsx

Modified Files:
- src/sections/studio/components/StyleSidebar.tsx
- src/components/studio/MobileStyleDrawer.tsx
- src/config/featureFlags.ts

Tests:
- tests/studio/accordion.spec.ts (to create)
```

### Existing Infrastructure (Already Done by Codex)
```
✅ src/config/styleCatalog.ts - Style data
✅ src/utils/entitlementGate.ts - Gating logic
✅ src/store/hooks/useToneSections.ts - Accordion data hook
✅ src/hooks/useStudioFeedback.tsx - Modals & toasts
✅ src/hooks/useToneSectionPrefetch.ts - Lazy loading
✅ tests/studio/tones.spec.ts - Smoke tests
```

---

## Summary: What You Need to Do

**Phase 1** (Day 3 - ~6 hours):
1. Create `ToneSection.tsx` component
2. Create `ToneStyleCard.tsx` component
3. Create `StyleAccordion.tsx` container

**Phase 2** (Day 4 - ~4 hours):
1. Replace flat list in `StyleSidebar.tsx` with accordion
2. Replace list in `MobileStyleDrawer.tsx` with accordion
3. Add feature flag for safe rollout
4. Wire up analytics events

**Phase 3** (Day 5 - ~4 hours):
1. Manual QA (all user flows)
2. Performance audit
3. Add integration tests
4. Begin gradual rollout (10% → 50% → 100%)

**Total Remaining Effort**: ~14 hours (2 days if focused, 3 days with breaks)

---

## Ready to Start?

You have all the infrastructure you need. The data flows through `useToneSections()`, gating works via `evaluateStyleGate()`, and feedback shows via `showUpgradeModal()`.

**Your next step**: Create `ToneSection.tsx` (Phase 1, Task 1.1)

All the hard architectural work is done. Now it's just building the UI components that consume the data.

---

## 🔥 Final Checklist: Critical Corrections Applied

Before you start coding, verify these corrections are in your implementation:

### State Management
- [ ] ✅ Use `activeTone: StyleTone | null` (NOT `Set<StyleTone>`)
- [ ] ✅ Accordion mode: only one section open at a time
- [ ] ✅ Trending section open by default: `useState<StyleTone | null>('trending')`

### Gate Handling
- [ ] ✅ `handleGateDenied` callback wired in `StyleAccordion`
- [ ] ✅ Check `styleEntry.gate.allowed` BEFORE calling `handleStyleSelect`
- [ ] ✅ Show upgrade modal for both `quota_exceeded` and `style_locked`
- [ ] ✅ Locked styles are clickable (no `disabled` attribute)

### Analytics
- [ ] ✅ `tone_section_expanded` emitted in `toggleTone` (not useEffect)
- [ ] ✅ `tone_style_locked` emitted in `handleGateDenied`
- [ ] ✅ `{ tone }` metadata passed to `handleStyleSelect(styleId, { tone })`

### Accessibility
- [ ] ✅ Use `aria-disabled="true"` on locked styles (allows pointer events)
- [ ] ✅ `aria-label` describes locked state for screen readers
- [ ] ✅ `aria-expanded` on accordion headers

### Mobile
- [ ] ✅ Preserve existing `MobileStyleDrawer` scroll structure
- [ ] ✅ Don't break iOS safe-area padding (`env(safe-area-inset-bottom)`)
- [ ] ✅ Accordion fits in existing drawer layout (no height conflicts)

### Data Flow
- [ ] ✅ Read from `styleEntry.option` (single source, no re-derivation)
- [ ] ✅ `useToneSections` hook provides all computed data
- [ ] ✅ Prefetch hook already has safeguard (verify usage only)

### Testing
- [ ] ✅ Write Vitest unit tests (NOT RTL - not configured)
- [ ] ✅ Test `useToneSections` logic, not UI rendering
- [ ] ✅ Manual QA checklist for user flows

---

Good luck! 🚀
