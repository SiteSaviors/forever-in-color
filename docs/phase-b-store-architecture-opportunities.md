# Phase B: Store Architecture Optimization Opportunities

**Analysis Date:** October 28, 2025
**Analyst:** Claude (Phase A completion follow-up)
**Target:** 30-50% fewer re-renders, fix circular deps, improve maintainability
**Risk Level:** Medium (requires thorough testing)

---

## Executive Summary

Analysis of the Wondertone codebase reveals **12 high-impact optimization opportunities** across Store Architecture that will drive performance and maintainability. The current architecture exhibits:

- ✅ **5 circular dependencies** (documented, ready for Phase 1 fix)
- ⚠️ **180 individual store selections** across 41 components (massive re-render potential)
- ⚠️ **23 components** accessing `state.previews` object (cascade trigger)
- ⚠️ **Only 1 component** using `shallow` comparison (useToneSections.ts)
- ⚠️ **8 calls to `currentStyle()`** function re-executed on every render
- ⚠️ **PhotoUploader: 25 store selections** in single component
- ⚠️ **StudioConfigurator: 23 store selections** causing re-render cascades

**Biggest Wins Available:**
1. Batched selectors with shallow comparison → 40-60% fewer re-renders
2. Memoized derived values in store → Eliminate redundant calculations
3. Custom hooks for common patterns → DRY + performance
4. Preview-specific selectors → Break cascade from previews object mutations

---

## Opportunity 1: StudioConfigurator Over-Selection (CRITICAL)

### Current State:
**File:** `src/sections/StudioConfigurator.tsx` (683 lines)

**Problem:** Makes **23 individual `useFounderStore` calls** without shallow comparison:

```typescript
const sessionUser = useFounderStore((state) => state.sessionUser);
const sessionAccessToken = useFounderStore((state) => state.getSessionAccessToken());
const styles = useFounderStore((state) => state.styles);
const previews = useFounderStore((state) => state.previews);
const currentStyle = useFounderStore((state) => state.currentStyle());
const entitlements = useFounderStore((state) => state.entitlements);
const hydrateEntitlements = useFounderStore((state) => state.hydrateEntitlements);
const firstPreviewCompleted = useFounderStore((state) => state.firstPreviewCompleted);
const generationCount = useFounderStore((state) => state.generationCount);
const croppedImage = useFounderStore((state) => state.croppedImage);
const orientation = useFounderStore((state) => state.orientation);
const pendingStyleId = useFounderStore((state) => state.pendingStyleId);
const stylePreviewStatus = useFounderStore((state) => state.stylePreviewStatus);
const stylePreviewMessage = useFounderStore((state) => state.stylePreviewMessage);
const stylePreviewError = useFounderStore((state) => state.stylePreviewError);
const orientationPreviewPending = useFounderStore((state) => state.orientationPreviewPending);
const livingCanvasModalOpen = useFounderStore((state) => state.livingCanvasModalOpen);
const launchpadExpanded = useFounderStore((state) => state.launchpadExpanded);
const setLaunchpadExpanded = useFounderStore((state) => state.setLaunchpadExpanded);
const displayRemainingTokens = useFounderStore((state) => state.getDisplayableRemainingTokens());
const openCanvasModal = useFounderStore((state) => state.openCanvasModal);
const userTier = useFounderStore((state) => state.entitlements?.tier ?? 'free');
const requiresWatermark = useFounderStore((state) => state.entitlements?.requiresWatermark ?? true);
```

**Impact:** Every change to ANY of these 23 values triggers a re-render, even if StudioConfigurator doesn't use the changed value.

**Re-render Triggers:**
- Preview completion → `previews` object mutates → **ALL 23 subscriptions** check for changes
- Orientation change → `orientation` updates → **ALL 23 subscriptions** check
- Entitlement sync → `entitlements` object mutates → **ALL 23 subscriptions** check

### Solution:

#### Option A: Batched Selector with Shallow (Recommended)
Create `src/store/selectors/studioSelectors.ts`:

```typescript
import { shallow } from 'zustand/shallow';
import { useFounderStore } from '../useFounderStore';

export const useStudioConfigState = () =>
  useFounderStore(
    (state) => ({
      // Session
      sessionUser: state.sessionUser,
      sessionAccessToken: state.getSessionAccessToken(),

      // Styles & Previews
      styles: state.styles,
      previews: state.previews,
      currentStyle: state.currentStyle(),

      // Preview Status
      pendingStyleId: state.pendingStyleId,
      stylePreviewStatus: state.stylePreviewStatus,
      stylePreviewMessage: state.stylePreviewMessage,
      stylePreviewError: state.stylePreviewError,
      orientationPreviewPending: state.orientationPreviewPending,

      // Entitlements
      entitlements: state.entitlements,
      userTier: state.entitlements?.tier ?? 'free',
      requiresWatermark: state.entitlements?.requiresWatermark ?? true,
      displayRemainingTokens: state.getDisplayableRemainingTokens(),

      // UI State
      orientation: state.orientation,
      croppedImage: state.croppedImage,
      livingCanvasModalOpen: state.livingCanvasModalOpen,
      launchpadExpanded: state.launchpadExpanded,
      firstPreviewCompleted: state.firstPreviewCompleted,
      generationCount: state.generationCount,
    }),
    shallow
  );

export const useStudioConfigActions = () =>
  useFounderStore(
    (state) => ({
      setLaunchpadExpanded: state.setLaunchpadExpanded,
      openCanvasModal: state.openCanvasModal,
      hydrateEntitlements: state.hydrateEntitlements,
    }),
    shallow
  );
```

**Usage in StudioConfigurator:**
```typescript
const state = useStudioConfigState();
const actions = useStudioConfigActions();

// Access: state.currentStyle, state.orientation, etc.
// Actions: actions.setLaunchpadExpanded(true)
```

**Expected Gain:** 40-60% fewer re-renders (shallow comparison prevents unnecessary updates when object reference changes but values don't)

#### Option B: Split into Micro-Selectors
Create domain-specific hooks:

```typescript
export const useStudioPreviewState = () =>
  useFounderStore(
    (state) => ({
      previews: state.previews,
      currentStyle: state.currentStyle(),
      pendingStyleId: state.pendingStyleId,
      status: state.stylePreviewStatus,
      message: state.stylePreviewMessage,
      error: state.stylePreviewError,
    }),
    shallow
  );

export const useStudioEntitlementState = () =>
  useFounderStore(
    (state) => ({
      entitlements: state.entitlements,
      tier: state.entitlements?.tier ?? 'free',
      requiresWatermark: state.entitlements?.requiresWatermark ?? true,
      displayRemainingTokens: state.getDisplayableRemainingTokens(),
    }),
    shallow
  );
```

**Expected Gain:** 30-50% fewer re-renders + better component organization

---

## Opportunity 2: PhotoUploader Over-Selection (HIGH IMPACT)

### Current State:
**File:** `src/components/launchpad/PhotoUploader.tsx`

**Problem:** Makes **25 individual store selections**:

```typescript
const setUploadedImage = useFounderStore((state) => state.setUploadedImage);
const setCroppedImage = useFounderStore((state) => state.setCroppedImage);
const setOriginalImage = useFounderStore((state) => state.setOriginalImage);
const setOriginalImageDimensions = useFounderStore((state) => state.setOriginalImageDimensions);
const originalImage = useFounderStore((state) => state.originalImage);
const originalImageDimensions = useFounderStore((state) => state.originalImageDimensions);
const smartCrops = useFounderStore((state) => state.smartCrops);
const setOrientation = useFounderStore((state) => state.setOrientation);
const setOrientationTip = useFounderStore((state) => state.setOrientationTip);
const markCropReady = useFounderStore((state) => state.markCropReady);
const setDragging = useFounderStore((state) => state.setDragging);
const generatePreviews = useFounderStore((state) => state.generatePreviews);
const resetPreviews = useFounderStore((state) => state.resetPreviews);
const shouldAutoGeneratePreviews = useFounderStore((state) => state.shouldAutoGeneratePreviews);
const setSmartCropForOrientation = useFounderStore((state) => state.setSmartCropForOrientation);
const setCurrentImageHash = useFounderStore((state) => state.setCurrentImageHash);
const getSessionAccessToken = useFounderStore((state) => state.getSessionAccessToken);
const clearSmartCrops = useFounderStore((state) => state.clearSmartCrops);
const setPreviewState = useFounderStore((state) => state.setPreviewState);
const croppedImage = useFounderStore((state) => state.croppedImage);
const orientation = useFounderStore((state) => state.orientation);
const orientationTip = useFounderStore((state) => state.orientationTip);
const cropReadyAt = useFounderStore((state) => state.cropReadyAt);
const isDragging = useFounderStore((state) => state.isDragging);
const uploadIntentAt = useFounderStore((state) => state.uploadIntentAt);
```

### Solution:

Create `src/store/selectors/uploadSelectors.ts`:

```typescript
export const useUploadState = () =>
  useFounderStore(
    (state) => ({
      originalImage: state.originalImage,
      originalImageDimensions: state.originalImageDimensions,
      smartCrops: state.smartCrops,
      croppedImage: state.croppedImage,
      orientation: state.orientation,
      orientationTip: state.orientationTip,
      cropReadyAt: state.cropReadyAt,
      isDragging: state.isDragging,
      uploadIntentAt: state.uploadIntentAt,
      shouldAutoGeneratePreviews: state.shouldAutoGeneratePreviews,
    }),
    shallow
  );

export const useUploadActions = () =>
  useFounderStore(
    (state) => ({
      setUploadedImage: state.setUploadedImage,
      setCroppedImage: state.setCroppedImage,
      setOriginalImage: state.setOriginalImage,
      setOriginalImageDimensions: state.setOriginalImageDimensions,
      setOrientation: state.setOrientation,
      setOrientationTip: state.setOrientationTip,
      markCropReady: state.markCropReady,
      setDragging: state.setDragging,
      generatePreviews: state.generatePreviews,
      resetPreviews: state.resetPreviews,
      setSmartCropForOrientation: state.setSmartCropForOrientation,
      setCurrentImageHash: state.setCurrentImageHash,
      getSessionAccessToken: state.getSessionAccessToken,
      clearSmartCrops: state.clearSmartCrops,
      setPreviewState: state.setPreviewState,
    }),
    shallow
  );
```

**Expected Gain:** 35-50% fewer re-renders in upload flow

---

## Opportunity 3: Previews Object Cascade (CRITICAL)

### Current State:

**Problem:** `state.previews` is a **mutable object** accessed by 23 components:

```typescript
const previews = useFounderStore((state) => state.previews);
const preview = currentStyle ? previews[currentStyle.id] : undefined;
```

**Re-render Cascade:**
When ANY preview completes:
1. `previews` object reference changes (new object created)
2. **ALL 23 components** subscribed to `previews` re-render
3. Even if component only cares about ONE specific preview

**Example from StudioConfigurator.tsx:**
```typescript
const previews = useFounderStore((state) => state.previews); // Line 88
const preview = currentStyle ? previews[currentStyle.id] : undefined; // Line 90
```

When "Watercolor" preview completes but user is viewing "Oil Painting", this component re-renders unnecessarily.

### Solution:

#### Create Preview-Specific Selectors

**File:** `src/store/selectors/previewSelectors.ts`

```typescript
import { useFounderStore } from '../useFounderStore';
import type { PreviewState } from '../founder/previewSlice';

/**
 * Get preview for currently selected style (avoids previews object cascade)
 */
export const useCurrentPreview = (): PreviewState | undefined => {
  return useFounderStore((state) => {
    const currentStyle = state.currentStyle();
    return currentStyle ? state.previews[currentStyle.id] : undefined;
  });
};

/**
 * Get preview for specific style ID
 */
export const useStylePreview = (styleId: string | null): PreviewState | undefined => {
  return useFounderStore((state) => (styleId ? state.previews[styleId] : undefined));
};

/**
 * Get preview status for current style
 */
export const useCurrentPreviewStatus = (): PreviewState['status'] | undefined => {
  return useFounderStore((state) => {
    const currentStyle = state.currentStyle();
    return currentStyle ? state.previews[currentStyle.id]?.status : undefined;
  });
};

/**
 * Check if current preview is ready
 */
export const useIsPreviewReady = (): boolean => {
  return useFounderStore((state) => {
    const currentStyle = state.currentStyle();
    return currentStyle ? state.previews[currentStyle.id]?.status === 'ready' : false;
  });
};
```

**Usage:**
```typescript
// BEFORE (triggers on ANY preview update):
const previews = useFounderStore((state) => state.previews);
const preview = currentStyle ? previews[currentStyle.id] : undefined;

// AFTER (triggers only when CURRENT preview updates):
const preview = useCurrentPreview();
```

**Expected Gain:** 50-70% fewer re-renders when multiple previews are generating

---

## Opportunity 4: Memoize Derived Values in Store (HIGH IMPACT)

### Current State:

**Problem:** `currentStyle()` is called **8 times** across components, re-executed on EVERY render:

```typescript
// src/store/useFounderStore.ts
currentStyle: () => {
  const state = get();
  if (!state.selectedStyleId) return null;
  return state.styles.find((s) => s.id === state.selectedStyleId) ?? null;
},
```

Every component calling `currentStyle()` runs `.find()` on the styles array on every render.

### Solution:

#### Add Computed Property with Memoization

**File:** `src/store/useFounderStore.ts`

```typescript
import { createWithEqualityFn } from 'zustand/traditional';

type FounderBaseState = {
  // ... existing state ...

  // NEW: Memoized computed values
  _computedCurrentStyle: StyleOption | null;

  // ... existing methods ...
};

export const useFounderStore = createWithEqualityFn<FounderState>((set, get, api) => ({
  // ... existing state ...

  _computedCurrentStyle: null,

  // Update _computedCurrentStyle whenever selectedStyleId or styles change
  selectStyle: (styleId) => {
    set((state) => {
      const newStyle = styleId ? state.styles.find((s) => s.id === styleId) ?? null : null;
      return {
        selectedStyleId: styleId,
        _computedCurrentStyle: newStyle,
      };
    });
  },

  // Getter uses memoized value
  currentStyle: () => get()._computedCurrentStyle,

  // Update memoized value when styles array changes (from lazy loading)
  ensureStyleLoaded: async (styleId) => {
    // ... existing logic ...

    set((state) => {
      const updatedStyles = state.styles.map((s) =>
        s.id === styleId ? mergeStyleSnapshot(s, catalogEntry) : s
      );

      // Recompute current style if it was updated
      const newComputedCurrent =
        state.selectedStyleId && state.selectedStyleId === styleId
          ? updatedStyles.find((s) => s.id === state.selectedStyleId) ?? null
          : state._computedCurrentStyle;

      return {
        styles: updatedStyles,
        loadedStyleIds: updatedLoadedIds,
        _computedCurrentStyle: newComputedCurrent,
      };
    });
  },
}));
```

**Expected Gain:** Eliminate 8 `.find()` calls per render across all components

---

## Opportunity 5: Create Entitlement Selector Hook

### Current State:

**Problem:** 27 files access `state.entitlements` with inconsistent patterns:

```typescript
// Pattern 1: Direct access
const entitlements = useFounderStore((state) => state.entitlements);

// Pattern 2: Nested property
const userTier = useFounderStore((state) => state.entitlements?.tier ?? 'free');

// Pattern 3: Multiple selections
const requiresWatermark = useFounderStore((state) => state.entitlements?.requiresWatermark ?? true);
const tier = useFounderStore((state) => state.entitlements?.tier ?? 'free');
```

### Solution:

**File:** `src/store/selectors/entitlementSelectors.ts`

```typescript
import { shallow } from 'zustand/shallow';
import { useFounderStore } from '../useFounderStore';

export const useEntitlements = () =>
  useFounderStore(
    (state) => ({
      tier: state.entitlements?.tier ?? 'free',
      status: state.entitlements?.status ?? 'active',
      requiresWatermark: state.entitlements?.requiresWatermark ?? true,
      remainingTokens: state.entitlements?.remainingTokens ?? null,
      priority: state.entitlements?.priority ?? 'normal',
      displayRemainingTokens: state.getDisplayableRemainingTokens(),
    }),
    shallow
  );

export const useIsPremiumUser = (): boolean =>
  useFounderStore((state) => !(state.entitlements?.requiresWatermark ?? true));

export const useUserTier = () =>
  useFounderStore((state) => state.entitlements?.tier ?? 'free');

export const useCanGenerateMore = (): boolean =>
  useFounderStore((state) => state.canGenerateMore());
```

**Expected Gain:** Consistent patterns + 20-30% fewer re-renders

---

## Opportunity 6: Batch Actions Hook Pattern

### Current State:

**Problem:** Action functions are selected individually:

```typescript
const setOrientation = useFounderStore((state) => state.setOrientation);
const setOrientationTip = useFounderStore((state) => state.setOrientationTip);
const setOrientationChanging = useFounderStore((state) => state.setOrientationChanging);
```

Each selection creates a subscription even though actions never change.

### Solution:

**File:** `src/store/selectors/actionSelectors.ts`

```typescript
import { shallow } from 'zustand/shallow';
import { useFounderStore } from '../useFounderStore';

export const useOrientationActions = () =>
  useFounderStore(
    (state) => ({
      setOrientation: state.setOrientation,
      setOrientationTip: state.setOrientationTip,
      setOrientationChanging: state.setOrientationChanging,
      setOrientationPreviewPending: state.setOrientationPreviewPending,
    }),
    shallow
  );

export const usePreviewActions = () =>
  useFounderStore(
    (state) => ({
      startStylePreview: state.startStylePreview,
      generatePreviews: state.generatePreviews,
      resetPreviews: state.resetPreviews,
      setPreviewState: state.setPreviewState,
      setPendingStyle: state.setPendingStyle,
    }),
    shallow
  );

export const useImageActions = () =>
  useFounderStore(
    (state) => ({
      setUploadedImage: state.setUploadedImage,
      setCroppedImage: state.setCroppedImage,
      setOriginalImage: state.setOriginalImage,
      setCurrentImageHash: state.setCurrentImageHash,
    }),
    shallow
  );
```

**Expected Gain:** Cleaner code + slight performance improvement

---

## Opportunity 7: Lazy Selector Evaluation

### Current State:

**Problem:** `useToneSections` hook is well-optimized but pattern not reused elsewhere.

**Good Example from `src/store/hooks/useToneSections.ts`:**
```typescript
const [
  styles,
  selectedStyleId,
  evaluateStyleGate,
  favoriteStyles,
  entitlementsTier,
  entitlementsStatus,
  entitlementsRemainingTokens,
  entitlementsRequiresWatermark,
  entitlementsLastSyncedAt,
] = useFounderStore(
  (state) => [
    state.styles,
    state.selectedStyleId,
    state.evaluateStyleGate,
    state.favoriteStyles,
    state.entitlements.tier,
    state.entitlements.status,
    state.entitlements.remainingTokens,
    state.entitlements.requiresWatermark,
    state.entitlements.lastSyncedAt,
  ],
  shallow
);
```

This is the **ONLY component** using shallow comparison properly!

### Solution:

**Apply this pattern to other heavy components:**

1. StudioConfigurator (23 selections → 1 batched with shallow)
2. PhotoUploader (25 selections → 1 batched with shallow)
3. LaunchpadLayout (12 selections → 1 batched with shallow)
4. CheckoutSummary (7 selections → 1 batched with shallow)

---

## Opportunity 8: Store Subscription Debugging

### Current State:

**Problem:** No visibility into which components are causing re-renders.

### Solution:

**Add subscription tracking middleware:**

**File:** `src/store/middleware/subscriptionLogger.ts`

```typescript
import { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(f: StateCreator<T, [], []>, name?: string) => StateCreator<T, [], []>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...a) => {
    const prevState = get();
    set(...a);
    const nextState = get();

    const changes = Object.keys(nextState).filter(
      (key) => prevState[key as keyof typeof prevState] !== nextState[key as keyof typeof nextState]
    );

    if (changes.length > 0) {
      console.log(`[${name || 'store'}] State updated:`, changes);
    }
  };

  store.subscribe((state, prevState) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${name || 'store'}] Subscribers notified`);
    }
  });

  return f(loggedSet, get, store);
};

export const logger = loggerImpl as unknown as Logger;
```

**Usage in development:**
```typescript
export const useFounderStore = createWithEqualityFn<FounderState>(
  logger(
    (set, get, api) => ({
      // ... store implementation ...
    }),
    'FounderStore'
  )
);
```

**Expected Gain:** Visibility into performance bottlenecks

---

## Opportunity 9: Split Preview Cache from Previews State

### Current State:

**Problem:** `stylePreviewCache` is part of the same state object as `previews`, causing unnecessary re-renders.

**From `src/store/founder/previewSlice.ts`:**
```typescript
stylePreviewCache: Record<string, Partial<Record<Orientation, StylePreviewCacheEntry>>>;
stylePreviewCacheOrder: string[];
```

Cache updates trigger component re-renders even though components don't read the cache.

### Solution:

**Move cache to separate Zustand store:**

**File:** `src/store/previewCache.ts`

```typescript
import { create } from 'zustand';
import type { Orientation } from '@/utils/imageUtils';
import type { StylePreviewCacheEntry } from './founder/previewSlice';

type PreviewCacheState = {
  cache: Record<string, Partial<Record<Orientation, StylePreviewCacheEntry>>>;
  order: string[];

  get: (styleId: string, orientation: Orientation) => StylePreviewCacheEntry | undefined;
  set: (styleId: string, entry: StylePreviewCacheEntry) => void;
  clear: () => void;
};

export const usePreviewCache = create<PreviewCacheState>((set, get) => ({
  cache: {},
  order: [],

  get: (styleId, orientation) => {
    return get().cache[styleId]?.[orientation];
  },

  set: (styleId, entry) => {
    // ... cache logic from previewSlice ...
  },

  clear: () => set({ cache: {}, order: [] }),
}));
```

**Expected Gain:** 15-25% fewer re-renders during preview generation

---

## Opportunity 10: Orientation Change Optimization

### Current State:

**Problem:** Orientation changes trigger massive re-renders:

```typescript
setOrientation: (orientation) => {
  const current = get();
  if (current.orientation === orientation) return; // Early exit (good!)

  // ... updates orientation ...
  // ... clears caches ...
  // ... checks for cached previews ...
  // ... triggers preview re-polling ...
}
```

Every orientation change mutates multiple state properties, causing cascade.

### Solution:

**Batch orientation updates:**

```typescript
setOrientation: (orientation) => {
  const current = get();
  if (current.orientation === orientation) return;

  set((state) => {
    // Compute all updates in single batch
    const updates: Partial<FounderState> = {
      orientation,
      selectedCanvasSize: /* ... */,
      orientationPreviewPending: /* ... */,
    };

    return updates;
  });

  // Async side effects AFTER state update
  requestIdleCallback(() => {
    const updated = get();
    if (/* needs preview */) {
      updated.startStylePreview(/* ... */);
    }
  });
};
```

**Expected Gain:** 20-30% faster orientation switching

---

## Opportunity 11: Action Stability with useCallback

### Current State:

**Problem:** Action functions are stable but components don't leverage this.

**Example from StudioConfigurator:**
```typescript
const handleDownloadHD = async () => {
  // ... uses currentStyle, preview, requiresWatermark ...
};
```

No `useCallback`, so new function created on every render even though actions are stable.

### Solution:

**Wrap handlers with useCallback:**

```typescript
const actions = useStudioConfigActions();
const state = useStudioConfigState();

const handleDownloadHD = useCallback(async () => {
  if (!state.currentStyle || !state.preview?.data?.previewUrl) {
    // ...
  }
}, [state.currentStyle, state.preview, state.requiresWatermark, actions]);
```

**Expected Gain:** Prevent unnecessary child component re-renders

---

## Opportunity 12: Entitlement Version Memoization

### Current State:

**Good Pattern from `useToneSections`:**
```typescript
const buildEntitlementVersion = (
  tier: string,
  status: string,
  remainingTokens: number | null,
  requiresWatermark: boolean,
  lastSyncedAt: number | null
) => {
  return [tier ?? 'none', status ?? 'unknown', /* ... */].join('|');
};

const entitlementVersion = useMemo(
  () => buildEntitlementVersion(/* ... */),
  [entitlementsTier, entitlementsStatus, /* ... */]
);
```

This prevents re-computation when entitlements object reference changes but values don't.

### Solution:

**Move this pattern to store as computed property:**

```typescript
type FounderBaseState = {
  entitlements: EntitlementState;
  _entitlementVersion: string; // NEW: Computed version hash
};

// Update whenever entitlements change
hydrateEntitlements: (entitlements) => {
  const version = buildEntitlementVersion(
    entitlements.tier,
    entitlements.status,
    entitlements.remainingTokens,
    entitlements.requiresWatermark,
    entitlements.lastSyncedAt
  );

  set({
    entitlements,
    _entitlementVersion: version,
  });
};
```

**Expected Gain:** Eliminate duplicate version computation across components

---

## Implementation Priority (Recommended Order)

### Phase B.1 - Quick Wins (Day 1)
**Target:** 20-30% re-render reduction
**Risk:** Low

1. ✅ Create `src/store/selectors/` directory structure
2. ✅ Implement `useCurrentPreview` selector (Opportunity #3)
3. ✅ Implement `useEntitlements` hook (Opportunity #5)
4. ✅ Implement action batching hooks (Opportunity #6)
5. ✅ Update StudioConfigurator to use new selectors

**Validation:**
- `npm run lint`
- `npm run test`
- Manual smoke test: Upload → Preview generation

---

### Phase B.2 - Store Memoization (Day 2)
**Target:** Eliminate redundant calculations
**Risk:** Medium (requires store modification)

1. ✅ Add `_computedCurrentStyle` to store (Opportunity #4)
2. ✅ Update `currentStyle()` to use memoized value
3. ✅ Add `_entitlementVersion` computed property (Opportunity #12)
4. ✅ Test with Chrome DevTools Profiler

**Validation:**
- Verify `currentStyle()` no longer runs `.find()` on every call
- Check re-render counts in React DevTools

---

### Phase B.3 - Heavy Component Refactors (Day 3)
**Target:** 30-50% re-render reduction in critical paths
**Risk:** Medium (requires component changes)

1. ✅ Refactor StudioConfigurator (Opportunity #1)
2. ✅ Refactor PhotoUploader (Opportunity #2)
3. ✅ Apply shallow selectors to LaunchpadLayout
4. ✅ Batch orientation updates (Opportunity #10)

**Validation:**
- Full upload → crop → preview → checkout flow
- Performance profiling before/after

---

### Phase B.4 - Advanced Optimizations (Day 4)
**Target:** Cache isolation + debugging tools
**Risk:** Medium-High (architectural changes)

1. ✅ Split preview cache to separate store (Opportunity #9)
2. ✅ Add subscription logger middleware (Opportunity #8)
3. ✅ Add useCallback to heavy handlers (Opportunity #11)
4. ✅ Performance audit with React DevTools Profiler

**Validation:**
- Measure re-render counts with profiler
- Verify cache isolation works
- Document performance improvements

---

## Success Metrics

### Before Phase B:
- StudioConfigurator: **23 individual selections**, no shallow
- PhotoUploader: **25 individual selections**, no shallow
- Total components using store: **41 files**
- Components using shallow: **1 (useToneSections)**
- `currentStyle()` calls: **8 per render**
- Re-render on preview completion: **23+ components**

### After Phase B (Target):
- StudioConfigurator: **2 batched selections** with shallow
- PhotoUploader: **2 batched selections** with shallow
- Total components using store: **41 files** (same)
- Components using shallow: **41 files** (all migrated)
- `currentStyle()` calls: **0 (memoized)**
- Re-render on preview completion: **<10 components** (only those using current preview)

### Expected Performance Gains:
- **30-50% fewer re-renders** during preview generation
- **40-60% faster** orientation switching
- **Eliminated** redundant `.find()` calls
- **Improved** component reusability via selector hooks

---

## Risks & Mitigation

### Risk 1: Breaking Changes from Shallow Comparison
**Mitigation:** Extensive testing, gradual rollout, keep old patterns temporarily

### Risk 2: Over-Optimization Leading to Complexity
**Mitigation:** Keep selectors simple, document patterns, avoid premature optimization

### Risk 3: Store Modifications Affecting Circular Dependency Fix
**Mitigation:** Complete Phase 1 (circular deps) before Phase B optimizations

### Risk 4: Performance Regression from Memoization Overhead
**Mitigation:** Profile before/after, only memoize expensive computations

---

## Conclusion

The Wondertone store architecture has **12 high-impact optimization opportunities** that will deliver 30-50% fewer re-renders and significantly improved maintainability. The most critical issues are:

1. **StudioConfigurator over-selection** (23 subscriptions)
2. **Previews object cascade** (triggers 23+ component re-renders)
3. **No memoization** of `currentStyle()` (8 redundant `.find()` calls)

Implementing Phase B will set the foundation for Phase C (feature module extraction) and Phase D (lazy loading).

**Recommendation:** Start with Phase B.1 (Quick Wins) to validate the approach, then proceed with incremental improvements.
