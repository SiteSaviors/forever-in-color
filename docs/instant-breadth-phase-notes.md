# Instant Breadth Section – Phase 1 Notes

## Data & Asset Audit
- `styleCarouselData` (defined in `src/store/useFounderStore.ts`) currently supplies 13 hard-coded cards backed by Unsplash URLs. These assets are remote, inconsistent with Wondertone’s tone gating, and bypass Supabase/local caching.
- The canonical source of truth is `STYLE_REGISTRY_SOURCE` (`registry/styleRegistrySource.ts`) with 60+ styles. Every entry points at `/art-style-thumbnails/*.{jpg,webp,avif}` variants that live in `public/art-style-thumbnails/` (≈18 MB total on disk, ~25–80 KB per rendition).
- The store boots with `STYLE_CORE_METADATA` (see `src/config/styles/registryCore.generated.ts`), so `useStyleCatalogState().styles` already exposes thumbnails without forcing full registry hydration. This keeps the preview pipeline untouched while providing name/id/thumbnail for the marquee.
- Full-catalog autoplay would imply downloading ~60 thumbnails. Even with WebP/AVIF (~55 KB median), that is ~3–3.5 MB of image transfer plus layout work; it also increases hydration time and GPU cost during translation animations.
- A curated list capped at ~18 items stays under ~1 MB and keeps frame budgets intact on mid-tier devices.

## Selector Strategy
```ts
const INSTANT_BREADTH_STYLE_IDS: readonly string[] = [
  'watercolor-dreams',
  'gallery-acrylic',
  // …author-provided curated ids (<= 18)
] as const;

const selectInstantBreadthItems = (styles: StyleOption[]) => {
  const catalogMap = new Map(styles.map((style) => [style.id, style]));
  return INSTANT_BREADTH_STYLE_IDS.map((id) => catalogMap.get(id)).filter(Boolean);
};
```
- The selector works off the existing store snapshot, so we avoid importing `STYLE_REGISTRY_SOURCE` (no bundler hit).
- If we ever expand past 18 items, introduce lazy chunking or intersection-observer hydration so only the visible slice renders initially.
- Fallback behavior: if a curated ID is missing (feature flag disabled or tone not yet loaded), omit it; never backfill with random styles to keep founder-controlled curation.

### Trade-offs for Full Catalog
- Rendering 60+ cards requires virtualization or multi-row layout to prevent layout thrash. Framer-motion autoplay over that many DOM nodes risks <60 FPS on lower GPUs.
- Network impact: even with HTTP/2 multiplexing, eager fetching of all thumbnails competes with Studio previews. Recommendation is to launch with the curated list and revisit scaling once we profile bundle/cache impact.

## Copy, Layout & CTA Contract
- Headline: **“Wondertone AI transforms your photos into 50+ premium art styles—instantly.”**
- Subhead: “Save to your gallery, download & share, or print on museum-quality canvas.”
- Trust ticks (inline): “✓ Free preview ✓ No card required ✓ Prints ship ready to hang”
- CTAs:
  - Ghost button → `openAuthModal('signup')` (reuse existing store hook from `useAuthModal`).
  - Primary button → `navigate('/pricing')` (leverages the tier selection flow already wired on PricingPage).
- Section shell: full-width `bg-slate-950/95` band, subtle border-top, `max-w-[1800px] px-6 py-10` container, flex column spacing. Mobile breakpoint stacks CTAs and scales thumbnails down to preserve viewport height.

## Interaction Guardrails
- Carousel buttons remain decorative for Phase 1: no calls into `useHandleStyleSelect`, `emitStepOneEvent`, or preview slices. This avoids double-counting Step One telemetry and keeps Supabase workloads unchanged.
- Hover/focus pause only suspends the animation timeline; it must not alter store state. Pointer drag-to-scrub can update the local transform without dispatching analytics.
- Accessibility: each card is focusable with `aria-label="Open {Style Name} in Studio"`, but the handler is a no-op (can later evolve into deep-linking once product approves).

## Phase Outlook
- Phase 2 will formalize component boundaries (`InstantBreadthStrip`, autoplay hook), responsive rules, and animation approach.
- Phase 3 will implement the section on a feature branch, respecting the founder workflow before touching git.
- Phase 4 will run lint/build/deps checks and validate telemetry/pipeline neutrality.
- Phase 5 (optional) can revisit expanded catalogs or interactive style launches once we profile performance impact.

---

# Style Inspiration Section – Phase 2 Planning

## Component Architecture
- **`StyleInspirationSection`**  
  - Lives directly under `InstantBreadthStrip` to maintain Launchflow → Studio → inspiration cadence.  
  - Receives no props initially; it derives curated style arrays internally via store selectors.
  - Composes: `StyleInspirationHeader`, `StyleInspirationColumns`, and a shared `StyleInspirationCard`.

- **`StyleInspirationHeader`**  
  - Renders headline/subhead copy: “Need a starting point? Try these creator-approved styles.”  
  - Optional supporting line for future filters (“Curated by Wondertone creators”).  
  - Pure presentational component leveraging existing typography tokens (`font-display`, `tracking-tight`).

- **`StyleInspirationColumns`**  
  - Manages the grid layout (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).  
  - Accepts structured data: an array of `{ id: string; title: string; description: string; styles: StyleOption[] }`.  
  - Iterates over column definitions to render `StyleInspirationColumn`.

- **`StyleInspirationColumn`**  
  - Handles per-column framing: title, descriptor, optional badge (e.g., “Creator picks”).  
  - Wraps its card list in a `role="list"` container with `aria-label` matching the column headline.  
  - Cards displayed via `StyleInspirationCard`.

- **`StyleInspirationCard`**  
  - Stateless thumbnail card using `picture` element and tailwind classes consistent with marquee cards.  
  - For now, rendered as a `<button type="button">` with no click handler (decorative).  
  - Accepts `style: StyleOption`, `context?: 'social' | 'print' | 'fun'`, `ariaHidden?: boolean` for future clones.  
  - Ensures `loading="lazy"`, `alt={`${style.name} thumbnail`}`, and respects reduced-motion (no animated hover if the user opts out).

## Data Selectors & Fallbacks
- Define curated ID arrays:
  ```ts
  const SOCIAL_STYLE_IDS = [...];
  const PRINT_STYLE_IDS = [...];
  const FUN_STYLE_IDS = [...];
  ```
  (IDs taken from Phase 1 research; keep ≤10 per column).
- Selector helper similar to Instant Breadth:
  ```ts
  const selectCuratedStyles = (styles: StyleOption[], ids: readonly string[]) => {
    const lookup = new Map(styles.map((style) => [style.id, style]));
    return ids
      .map((id) => lookup.get(id))
      .filter((style): style is StyleOption => Boolean(style));
  };
  ```
- Memoize computed columns via `useMemo` so re-renders remain cheap.  
- If a curated ID is missing (feature flag off, registry trimmed), simply omit it—no backfill—so founders keep deterministic ordering.  
- Future-proof: we can extract the selector into a shared utility if multiple sections reuse curated lists.

## Responsive & Styling Guidelines
- **Section Shell**:  
  - Background: `bg-slate-950/90` with `border-t border-white/10`, matching but visually distinct from Instant Breadth.  
  - Padding: `px-6 py-14 lg:py-16`, `max-w-[1800px] mx-auto`.

- **Typography**:  
  - Headline `text-[28px] sm:text-3xl md:text-[34px] font-display font-semibold`.  
  - Subhead `text-base sm:text-lg text-white/75`.  
  - Column titles `text-2xl font-semibold`, descriptors `text-sm text-white/60`.

- **Layout**:  
  - Columns grid: `grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3`.  
  - Each column uses `flex flex-col gap-4` with cards inside a `grid gap-4`.
  - On mobile, keep columns stacked; consider `overflow-x-auto` for cards if vertical space becomes heavy (defer to Phase 3 decision).

- **Cards**:  
  - Container classes: `rounded-2xl border border-white/10 bg-white/5/5 overflow-hidden transition-colors`.  
  - Thumbnail height: `aspect-[4/5]` (or fixed `h-44`) with `object-cover`.  
  - Title `text-sm sm:text-base font-semibold text-white/90`.  
  - Hover state (desktop only): subtle border glow `hover:border-white/20`, optional background shift `hover:bg-white/10`; wrap in `motion-safe` utility to respect reduced-motion preference.

- **Accessibility**:  
  - Use `role="list"` / `role="listitem"` semantics per column.  
  - Buttons include `aria-label="Preview {style.name}"` but keep click handler absent until we intentionally wire it.  
  - Ensure focus states visible (`focus-visible:ring-2 focus-visible:ring-purple-400/70`).  
  - No animations triggered automatically; rely on CSS transitions gated by `motion-safe`.

This plan mirrors Instant Breadth’s architecture, sets the stage for Phase 3 implementation, and keeps the curated experience deterministic and accessible.

---

# Instant Breadth Section – Phase 2 Plan

## Component Architecture
- **`InstantBreadthStrip` (section container)**  
  - Mounts immediately under `StudioConfigurator` in `StudioPage`.  
  - Accepts curated style IDs (constant) and reads `useStyleCatalogState().styles` to derive display data via the selector defined in Phase 1.  
  - Composes subcomponents: `InstantBreadthHeader`, `InstantBreadthCtas`, and `InstantBreadthCarousel`.
- **`InstantBreadthHeader`**  
  - Renders headline, subhead, and trust ticks with semantic markup (`<h2>`, `<p>`, `<ul>`/inline spans).  
  - No state; pure presentational component using Tailwind utility classes already present in Studio.
- **`InstantBreadthCtas`**  
  - Uses `useAuthModal` to trigger `openAuthModal('signup')` for the ghost button.  
  - Uses `useNavigate` to route to `/pricing` for the primary button; no additional store calls.  
  - Buttons expose `aria-describedby` to associate with copy if needed; align with existing CTA styling tokens.
- **`InstantBreadthCarousel`**  
  - Receives curated style entries and manages autoplay state locally (React state + `useEffect`).  
  - Duplicates the items array (`[...items, ...items]`) to enable seamless looping.  
  - Controls translation via `requestAnimationFrame`, updating a `progress` value multiplied into a CSS `transform: translateX`.  
  - Exposes pause/resume handlers triggered by hover, focus within, pointer down, visibility change, and `prefers-reduced-motion`.  
  - Delegates card rendering to `InstantBreadthCarouselCard`.
- **`InstantBreadthCarouselCard`**  
  - Button element with thumbnail, style name, and optional tone badge (future).  
  - `onClick` no-op stub for now (might emit analytics later).  
  - Applies `aria-label="Style preview: {name}"` and `tabIndex=0`; when rendered as cloned item for seamless looping, sets `aria-hidden="true"` and removes from tab order.
- **Autoplay Hook (`useMarqueeAutoplay`)**  
  - Encapsulates timing logic (speed, pause conditions, drag offset).  
  - Accepts `durationMs` (~20000) and returns `translateX`, `isPaused`, and setters.  
  - Honors `prefersReducedMotion`: if true, start paused and allow manual resume (button or drag).

## Responsive & Styling Strategy
- **Section Shell**  
  - Desktop: `max-w-[1800px] mx-auto px-6 py-12 lg:py-16`.  
  - Background: `bg-slate-950/95`, `border-t border-white/10`, reuse existing gradient noise if needed.  
  - Content stack: `flex flex-col gap-8 lg:gap-10`.
- **Headline & Copy**  
  - Typography uses existing font tokens (`font-display`, `tracking-tight`).  
  - For narrow viewports (`<640px`), reduce headline to `text-2xl` and center align; subhead `text-sm`.
- **CTA Row**  
  - Desktop: horizontal flex with gap (`flex-row items-center gap-4 flex-wrap`).  
  - Mobile: `flex-col` stack, ghost button first, use `w-full` to create full-width tap targets.  
  - Buttons reuse established classes (`btn-ghost`, `btn-primary` equivalents) to avoid new utilities.
- **Carousel Layout**  
  - Container: `relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5/5 px-4 py-6`.  
  - Track: `flex gap-6 md:gap-8` with inline style for transform.  
  - Cards: fixed width `w-[200px] md:w-[240px] lg:w-[280px]`, `aspect-[4/5]` for thumbnails; text underneath with `text-sm`.  
  - On <640px, reduce card width to `160px` and allow horizontal scroll for fallback if JS disabled.  
  - Provide gradient fades at edges (`before`/`after` pseudo elements) to hint at more content without heavy box-shadows.

## Accessibility Contract
- **Keyboard & Screen Readers**  
  - Real cards: rendered as `<button>` with descriptive `aria-label`; when autoplay is active, they remain focusable so keyboard users can interact (even if click is no-op).  
  - Duplicated cards for looping: `aria-hidden="true"` and `tabIndex={-1}` to avoid focus traps.  
  - Announce carousel as decorative region using `role="region"` with `aria-label="Wondertone style highlights"`; also mark as `aria-live="off"` (no dynamic announcements).  
  - Provide `data-paused` attribute to reflect state; optional assistive text (visually hidden) to explain that items are illustrative.
- **Autoplay Control**  
  - Honor `prefers-reduced-motion`: start paused; users can re-enable via an inline “Play carousel” button that appears only when motion is paused due to preference.  
  - On hover, focus within, pointer down, window blur, or when user drags: call pause; resume only on explicit mouse leave/blur and no reduced-motion preference.  
  - Drag interactions use pointer events, updating a local offset; ensure `pointercapture` release on pointer up to avoid stuck states.
- **Images**  
  - `img` elements include `alt="{style name} thumbnail"`; for duplicated elements, `alt=""` with `aria-hidden="true"`.  
  - Lazy-load via `loading="lazy"` to reduce initial payload.
- **Fallback Behavior**  
  - If JS disabled, the carousel track falls back to horizontal scrollable list with `overflow-x-auto` and `scroll-snap` to keep cards aligned.  
  - Ensure focus styles remain visible (use existing ring utilities).

## Outstanding Questions for Phase 3
- Confirm curated ID list before implementation.  
- Decide whether to surface a “View all styles” link beneath the carousel (out of scope unless requested).  
- Determine if we need analytics events for CTA clicks in this release.
