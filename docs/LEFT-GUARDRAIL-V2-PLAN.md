# Wondertone Studio – Left Guardrail v2 Plan

## 0. Vision
- **Goal**: Reimagine the left rail as a tone-focused accordion (“Trending”, “Classic”, “Modern”, “Stylized”, “Electric/Digital”, and premium-gated “Signature”) that scales with frequent style additions and future favourites.
- **Tenets**: preserve configurator guardrails, keep `usePreviewGeneration` as the single API gateway, maintain telemetry, and uphold performance ceiling (bundle ≤ current 567 KB artifact).
- **Future proofing**: data-driven style catalog, entitlement-aware rendering, lazy assets, reusable feedback surfaces, and hooks ready for favourites and premium experiments.

## 1. Architecture Map
| Layer | Responsibility | Current Touchpoints | Planned changes |
| --- | --- | --- | --- |
| **Catalog (new)** | Declarative style metadata: tone category, entitlement tier, badges, unlock copy, thumbnail asset, preview behaviour flags. | Hard-coded `mockStyles` in `src/store/useFounderStore.ts`. | Create `src/config/styleCatalog.ts`, typed schema, loaders for desktop/mobile. |
| **Entitlements** | Token counts, gating, prompts, watermark requirements. | `src/store/founder/entitlementSlice.ts`, scattered checks in `StyleSidebar`, `LaunchpadLayout`, `StudioConfigurator`. | Centralize gating helpers (e.g. `selectIsStyleUnlocked(styleId)`), rely on server data, expose reason codes and premium messaging. |
| **Store Selectors** | Map catalog + entitlements + user prefs into UI-ready collections. | Sidebar manually filters, mobile drawer duplicates logic. | Add selectors/hooks (`useToneSections`, `useUnlockedStyles`, `usePremiumStyles`) that both desktop and mobile use. |
| **Presentation** | Accordion UI, cards, badges, locked messaging, favourites. | `src/sections/studio/components/StyleSidebar.tsx`, `MobileStyleDrawer.tsx`. | Factor into `AccordionSidebar`, `ToneSection`, `StyleCard`, shared `StyleList` primitives. |
| **Preview orchestration** | Generations, toasts, disable states. | `previewSlice`, `useHandleStyleSelect`, `StyleSidebar` button state. | Ensure `canGenerateMore` uses new selectors; lazy thumbnail/prefetch on accordion expand. |
| **Feedback & Upsell** | Toasts, modals, upgrade CTA, gating prompts. | Ad-hoc alerts, `TokenDecrementToast`, `QuotaExhaustedModal`. | Introduce shared toast/error helper (e.g. `useStudioFeedback`) reused by accordion interactions. |
| **Instrumentation** | StepOne telemetry, style impressions, unlock funnel. | Telemetry scattered in `StudioConfigurator`, `LaunchpadLayout`. | Wrap new accordion interactions in StepOne events; add impression hook per tone section. |

## 2. Ranked Prerequisites
### MUST handle beforehand
1. **Extract style catalog**  
   - File: `src/store/useFounderStore.ts` → move `mockStyles` to `src/config/styleCatalog.ts`.  
   - Provide type (`StyleCatalogEntry`) with fields: `id`, `name`, `tone`, `tier`, `isPremium`, `badge`, `thumbnail`, `preview`, `priceModifier`, `defaultUnlocked`, `marketingCopy`.
   - Store ingests via new helper (`loadInitialStyles()`).
2. **Consolidate entitlement gating**  
   - Files: `src/store/founder/entitlementSlice.ts`, `src/store/selectors.ts`, `src/sections/studio/components/StyleSidebar.tsx`, `src/components/studio/MobileStyleDrawer.tsx`.  
   - Add selectors (`selectCanUseStyle(styleId)`, `selectStyleLockReason(styleId)`); replace inline gating logic.
3. **Introduce tone section selectors**  
   - New hook `useToneSections()` in `src/store/hooks/useToneSections.ts` combining catalog + entitlements + (future) favourites.  
   - Sidebar & mobile drawer rely on this hook to render sections.
4. **Set up thumbnail lazy loading & prefetch**  
   - Utility hook `useToneSectionPrefetch` (e.g. `src/hooks/useToneSectionPrefetch.ts`).  
   - Apply `loading="lazy"` to thumbnails, only preload when section activated.
5. **Shared feedback helper**  
   - Create `src/hooks/useStudioFeedback.ts` returning `pushToast`, `pushModal`, `trackError`.  
   - Replace `alert()` usages in `StudioConfigurator` & planned accordion interactions.
6. **Regression tests (minimum smoke)**  
   - Add RTL or Playwright spec under `tests/studio/tones.spec.ts`.  
   - Covers: anonymous sees free tones, premium sees signature, locked messaging displayed with upgrade CTA.

### SHOULD tackle next
7. **Refine `useHandleStyleSelect`** to support section context (pass tone metadata, emit analytics).  
8. **Prepare favourites slice scaffold** (`favoritesSlice` stub storing IDs, no UI yet).  
9. **Instrument StepOne events** for section expand/collapse, premium click, upgrade CTA.
10. **Audit Supabase entitlements** to ensure `softRemaining` + `hardRemaining` mirror new tier gating (especially for signature tones).

### NICE to have before rollout
11. **Storybook snippets** for `ToneSection` / `StyleCard` states (locked, selected, premium).  
12. **ARIA & keyboard affordances** for accordion (use `@radix-ui/react-accordion` after confirming bundle impact or create lightweight wrapper).  
13. **Dynamic marketing copy** per tone (pull from CMS or `styleCatalog` metadata).  
14. **Telemetry dashboards** – add analytics schema for tone impressions/favourites.  
15. **Anonymous token hardening** – migrate to HttpOnly cookie consumption per earlier roadmap.

## 3. Files to Touch (initial pass)
- `src/config/styleCatalog.ts` *(new)* – canonical style definitions.
- `src/types/styleCatalog.ts` *(new)* – shared types.
- `src/store/useFounderStore.ts` – load catalog, remove inline definitions.
- `src/store/selectors.ts` – new selectors for tones/unlocks.
- `src/store/founder/entitlementSlice.ts` – expose `selectCanUseStyle`, lock reasons, integrate with catalog.
- `src/store/hooks/useToneSections.ts` *(new)* – derive accordion data.
- `src/hooks/useToneSectionPrefetch.ts` *(new)* – lazy thumbnail/prefetch.
- `src/hooks/useStudioFeedback.ts` *(new)* – toast/error helper.
- `src/sections/studio/components/StyleSidebar.tsx` – refactor to accordion layout.
- `src/components/studio/MobileStyleDrawer.tsx` – align with tone sections & lock states.
- `src/sections/studio/hooks/useHandleStyleSelect.ts` – pass tone metadata, use new gating selectors.
- `tests/studio/tones.spec.ts` *(new)* – entitlement-driven smoke test.
- Optional: `src/components/ui/Accordion` *(new)* if we wrap Radix or author custom accordion.

## 4. Implementation Outline
1. **Housekeeping sprint** (tasks 1–6). Confirm lint/build/test pipeline green.
2. **Accordion build**  
   - Implement ToneSection primitives.  
   - Wire sidebar + mobile drawer to selectors.  
   - Layer in premium lock UI, upgrade CTA hooking into existing modals.
3. **QA & telemetry**  
   - Verify gating across anonymous/free/premium sessions.  
   - Capture analytics events for marketing.
4. **Follow-ups**  
   - Roll out favourites slice once ready.  
   - Continue entitlement/token hardening and performance tuning.

## 5. Open Questions
- Will signature tones require additional server validation (e.g. new Supabase column)? Coordinate with backend before exposing UI.
- Do marketing teams need per-tone copy/images (affects catalog schema)?
- Should we support per-user tone ordering (personalisation) later? If yes, ensure catalog IDs remain stable and selectors can sort dynamically.

---
Prepared to keep the Wondertone experience consistent while enabling rapid tone iteration and premium expansion.
