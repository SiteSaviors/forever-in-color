# Wondertone Studio – Left Rail Overhaul Readiness Brief

This document captures the current state of the Wondertone studio codebase following the preparation sprint. Claude can treat this as the authoritative roadmap for building the tone-based accordion, knowing what groundwork is complete, what gaps remain, and where telemetry/UX guardrails stand.

---

## 0. What’s Already Done

### Data & Catalog
- **Single source catalog** (`src/config/styleCatalog.ts`): All styles live in a typed catalog with tone metadata, premium flags, badges, marketing copy, and a canonical signature entry (`signature-aurora`). `useFounderStore` loads from the catalog via `loadInitialStyles`.
- **Favorites scaffold** (`src/store/founder/favoritesSlice.ts`): Zustand slice tracks favorite style ids; `useToneSections` surfaces `isFavorite`.

### Entitlements & Gating
- **Centralized gate** (`src/utils/entitlementGate.ts`): `canGenerateStylePreview()` normalizes quota/fingerprint/premium checks for both free and premium tiers. `entitlementSlice` exposes `evaluateStyleGate` and `canUseStyle`.
- **Shared gate usage**: `useHandleStyleSelect`, `previewSlice`, `StyleSidebar`, `MobileStyleDrawer`, and `StudioConfigurator` all call `evaluateStyleGate`, so gating logic is consistent across flows.

### Tone Data Hooks
- **`useToneSections`** (`src/store/hooks/useToneSections.ts`): Groups styles by tone, merges entitlement gate state, favorites, and selected flags. Sidebar/mobile drawer now render from sections, not the flat list.
- **Thumbnail prefetch** (`src/hooks/useToneSectionPrefetch.ts`): IntersectionObserver-driven helper preloads tone thumbnails when a section enters view; applied to both sidebar and mobile drawer with `loading="lazy"` thumbnails.

### UX Feedback & Upgrade Flow
- **Unified feedback hook** (`src/hooks/useStudioFeedback.tsx`): Provides `showToast`, `showUpgradeModal`, and `renderFeedback()`. All `alert()` calls in `StudioConfigurator` and gallery flows are replaced with toasts or the new `UpgradePromptModal`.
- **Upgrade prompt modal** (`src/components/modals/UpgradePromptModal.tsx`): Reusable modal surfaced when gated content is selected.

### Telemetry
- **StepOne analytics expanded** (`src/utils/telemetry.ts`): New events cover `tone_section_view`, `tone_style_select`, `tone_style_locked`, and `tone_upgrade_prompt`. `StyleSidebar`, `MobileStyleDrawer`, and `useHandleStyleSelect` emit the appropriate events.

### Quality Gates
- **Regression smoke test** (`tests/studio/tones.spec.ts`): Vitest-based test confirming free vs. premium gating and quota handling via the centralized gate.
- **Build/test tooling**: `npm run test` (Vitest) added; lint/build/test all run clean.

---

## 1. Outstanding Work (Pre-Accordion)

| Priority | Item | Notes |
| --- | --- | --- |
| ✅ Complete | Items above | No action needed |
| ⚠️ Blocker | **None** | Preparatory blockers cleared |
| 🟡 Next Up | StepOne instrumentation for accordion-specific actions | Need to fire events for accordion expand/collapse, premium CTAs initiated from the accordion UI |
| 🟡 Next Up | Supabase entitlement audit | Verify `softRemaining`/`hardRemaining` align with the new signature tone defaults (currently handled client-side) |
| 🟢 Optional | Storybook, ARIA, marketing copy, telemetry dashboards | Useful once Claude lands the UI |
| 🟢 Optional | Anonymous token hardening (HttpOnly) | Remains on long-term roadmap |

### Pending Analytics Enhancements
- Accordion-specific StepOne events (expand/collapse, favorites toggles, CTA clicks) need to be wired when the UI lands.
- Marketing/telemetry team may want additional Progressive Disclosure events; structure already exists in `src/utils/telemetry.ts`.

---

## 2. Implementation Guidance for Claude

### Accordion UI (Tone Sections)
- `useToneSections` already supplies `styles`, `tone`, `definition`, `locked`, `lockedGate`, and `isFavorite`. Claude can build `ToneSection`/`ToneStyleCard` components off this data.
- `useHandleStyleSelect` now accepts a `{ tone }` meta argument—pass the tone from UI interactions so telemetry/future analytics stay consistent.
- Replace the current flat list markup in `StyleSidebar`/`MobileStyleDrawer` with accordion primitives (Radix or custom). Current grouping logic can be transitioned into collapsible sections.
- Utilize `lockedGate` to show tone-level gating copy (e.g., a pill badge or CTA button). Per-style gating is already handled inside `ToneSectionStyle`.

### Favorites & CTA Surface
- Favorites slice is live but unused in UI; a future PR can add star icons or a Favorites tab. Tone selectors already surface `isFavorite`.
- Upgrade CTA: leverage `showUpgradeModal` with the required tier from gate result; `tone_upgrade_prompt` will fire automatically when `handleGateDenied` is invoked.

### Performance & UX
- Prefetching already kicks off when sections enter view. Accordion should call `setActive(tone, true)` when sections expand/collapse to ensure eager prefetch for open panels.
- Ensure tone headers render accessible labels/ARIA attributes. Item-level `<button>` semantics are in place; accordion wrappers should add keyboard support (Radix recommends using `Accordion` primitives).

### Testing Expectations
- Add an integration test (RTL/Playwright) once UI is built to ensure:
  - Free tones render unlocked for anonymous users.
  - Signature tones show locked CTA for anonymous, unlocked for premium.
  - Favorites toggling (when implemented) persists in the store.
- Existing unit-level smoke test is available for gating; expand coverage to DOM-based behavior after UI lands.

---

## 3. File Map & Ownership Overview

| Area | Files | Status |
| --- | --- | --- |
| Catalog | `src/config/styleCatalog.ts` | ✅ data-driven catalog, includes signature tone |
| Store | `src/store/useFounderStore.ts`, `src/store/founder/*Slice.ts`, `src/store/hooks/useToneSections.ts` | ✅ gating + favorites ready |
| Gating | `src/utils/entitlementGate.ts`, `src/store/founder/entitlementSlice.ts` | ✅ centralized gate |
| Feedback | `src/hooks/useStudioFeedback.tsx`, `src/components/modals/UpgradePromptModal.tsx` | ✅ toasts/modals in place |
| UI (current) | `src/sections/studio/components/StyleSidebar.tsx`, `src/components/studio/MobileStyleDrawer.tsx` | ✅ grouped list, ready for accordion refactor |
| Interactions | `src/sections/studio/hooks/useHandleStyleSelect.ts` | ✅ returns tone metadata, emits telemetry |
| Tests | `tests/studio/tones.spec.ts` | ✅ regression smoke test (Vitest) |

---

## 4. Suggested Next Steps (Claude)
1. **Replace grouped list with accordion UI** (desktop and mobile) using tone sections. Preserve gating messaging and toast/modal flows.
2. **Add favorites affordances** (optional) once design lands—state is ready.
3. **Instrument additional StepOne events** for accordion expand/collapse and upgrade CTAs triggered from tone sections.
4. **Expand tests** with a UI-level spec confirming locked messaging and upgrade prompts render as expected.

---

### Quick Reference Commands
```bash
npm run lint
npm run build
npm run test         # Vitest – includes tones smoke test
```

---

Prepared by Codex. This document deprecates the earlier “Left Guardrail v2 Plan” and reflects the current readiness state for Claude’s accordion implementation. Let us know if you need deeper dives into any area.***
