# Left Rail V2: Master Implementation Plan
## Tone Accordion with Premium Gating & Future-Ready Architecture

**Status**: Pre-Implementation Blueprint
**Estimated Effort**: 5-7 engineering days
**Risk Level**: Medium (architectural refactor + new UI patterns)
**Last Updated**: October 16, 2025

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Architecture Vision](#architecture-vision)
4. [Prioritized Housekeeping (MUST → NICE)](#prioritized-housekeeping)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Files Inventory](#files-inventory)
7. [Testing & Rollout Strategy](#testing--rollout-strategy)
8. [Post-Launch: Adding Styles in 5 Minutes](#post-launch-adding-styles-in-5-minutes)

---

## Executive Summary

### The Problem
The current left rail (`StyleSidebar.tsx`) is a **flat, hardcoded list** of 12 styles with no categorization, no premium gating at the style level, and no scalability for frequent additions. Styles are defined inline in the store, making it difficult to:
- Add new styles without code changes
- Gate premium styles per-tier
- Organize styles into discoverable categories
- Prepare for favorites/bundles/seasonal releases

### The Vision
Transform the left rail into a **data-driven accordion** with:

**6 Tone Categories**:
1. 📈 **Trending Tones** - Most popular this week
2. 🎨 **Classic Tones** - Timeless artistic styles
3. ✨ **Modern Tones** - Contemporary art styles
4. 🎭 **Stylized Tones** - Unique interpretations
5. ⚡ **Electric/Digital Tones** - Vibrant digital styles
6. ⭐ **Signature Tones** - Premium-exclusive (gated)

**Key Features**:
- ✅ **Premium Gating**: Free users see lock icons; clicking prompts upgrade
- ✅ **Lazy Loading**: Thumbnails load only when accordion expands (performance)
- ✅ **Badges**: "New", "Trending", "Popular", "Exclusive"
- ✅ **Future-Ready**: Favorites tab, bundle offers, seasonal styles (Phase 2)
- ✅ **5-Minute Additions**: New styles added by editing config only

### Success Metrics
- **Scalability**: Add new style in <5 minutes (config edit only)
- **Conversion**: Premium style clicks → upgrade rate >5%
- **Performance**: Render <100ms, bundle size +0KB (lazy loading offsets new code)
- **Engagement**: Users explore 2+ categories (up from 1 flat list)

---

## Current State Analysis

### Architecture Map

| **Layer** | **Current State** | **Pain Points** | **Planned State** |
|-----------|-------------------|-----------------|-------------------|
| **Style Catalog** | Hardcoded `mockStyles` array in `src/store/useFounderStore.ts:110` (12 styles, 280 lines) | Can't add styles without code changes; no metadata (tier, category, badges) | `src/config/styleCatalog.ts` - Declarative schema with `category`, `tier`, `badges`, `requiredSubscription` |
| **Entitlements** | 18 files call `canGenerateMore()` with scattered logic (Audit Issue #13) | Quota checks mixed with UI logic; no style-level gating; can't gate "Signature" category | Centralized `src/utils/entitlementGate.ts` with `canGenerateStylePreview(style, entitlements)` → structured `GateResult` |
| **Store Selectors** | Components read raw store state; no derived selectors | Sidebar & mobile drawer duplicate filtering logic; hard to add "favorites" later | New hooks: `useToneSections()`, `useUnlockedStyles()`, `usePremiumStyles()` |
| **Presentation** | `StyleSidebar.tsx` (140 lines) renders flat list; `MobileStyleDrawer.tsx` (300 lines) duplicates logic | No accordion UI; all 12 thumbnails load immediately; no lazy loading | `StyleAccordion.tsx` with `ToneSection` primitives; shared `StyleCard` component |
| **Feedback** | Mix of `alert()`, toasts, modals (Audit Issue #15) | Inconsistent UX; no upgrade prompts on locked styles | `useStudioFeedback()` hook → `pushToast()`, `showUpgradeModal()`, `trackError()` |
| **Telemetry** | StepOne events scattered across 8 files | Can't track category engagement, premium funnel | Accordion interactions emit: `tone_section_expanded`, `premium_style_clicked`, `upgrade_cta_shown` |

### Dependency Graph

```
Current Flow (before refactor):
useFounderStore.ts (mockStyles)
  ↓
StyleSidebar.tsx (flat list, manual gating)
  ↓
useHandleStyleSelect.ts (calls canGenerateMore)
  ↓
previewSlice.ts (startStylePreview, checks quota)

New Flow (after refactor):
styleCatalog.ts (source of truth)
  ↓
useToneSections() hook (derives categories + entitlements)
  ↓
StyleAccordion.tsx (renders sections, lazy loads thumbs)
  ↓
StyleCard.tsx (shared component, shows lock/badges)
  ↓
useHandleStyleSelect.ts (calls canGenerateStylePreview)
  ↓
entitlementGate.ts (returns GateResult: allowed/reason/message)
  ↓
useStudioFeedback() (shows toast or upgrade modal)
```

### Files Consuming Styles

**Critical Path** (must update):
1. ✅ `src/store/useFounderStore.ts:110` - `mockStyles` definition
2. ✅ `src/sections/studio/components/StyleSidebar.tsx` - Desktop sidebar
3. ✅ `src/components/studio/MobileStyleDrawer.tsx` - Mobile drawer
4. ✅ `src/sections/studio/hooks/useHandleStyleSelect.ts` - Selection logic
5. ✅ `src/store/founder/previewSlice.ts` - Preview generation

**Secondary** (may need sync):
- `src/components/studio/StyleCarousel.tsx` - Landing page carousel
- `src/sections/StyleShowcase.tsx` - Marketing page
- `src/components/hero/StylePills.tsx` - Hero section pills

### Entitlement Check Locations (Audit Issue #13)

**Found 18 files** checking entitlements with different semantics:

**Store Layer** (source of truth):
- `src/store/founder/entitlementSlice.ts` - Core logic

**Component Layer** (scattered checks):
- `src/sections/StudioConfigurator.tsx` - `canGenerateMore()`
- `src/sections/studio/components/StyleSidebar.tsx` - `canGenerateMore()`
- `src/components/studio/MobileStyleDrawer.tsx` - `canGenerateMore: boolean` prop
- `src/sections/studio/hooks/useHandleStyleSelect.ts` - `if (!canGenerateMore()) return;`
- `src/store/founder/previewSlice.ts` - Inline quota checks
- ... 12 more files

**Critical Issue**: No single function handles style-level permissions. Must consolidate before adding premium gating.

---

## Architecture Vision

### 1. Data-Driven Style Catalog

**Philosophy**: Styles are **data, not code**. UI renders from schema.

**New File**: `src/config/styleCatalog.ts`

```typescript
/**
 * Wondertone Style Catalog
 *
 * Single source of truth for all art styles.
 * Adding a new style: just add an entry here (no code changes).
 */

export type StyleTier = 'free' | 'premium';
export type StyleCategory = 'trending' | 'classic' | 'modern' | 'stylized' | 'electric' | 'signature';
export type StyleBadge = 'new' | 'popular' | 'trending' | 'exclusive';

export type StyleMetadata = {
  // Identity
  id: string;
  name: string;
  description: string;

  // Assets
  thumbnail: string; // Path to thumbnail (lazy loaded)
  preview: string; // Path to full preview

  // Pricing
  priceModifier: number; // Extra cost for premium styles (e.g., +$5)

  // Categorization (NEW)
  category: StyleCategory;
  tier: StyleTier;
  requiredSubscription?: 'creator' | 'plus' | 'pro'; // null = free
  badges?: StyleBadge[];

  // Display
  sortOrder: number; // Order within category
  releasedAt?: string; // ISO date for "new" badge (auto-hides after 30 days)

  // Marketing
  marketingCopy?: string; // Optional upsell copy
  demoUrl?: string; // Link to demo/landing page
};

export const STYLE_CATEGORIES: Record<StyleCategory, {
  id: StyleCategory;
  label: string;
  icon: string; // Emoji
  description: string;
  requiredTier?: 'creator' | 'plus' | 'pro'; // Category-level gating
  defaultExpanded?: boolean;
}> = {
  trending: {
    id: 'trending',
    label: '📈 Trending Tones',
    icon: '📈',
    description: 'Most popular styles this week',
    defaultExpanded: true, // Trending open by default
  },
  classic: {
    id: 'classic',
    label: '🎨 Classic Tones',
    icon: '🎨',
    description: 'Timeless artistic styles',
  },
  modern: {
    id: 'modern',
    label: '✨ Modern Tones',
    icon: '✨',
    description: 'Contemporary art styles',
  },
  stylized: {
    id: 'stylized',
    label: '🎭 Stylized Tones',
    icon: '🎭',
    description: 'Unique artistic interpretations',
  },
  electric: {
    id: 'electric',
    label: '⚡ Electric/Digital Tones',
    icon: '⚡',
    description: 'Vibrant digital art styles',
  },
  signature: {
    id: 'signature',
    label: '⭐ Signature Tones',
    icon: '⭐',
    description: 'Premium exclusive styles',
    requiredTier: 'creator', // Entire category locked for free users
  },
};

export const STYLE_CATALOG: StyleMetadata[] = [
  // ===== TRENDING CATEGORY =====
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    description: 'Soft washes with gentle light leaks perfect for portraits.',
    thumbnail: '/art-style-thumbnails/watercolor-dreams.jpg',
    preview: '/art-style-thumbnails/watercolor-dreams.jpg',
    priceModifier: 0,
    category: 'trending',
    tier: 'free',
    badges: ['trending', 'popular'],
    sortOrder: 1,
  },
  {
    id: 'neon-splash',
    name: 'Neon Splash',
    description: 'Electric neon splashes with vibrant energy.',
    thumbnail: '/art-style-thumbnails/neon-splash.jpg',
    preview: '/art-style-thumbnails/neon-splash.jpg',
    priceModifier: 0,
    category: 'trending',
    tier: 'premium',
    requiredSubscription: 'creator',
    badges: ['trending', 'exclusive'],
    sortOrder: 2,
    marketingCopy: 'Unlock vibrant neon aesthetics with Creator tier',
  },
  {
    id: 'classic-oil-painting',
    name: 'Classic Oil Painting',
    description: 'Traditional oil painting texture with bold brush strokes.',
    thumbnail: '/art-style-thumbnails/classic-oil-painting.jpg',
    preview: '/art-style-thumbnails/classic-oil-painting.jpg',
    priceModifier: 0,
    category: 'trending',
    tier: 'free',
    badges: ['popular'],
    sortOrder: 3,
  },

  // ===== CLASSIC CATEGORY =====
  {
    id: 'original-image',
    name: 'Original Image',
    description: 'Your photo untouched - classic canvas print.',
    thumbnail: '/art-style-thumbnails/original-image.jpg',
    preview: '/art-style-thumbnails/original-image.jpg',
    priceModifier: 0,
    category: 'classic',
    tier: 'free',
    sortOrder: 1,
  },
  {
    id: 'pastel-bliss',
    name: 'Pastel Bliss',
    description: 'Gentle color washes with soft grain highlights.',
    thumbnail: '/art-style-thumbnails/pastel-bliss.jpg',
    preview: '/art-style-thumbnails/pastel-bliss.jpg',
    priceModifier: 0,
    category: 'classic',
    tier: 'free',
    sortOrder: 2,
  },
  {
    id: 'artisan-charcoal',
    name: 'Artisan Charcoal',
    description: 'Hand-drawn charcoal artistry with dramatic shading.',
    thumbnail: '/art-style-thumbnails/artisan-charcoal.jpg',
    preview: '/art-style-thumbnails/artisan-charcoal.jpg',
    priceModifier: 0,
    category: 'classic',
    tier: 'free',
    sortOrder: 3,
  },

  // ===== MODERN CATEGORY =====
  {
    id: '3d-storybook',
    name: '3D Storybook',
    description: 'Whimsical 3D illustrated style with storybook charm.',
    thumbnail: '/art-style-thumbnails/3d-storybook.jpg',
    preview: '/art-style-thumbnails/3d-storybook.jpg',
    priceModifier: 0,
    category: 'modern',
    tier: 'free',
    sortOrder: 1,
  },
  {
    id: 'abstract-fusion',
    name: 'Abstract Fusion',
    description: 'Bold geometric abstraction with luminous color blocking.',
    thumbnail: '/art-style-thumbnails/abstract-fusion.jpg',
    preview: '/art-style-thumbnails/abstract-fusion.jpg',
    priceModifier: 0,
    category: 'modern',
    tier: 'premium',
    requiredSubscription: 'creator',
    badges: ['exclusive'],
    sortOrder: 2,
  },

  // ===== STYLIZED CATEGORY =====
  {
    id: 'pop-art-burst',
    name: 'Pop Art Burst',
    description: 'Bold Warhol-inspired pop art with vibrant colors.',
    thumbnail: '/art-style-thumbnails/pop-art-burst.jpg',
    preview: '/art-style-thumbnails/pop-art-burst.jpg',
    priceModifier: 0,
    category: 'stylized',
    tier: 'free',
    sortOrder: 1,
  },
  {
    id: 'deco-luxe',
    name: 'Deco Luxe',
    description: 'Art Deco elegance with geometric luxury.',
    thumbnail: '/art-style-thumbnails/deco-luxe.jpg',
    preview: '/art-style-thumbnails/deco-luxe.jpg',
    priceModifier: 0,
    category: 'stylized',
    tier: 'free',
    sortOrder: 2,
  },

  // ===== ELECTRIC/DIGITAL CATEGORY =====
  {
    id: 'electric-bloom',
    name: 'Electric Bloom',
    description: 'Luminous bloom effects with electric color palettes.',
    thumbnail: '/art-style-thumbnails/electric-bloom.jpg',
    preview: '/art-style-thumbnails/electric-bloom.jpg',
    priceModifier: 0,
    category: 'electric',
    tier: 'free',
    sortOrder: 1,
  },
  {
    id: 'gemstone-poly',
    name: 'Gemstone Poly',
    description: 'Low-poly crystalline facets with gemstone brilliance.',
    thumbnail: '/art-style-thumbnails/gemstone-poly.jpg',
    preview: '/art-style-thumbnails/gemstone-poly.jpg',
    priceModifier: 0,
    category: 'electric',
    tier: 'premium',
    requiredSubscription: 'plus',
    badges: ['exclusive'],
    sortOrder: 2,
  },

  // ===== SIGNATURE CATEGORY (all premium) =====
  // To be added: exclusive premium styles
];

// ===== UTILITY FUNCTIONS =====

export const getStylesByCategory = (category: StyleCategory): StyleMetadata[] => {
  return STYLE_CATALOG
    .filter(style => style.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getStyleById = (id: string): StyleMetadata | undefined => {
  return STYLE_CATALOG.find(style => style.id === id);
};

export const isStyleUnlocked = (style: StyleMetadata, userTier: string): boolean => {
  if (style.tier === 'free') return true;
  if (!style.requiredSubscription) return true;

  const tierHierarchy = ['anonymous', 'free', 'creator', 'plus', 'pro', 'dev'];
  const requiredIndex = tierHierarchy.indexOf(style.requiredSubscription);
  const userIndex = tierHierarchy.indexOf(userTier);

  return userIndex >= requiredIndex;
};

export const isCategoryUnlocked = (category: StyleCategory, userTier: string): boolean => {
  const categoryMeta = STYLE_CATEGORIES[category];
  if (!categoryMeta.requiredTier) return true;

  const tierHierarchy = ['anonymous', 'free', 'creator', 'plus', 'pro', 'dev'];
  const requiredIndex = tierHierarchy.indexOf(categoryMeta.requiredTier);
  const userIndex = tierHierarchy.indexOf(userTier);

  return userIndex >= requiredIndex;
};

// Auto-hide "new" badge after 30 days
export const shouldShowNewBadge = (style: StyleMetadata): boolean => {
  if (!style.releasedAt || !style.badges?.includes('new')) return false;
  const releaseDate = new Date(style.releasedAt);
  const daysSinceRelease = (Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceRelease <= 30;
};
```

---

### 2. Centralized Entitlement Gating

**Philosophy**: **Server is source of truth**. Client gating is UX only (prevents wasted API calls).

**New File**: `src/utils/entitlementGate.ts`

```typescript
import type { EntitlementTier } from '@/store/founder/entitlementSlice';
import type { StyleMetadata } from '@/config/styleCatalog';

export type GateResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: 'quota_exceeded' | 'style_locked' | 'category_locked' | 'tier_required';
      requiredTier?: string;
      message: string;
      ctaText?: string; // CTA button text
    };

/**
 * Central gating logic for style preview generation.
 * Called before every preview request (client-side UX gate).
 *
 * IMPORTANT: Server MUST validate again (client can be bypassed).
 */
export const canGenerateStylePreview = (
  style: StyleMetadata,
  entitlements: {
    tier: EntitlementTier;
    remainingTokens: number | null;
    quota: number | null;
  }
): GateResult => {
  // Gate 1: Quota exhausted?
  if (entitlements.remainingTokens !== null && entitlements.remainingTokens <= 0) {
    return {
      allowed: false,
      reason: 'quota_exceeded',
      message: `You've used all your generations this month. Upgrade to continue creating.`,
      ctaText: 'Upgrade Now',
    };
  }

  // Gate 2: Style tier locked?
  if (style.tier === 'premium' && style.requiredSubscription) {
    const tierHierarchy = ['anonymous', 'free', 'creator', 'plus', 'pro', 'dev'];
    const requiredIndex = tierHierarchy.indexOf(style.requiredSubscription);
    const userIndex = tierHierarchy.indexOf(entitlements.tier);

    if (userIndex < requiredIndex) {
      const tierLabel = style.requiredSubscription.toUpperCase();
      return {
        allowed: false,
        reason: 'style_locked',
        requiredTier: style.requiredSubscription,
        message: style.marketingCopy ?? `"${style.name}" requires ${tierLabel} tier or higher.`,
        ctaText: `Upgrade to ${tierLabel}`,
      };
    }
  }

  return { allowed: true };
};

/**
 * Check if user can access an entire category.
 * Used for UI rendering (show/hide accordion sections).
 */
export const canAccessCategory = (
  category: StyleCategory,
  userTier: EntitlementTier
): boolean => {
  const categoryMeta = STYLE_CATEGORIES[category];
  if (!categoryMeta?.requiredTier) return true;

  const tierHierarchy = ['anonymous', 'free', 'creator', 'plus', 'pro', 'dev'];
  const requiredIndex = tierHierarchy.indexOf(categoryMeta.requiredTier);
  const userIndex = tierHierarchy.indexOf(userTier);

  return userIndex >= requiredIndex;
};
```

**Migration**: Replace all `canGenerateMore()` calls with `canGenerateStylePreview(style, entitlements)`.

---

### 3. Derived Selectors & Hooks

**New File**: `src/store/hooks/useToneSections.ts`

```typescript
import { useMemo } from 'react';
import { useFounderStore } from '@/store/useFounderStore';
import { STYLE_CATEGORIES, getStylesByCategory, isStyleUnlocked, isCategoryUnlocked } from '@/config/styleCatalog';
import type { StyleCategory, StyleMetadata } from '@/config/styleCatalog';

export type ToneSection = {
  category: StyleCategory;
  label: string;
  icon: string;
  description: string;
  isLocked: boolean; // Category-level lock
  defaultExpanded: boolean;
  styles: Array<StyleMetadata & { isUnlocked: boolean }>; // Derived unlock state
};

/**
 * Derives UI-ready tone sections from catalog + entitlements.
 * Both desktop sidebar and mobile drawer consume this hook.
 */
export const useToneSections = (): ToneSection[] => {
  const userTier = useFounderStore(state => state.entitlements.tier);

  return useMemo(() => {
    return Object.values(STYLE_CATEGORIES).map(category => {
      const categoryUnlocked = isCategoryUnlocked(category.id, userTier);
      const styles = getStylesByCategory(category.id).map(style => ({
        ...style,
        isUnlocked: isStyleUnlocked(style, userTier),
      }));

      return {
        category: category.id,
        label: category.label,
        icon: category.icon,
        description: category.description,
        isLocked: !categoryUnlocked,
        defaultExpanded: category.defaultExpanded ?? false,
        styles,
      };
    }).filter(section => section.styles.length > 0); // Hide empty categories
  }, [userTier]);
};
```

**Usage**:
```typescript
const toneSections = useToneSections();

// Render accordion
{toneSections.map(section => (
  <ToneSection
    key={section.category}
    {...section}
  />
))}
```

---

### 4. Unified Feedback System

**New File**: `src/hooks/useStudioFeedback.ts`

```typescript
import { useCallback } from 'react';
import { useFounderStore } from '@/store/useFounderStore';

export const useStudioFeedback = () => {
  const setShowQuotaModal = useFounderStore(state => state.setShowQuotaModal);
  const setAccountPromptShown = useFounderStore(state => state.setAccountPromptShown);

  const showUpgradeModal = useCallback((config: {
    title: string;
    message: string;
    ctaText?: string;
    reason?: 'quota_exceeded' | 'style_locked' | 'category_locked';
  }) => {
    if (config.reason === 'quota_exceeded') {
      setShowQuotaModal(true);
    } else {
      // TODO: Create generic UpgradePromptModal component
      // For now, reuse QuotaExhaustedModal
      setShowQuotaModal(true);
    }
  }, [setShowQuotaModal]);

  const showToast = useCallback((config: {
    type: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
  }) => {
    // TODO: Replace with UnifiedToast component
    console.log(`[Toast ${config.type}]`, config.message);
  }, []);

  const trackError = useCallback((context: string, error: Error) => {
    console.error(`[${context}]`, error);
    // TODO: Send to Sentry/analytics
  }, []);

  return {
    showUpgradeModal,
    showToast,
    trackError,
  };
};
```

---

## Prioritized Housekeeping

### 🔴 TIER 1: MUST HANDLE BEFOREHAND (Blockers)

#### Task 1.1: Extract Style Catalog ⚠️ **CRITICAL P0**
**Estimated Time**: 2-3 hours
**Blocking Reason**: Can't build accordion without centralized style data.

**What**:
- Create `src/config/styleCatalog.ts` (see architecture above)
- Migrate all 12 existing styles from `mockStyles` array
- Add category, tier, badges metadata to each style

**Files to Create**:
- `src/config/styleCatalog.ts` (~400 lines)

**Files to Modify**:
- `src/store/useFounderStore.ts` - Replace `mockStyles` with `import { STYLE_CATALOG } from '@/config/styleCatalog'`
- `src/store/founder/previewSlice.ts` - Update `StyleOption` type references
- Verify no functional changes (all 12 styles render identically)

**Acceptance Criteria**:
- ✅ All 12 styles migrated with correct metadata
- ✅ Store imports from catalog (no inline array)
- ✅ Existing UI works identically (no visual changes)
- ✅ Can add new style by editing config only

**Test**:
```bash
npm run dev
# Verify all 12 styles appear in sidebar
# Verify clicking styles still generates previews
```

---

#### Task 1.2: Consolidate Entitlement Checks ⚠️ **CRITICAL P0**
**Estimated Time**: 4-5 hours
**Blocking Reason**: Can't add style-level gating with scattered logic.

**What**:
- Create `src/utils/entitlementGate.ts` (see architecture above)
- Replace all `canGenerateMore()` calls with `canGenerateStylePreview(style, entitlements)`
- Add `selectCanUseStyle(styleId)` selector to entitlement slice

**Files to Create**:
- `src/utils/entitlementGate.ts` (~150 lines)

**Files to Modify** (18 total):
- `src/store/founder/entitlementSlice.ts` - Export new helpers
- `src/sections/studio/hooks/useHandleStyleSelect.ts` - Use new gate
- `src/store/founder/previewSlice.ts` - Add style-level check
- `src/sections/StudioConfigurator.tsx` - Use unified gate
- `src/components/studio/MobileStyleDrawer.tsx` - Use unified gate
- `src/sections/studio/components/StyleSidebar.tsx` - Use unified gate
- ... 12 more files (see Audit Issue #13)

**Migration Pattern**:
```typescript
// BEFORE (scattered)
if (!canGenerateMore()) {
  alert('Out of tokens');
  return;
}

// AFTER (centralized)
const style = getStyleById(styleId);
const gateResult = canGenerateStylePreview(style, entitlements);
if (!gateResult.allowed) {
  showUpgradeModal({
    title: gateResult.reason === 'quota_exceeded' ? 'Out of Generations' : 'Premium Style',
    message: gateResult.message,
    ctaText: gateResult.ctaText,
  });
  return;
}
```

**Acceptance Criteria**:
- ✅ Single `canGenerateStylePreview()` function handles all gating
- ✅ Returns structured `GateResult` (allowed, reason, message, CTA)
- ✅ All 18 files migrated
- ✅ Free users blocked from premium styles with clear message

---

#### Task 1.3: Create Unified Feedback System ⚠️ **HIGH P0**
**Estimated Time**: 2-3 hours
**Blocking Reason**: Accordion adds many interactions (upgrade prompts, toasts).

**What**:
- Create `src/hooks/useStudioFeedback.ts` (see architecture above)
- Create `src/components/modals/UpgradePromptModal.tsx` (generic upgrade modal)
- Replace all `alert()` calls with `showToast()` or `showUpgradeModal()`

**Files to Create**:
- `src/hooks/useStudioFeedback.ts` (~80 lines)
- `src/components/modals/UpgradePromptModal.tsx` (~150 lines)

**Files to Modify**:
- `src/sections/StudioConfigurator.tsx` - Remove `alert()` calls
- `src/sections/studio/hooks/useHandleStyleSelect.ts` - Use feedback hook

**Acceptance Criteria**:
- ✅ Zero `alert()` calls remaining
- ✅ Consistent upgrade modal design
- ✅ Toast notifications for transient errors

---

#### Task 1.4: Add Tone Section Hooks ⚠️ **HIGH P0**
**Estimated Time**: 1-2 hours
**Blocking Reason**: Both sidebar and mobile drawer need this.

**What**:
- Create `src/store/hooks/useToneSections.ts` (see architecture above)
- Hook derives accordion data from catalog + entitlements

**Files to Create**:
- `src/store/hooks/useToneSections.ts` (~80 lines)

**Acceptance Criteria**:
- ✅ Hook returns array of `ToneSection` objects
- ✅ Styles include derived `isUnlocked` state
- ✅ Empty categories filtered out

---

#### Task 1.5: Add Thumbnail Lazy Loading ⚠️ **MEDIUM P1**
**Estimated Time**: 1-2 hours
**Blocking Reason**: Accordion with 50+ styles will load 50 images.

**What**:
- Add `loading="lazy"` to all `<img>` tags
- Only load thumbnails for expanded accordion sections

**Files to Modify**:
- `src/sections/studio/components/StyleAccordion.tsx` (to be created)

**Acceptance Criteria**:
- ✅ Thumbnails load only when accordion expands
- ✅ Network waterfall shows deferred image loads
- ✅ Page load <2s even with 50 styles

---

#### Task 1.6: Add Integration Tests ⚠️ **MEDIUM P1**
**Estimated Time**: 3-4 hours
**Blocking Reason**: Accordion is complex; tests prevent regressions.

**What**:
- Create `src/tests/StyleAccordion.test.tsx` (Vitest + Testing Library)
- Cover free vs premium user flows

**Files to Create**:
- `src/tests/StyleAccordion.test.tsx` (~200 lines)
- `src/tests/entitlementGate.test.ts` (~100 lines)

**Test Cases**:
- Free user sees lock icons on premium styles
- Premium user can select premium styles
- Clicking locked style shows upgrade modal
- Signature category locked for free users
- Accordion sections expand/collapse

**Acceptance Criteria**:
- ✅ 10+ integration tests passing
- ✅ Tests run in CI (GitHub Actions)
- ✅ Coverage >80% for accordion

---

### 🟡 TIER 2: STRONGLY RECOMMENDED (Quality)

#### Task 2.1: Refine useHandleStyleSelect Hook
**Estimated Time**: 1 hour
**What**: Add tone metadata to analytics events

#### Task 2.2: Add Feature Flag for Rollout
**Estimated Time**: 1 hour
**What**: `ENABLE_STYLE_ACCORDION` flag for gradual rollout

#### Task 2.3: Instrument Analytics Events
**Estimated Time**: 2 hours
**What**: Track `tone_section_expanded`, `premium_style_clicked`, `upgrade_cta_shown`

#### Task 2.4: Audit Supabase Entitlements
**Estimated Time**: 2 hours
**What**: Ensure server validates style-level permissions

---

### 🟢 TIER 3: NICE TO HAVE (Post-Launch)

#### Task 3.1: Add Favorites Slice Scaffold
**What**: Stub for favorites (no UI yet)

#### Task 3.2: Add Storybook Snippets
**What**: `ToneSection`, `StyleCard` component states

#### Task 3.3: Add ARIA & Keyboard Affordances
**What**: Use `@radix-ui/react-accordion` or custom wrapper

#### Task 3.4: Migrate Anonymous Tokens to HttpOnly Cookies
**What**: Security hardening (Audit Issue #19)

---

## Implementation Roadmap

### Phase 0: Housekeeping (Days 1-2)
**Goal**: Complete all Tier 1 blockers.

**Tasks**:
1. Extract style catalog (1.1)
2. Consolidate entitlement checks (1.2)
3. Create unified feedback system (1.3)
4. Add tone section hooks (1.4)
5. Add lazy loading (1.5)
6. Write integration tests (1.6)

**Deliverable**: Clean foundation. All styles in config, all gating centralized, tests passing.

---

### Phase 1: Build Accordion (Days 3-4)
**Goal**: Create new accordion UI.

**Tasks**:
1. Create `StyleAccordion.tsx` component
2. Create `ToneSection.tsx` sub-component
3. Create `StyleCard.tsx` shared component
4. Wire up premium gating (lock icons, upgrade modals)
5. Add badges (new, trending, popular)

**Deliverable**: Accordion renders all categories, styles organized by tier.

---

### Phase 2: Integration (Day 5)
**Goal**: Replace old sidebar, test all flows.

**Tasks**:
1. Update `StudioConfigurator.tsx` to use `StyleAccordion`
2. Update `MobileStyleDrawer.tsx` to use categorized data
3. Add feature flag `ENABLE_STYLE_ACCORDION`
4. Manual QA: test free vs premium flows
5. Performance testing: verify <100ms render

**Deliverable**: Accordion live behind feature flag.

---

### Phase 3: Rollout (Days 6-7)
**Goal**: Gradual rollout, monitor metrics.

**Tasks**:
1. Enable for 10% of users
2. Monitor Sentry, Mixpanel
3. Roll out to 50%, then 100%
4. Document process for adding styles

**Deliverable**: Accordion live for all users.

---

## Files Inventory

### Files to Create (8 new files)

**Config & Data**:
- `src/config/styleCatalog.ts` (~400 lines) - Style catalog with metadata
- `src/utils/entitlementGate.ts` (~150 lines) - Centralized gating

**Hooks**:
- `src/store/hooks/useToneSections.ts` (~80 lines) - Derive accordion data
- `src/hooks/useStudioFeedback.ts` (~80 lines) - Unified feedback

**Components**:
- `src/sections/studio/components/StyleAccordion.tsx` (~300 lines) - Main accordion
- `src/components/modals/UpgradePromptModal.tsx` (~150 lines) - Upgrade modal

**Tests**:
- `src/tests/StyleAccordion.test.tsx` (~200 lines) - Integration tests
- `src/tests/entitlementGate.test.ts` (~100 lines) - Unit tests

**Total New Lines**: ~1,460

---

### Files to Modify (15 files)

**Store & State**:
1. `src/store/useFounderStore.ts` - Import catalog, remove `mockStyles`
2. `src/store/founder/previewSlice.ts` - Add style-level entitlement check
3. `src/store/founder/entitlementSlice.ts` - Export new helpers

**Components (Major)**:
4. `src/sections/StudioConfigurator.tsx` - Replace sidebar with accordion
5. `src/sections/studio/components/StyleSidebar.tsx` - Keep as fallback (deprecated)
6. `src/components/studio/MobileStyleDrawer.tsx` - Use categorized styles

**Components (Minor)**:
7. `src/sections/studio/hooks/useHandleStyleSelect.ts` - Use new gating
8. `src/components/studio/StyleForgeOverlay.tsx` - Show tier in loading state
9. `src/components/studio/TokenWarningBanner.tsx` - Link to upgrade modal

**Config**:
10. `src/config/featureFlags.ts` - Add `ENABLE_STYLE_ACCORDION` flag

**Tests**:
11-15. Various test files for new components

---

## Testing & Rollout Strategy

### Manual QA Checklist
- [ ] Free user sees lock icons on premium styles
- [ ] Clicking locked style shows upgrade modal (not error)
- [ ] Premium user can select all styles
- [ ] Accordion sections expand/collapse smoothly
- [ ] Thumbnails lazy load (check Network tab)
- [ ] Mobile drawer shows categorized styles
- [ ] Badges display correctly (New, Trending, etc.)
- [ ] Signature category locked for free users
- [ ] Quota exceeded shows correct modal
- [ ] Style generation still works

### Performance Tests
```bash
npm run build:analyze
# Expected:
# - Bundle size +0KB (lazy loading offsets new code)
# - Initial render <100ms
# - Lighthouse score >90
```

### Rollout Plan
**Week 1**: Development + QA
**Week 2**: Gradual rollout (10% → 50% → 100%)

---

## Post-Launch: Adding Styles in 5 Minutes

### Process
1. Add entry to `src/config/styleCatalog.ts`
2. Upload thumbnail to `/public/art-style-thumbnails/`
3. Deploy

**Example**:
```typescript
// src/config/styleCatalog.ts
export const STYLE_CATALOG: StyleMetadata[] = [
  // ... existing styles

  // NEW STYLE (just add this block)
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Futuristic neon-lit cityscapes.',
    thumbnail: '/art-style-thumbnails/cyberpunk-neon.jpg',
    preview: '/art-style-thumbnails/cyberpunk-neon.jpg',
    priceModifier: 0,
    category: 'electric',
    tier: 'premium',
    requiredSubscription: 'creator',
    badges: ['new'],
    sortOrder: 10,
    releasedAt: '2025-10-20',
  },
];
```

No code changes. Accordion auto-updates.

---

**END OF MASTER PLAN**
