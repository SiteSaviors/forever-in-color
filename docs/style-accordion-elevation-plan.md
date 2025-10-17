# Style Accordion Elevation – Implementation Blueprint

## Purpose
Deliver a cinematic, premium tone selector that matches Wondertone’s “AI canvas” mandate while preserving the Step One telemetry stack, gating logic, and preview performance guarantees.

## Guardrails & Dependencies
- **Configurator Integrity:** Leave `useHandleStyleSelect` and `useToneSections` as the source of truth for gating and tone grouping (see `src/sections/studio/hooks/useHandleStyleSelect.ts`, `src/store/hooks/useToneSections.ts`).
- **Telemetry:** Maintain Step One event contract (`src/utils/telemetry.ts`); new hero/hover signals must call `emitStepOneEvent` with existing union members.
- **Preview Pipeline:** Do not bypass `startStylePreview` or alter cache semantics (`src/store/founder/previewSlice.ts`, `src/utils/stylePreviewApi.ts`).
- **Mobile Parity:** `MobileStyleDrawer.tsx` must receive all visual/motion updates or graceful fallbacks.
- **Accessibility:** Respect `prefers-reduced-motion`, keyboard focus, WCAG AA contrast, and screen reader clarity.

## Workstream Overview

### 1. Design Tokens & Shared Utilities
- Extend `TONE_GRADIENTS` with `highlight`, `backdrop`, and `icon` swatches to drive lighting + accent consistency.
- Register serif headline font & motion utilities in Tailwind (`tailwind.config.ts`) and verify global CSS imports.
- Build a tone → icon map (thin-stroke SVGs) under `src/sections/studio/components/icons/`.
- Define reusable Framer Motion configs (spring timings, stagger values) in a util module (e.g., `src/sections/studio/motion/toneAccordionMotion.ts`).

### 2. Accordion Structure & Ambient Lighting
- Upgrade `StyleAccordion.tsx` to `AnimatePresence` + `motion.section` wrappers:
  - Open/close: 300 ms spring, 6% overshoot.
  - Child stagger: 40 ms; conditional on reduced motion.
  - Maintain thumbnail prefetch logic and `handleGateDenied` callback.
- Inject a tone-reactive ambient backdrop layer inside `StyleSidebar.tsx`:
  - Use CSS variables driven by active tone.
  - Run low-frequency transform animation; pause when reduced motion requested.
- Promote “tone view” event on expand via existing telemetry type.

### 3. Tone Section Hierarchy
- Restructure `ToneSection.tsx`:
  - Replace emoji with SVG icon component.
  - Apply serif headline + tone accent.
  - Animate chevron rotation & single-run icon shimmer (local state guard).
  - Render first style as a hero tile (wider layout, marketing copy, unique motion variant).
- Introduce `toneHeroMetadata` helper (pull marketing copy from `styleCatalog.ts`) and track hero impressions with `emitStepOneEvent`.

### 4. Tone Style Card Interactions
- Convert `ToneStyleCard.tsx` to `motion.button`:
  - Press: snap to 0.96 scale, spring back, tone-hued border pulse.
  - Hover (desktop): 2–3 px parallax thumbnail shift and keyline fade-in.
  - Selection: persistent tone accent outline + drop shadow.
- Refresh premium treatment:
  - Frosted glass overlay with metallic keyline.
  - Slow shimmer via CSS animation gated to run every ~8 s when visible.
  - Inline `PRO` pill using tone accent.
- Ensure gating path still funnels through `handleStyleSelect`.

### 5. Mobile Drawer & Responsiveness
- Mirror hero layout + motion (or fallbacks) inside `MobileStyleDrawer.tsx`.
- Add swipe-friendly spacing, ensure lazy content doesn’t jank (keep skeleton fades).
- Double-check touch hit areas ≥ 44 px; keep close gesture + history stack logic intact.

### 6. QA & Verification
- Unit/regression considerations: update `tests/studio/tones.spec.ts` if telemetry surface changes.
- Manual checklist:
  - Desktop: expand/collapse speed, hover depth, premium shimmer cadence.
  - Mobile: Drawer open/close, hero tile readability, reduced motion match.
  - Accessibility: Keyboard navigation order, focus rings, screen reader labels.
- Required scripts per workflow: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`.
- Monitor bundle delta vs. 567 KB ceiling (`dist/assets/index-CJh0zBXk.js`).

## Open Questions / Risks
- Hero selection: confirm whether CMS flag exists for “hero” or infer first item; fallback plan to avoid duplicated layout if no metadata.
- SVG asset ownership: verify design source or craft minimal icons inline; ensure tree-shaking.
- Performance: Evaluate parallax calculations; consider pointer-position throttling or CSS `:has` once supported.
- Telemetry extension: If analytics wants hero impressions as new event type, coordinate schema update; otherwise reuse `tone_section_view`.

## Next Steps
1. Review plan with stakeholders for sign-off.
2. Sequence implementation following plan steps, committing after each milestone.
3. Capture before/after screenshots + motion clips for review once coding completes.

