## Canvas Quality & Shipping Band — Implementation Plan

### Objective
Give first‑time visitors tangible proof that Wondertone canvases are premium, ready-to-hang, and shipped fast—within a slim horizontal strip that lives directly beneath the Social Proof section. Reinforce trust without derailing the Launchflow → Studio momentum.

---

### Phase 1 – Content Blueprint & Data Prep
1. Finalize messaging pillars:
   - **Archival Craft:** cotton/poly matte canvas, radiata pine frame from renewable forests.
   - **Ready to Hang:** hardware installed, rubber support dots, orientations/sizes (6 per orientation + 4 square).
   - **Shipping & Care:** protective packaging, quick turnaround (placeholder copy until SLA confirmed).
2. Draft headline/subhead (e.g., “Digital creators get fast. Canvas lovers get forever.”) plus concise body copy per pillar.
3. Define CTA copy/targets:
   - `See Canvas Pricing` → placeholder lighthouse route (TBD).
   - `Create Canvas Art` → store-driven upload/canvas modal (fallback to signup).
4. Gather placeholder thumbnail assets (temporary URLs) and note swap workflow for production photos.
5. Outline analytics contract (event name + payload schema) and document in `docs/social-proof-phased-plan.md`.

**Exit criteria:** Content draft approved, CTA behavior decided, telemetry schema defined.

---

### Phase 1 Deliverables (completed)

**Headline & Subhead**
- **Headline:** *Digital creators get fast. Canvas lovers get forever.*
- **Subhead:** *From matte cotton–poly canvas to sustainably sourced radiata pine frames, every Wondertone print is gallery-ready the moment it arrives.*

**Pillar Copy**
- **Archival Craft** – *Matte cotton–poly weave keeps color luminous without glare. Each piece is stretched by hand over radiata pine frames harvested from renewable forests for heirloom durability.*
- **Ready to Hang** – *Pick vertical, horizontal, or square formats—six curated sizes per orientation plus four square canvases. Rubber corner supports protect your walls, and hanging hardware arrives installed.*
- **Shipping & Care** – *Every canvas ships with foam corner guards, moisture wrap, and impact-tested packaging. Most orders leave the studio within 3–4 business days (update once final SLA is confirmed).*

**CTA Specifications**
- `See Canvas Pricing` → interim target `/pricing#canvas` (placeholder; Lighthouse experience will replace).  
- `Create Canvas Art` → tiered logic:
  1. Unauthenticated → `openAuthModal('signup')`.
  2. Authenticated without upload → `requestUpload()` to open Launchflow.
  3. Authenticated with upload → `openCanvasModal('canvas-quality-strip')`.

**Thumbnail Placeholders**
1. `/images/placeholders/canvas-detail-1.jpg` — texture close-up.
2. `/images/placeholders/canvas-lifestyle-1.jpg` — canvas staged in-room.
3. `/images/placeholders/canvas-packaging-1.jpg` — protected shipment.

> Swap plan: replace with final AVIF/WebP assets under `public/canvas/` and update alt text once photo shoot wraps.

**Analytics Contract**
- `canvas_quality_impression` → payload `{ surface: 'studio', timestamp }`.
- `canvas_quality_cta_click` → payload `{ surface: 'pricing' | 'create_canvas', authed: boolean, hasUpload: boolean, timestamp }`.

Events will be sent via a new helper that reuses the existing social-proof telemetry pipeline in Phase 4.

---

### Phase 2 – Component Architecture & Styling Skeleton
1. Create `CanvasQualityStrip` section component:
   - Slim band wrapper with premium gradient, subtle border top to blend with Social Proof section.
   - Top row gallery rail for 3–4 thumbnail placeholders (flex/scroll on mobile).
   - Three-column grid (`CanvasQualityCard` subcomponent) for the messaging pillars.
2. Reuse Tailwind tokens/utilities already in repo (glass surfaces, tracking, gradients) to avoid bloat.
3. Implement responsive rules:
   - Mobile: stack cards with swipeable gallery.
   - Desktop: fixed-height strip with columns.
4. Add reduced-motion guards (no transforms when `prefers-reduced-motion`).

**Exit criteria:** Static layout renders with placeholder copy/assets; no interactions yet; passes TypeScript.

---

### Phase 3 – Interaction Layer & CTA Wiring
1. Micro-interactions:
   - Hover/focus lift + ambient shimmer on cards (GPU-friendly transforms only).
   - Thumbnail rail idle shimmer; pause on hover/focus.
2. CTA logic:
   - `See Canvas Pricing` → `navigate('/pricing', { state: { from: 'studio_canvas_quality' } })` (placeholder anchor if needed).
   - `Create Canvas Art`:
     - If not authenticated → `openAuthModal('signup')`.
     - If authenticated and `croppedImage` exists → `useFounderStore.getState().openCanvasModal('canvas-quality-strip')`.
     - If authenticated but no upload yet → trigger `requestUpload()` (Launchflow opens) before modal.
3. Ensure CTA disables when interactions already in-flight to prevent double triggers.

**Exit criteria:** Interactions feel polished; CTA flows verified for logged-in/out users; no regression in Launchflow telemetry.

---

### Phase 4 – Telemetry, Accessibility & QA
1. Add analytics helper (e.g., `trackCanvasQualityEvent`) that reuses existing telemetry pipeline; log:
   - `canvas_quality_impression` (once component enters viewport).
   - `canvas_quality_cta_click` (surface: `pricing` | `create_canvas`, auth state, hasUpload flag).
2. A11y pass:
   - Thumbnails get `alt` placeholders; cards maintain contrast ≥ 4.5:1.
   - CTAs keyboard navigable with visible focus.
3. Cross-browser smoke (Chrome, Safari, Firefox) + mobile viewport check.
4. Update documentation (plan doc) and add TODOs for real photography/SLA copy.

**Exit criteria:** Events visible in console, accessibility checklist cleared, docs updated.

**Phase 4 Notes**
- Telemetry wired: `canvas_quality_impression` fires once via IntersectionObserver; CTA clicks log surface (`pricing` or `create_canvas`), auth state, and upload presence.
- Current imagery uses placeholder assets; replace with final photography + refreshed alt text in `/images/placeholders/` before launch.
- Buttons retain focus rings; ensure manual QA covers Chrome, Safari, Firefox, iOS Safari, and Android Chrome.

---

### Phase 5 – Performance & Polish
1. Audit bundle delta after component integration (`npm run build:analyze`).
2. Optimize assets: ensure thumbnails lazy-load, use `loading="lazy"` + aspect ratios.
3. Monitor main-thread costs during interaction (Perf tab) to confirm minimal impact.
4. Final copy tweak, handoff notes for imagery swap, and backlog any future enhancements (e.g., customer quote overlays).

**Exit criteria:** Section meets perf budget, handoff notes complete, ready for launch sequencing.
