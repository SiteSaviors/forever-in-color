# Story Layer Variant A – Phase 0 Foundations

## 1. Feature Flag Status
- `.env` currently defines Supabase + preview flags only; `VITE_STORY_LAYER_ENABLED` is **not** present yet.
- Action: add `VITE_STORY_LAYER_ENABLED=true` to `.env` (and `.env.example` if maintained) during Phase 1 to ensure availability via `import.meta.env`.

## 2. Top Styles Needing Bespoke Copy & Palettes
| Style ID | Tone | Tier | Rationale | Narrative Direction | Palette Anchors |
| --- | --- | --- | --- | --- | --- |
| `classic-oil-painting` | classic | free | High-traffic legacy style; foundation for traditional buyers | Emphasize museum brushwork, warm gallery lighting, heirloom positioning | Burnt umber, antique gold, deep navy |
| `watercolor-dreams` | trending | free | Frequently merchandised in marketing hero | Dreamy washes, light leaks, airy portrait energy | Soft coral, misty lavender, dove gray |
| `neon-splash` | electric | free | Signature wow-factor for virality/share | Electric momentum, kinetic splashes, nightlife glow | Hot magenta, cyan pulse, UV amber |
| `pastel-bliss` | classic | premium (Creator) | Top upgrade driver for calming aesthetics | Weightless pastels, tactile grain, cozy interiors | Powder pink, pistachio, warm cream |
| `signature-aurora` | signature | premium (Plus) | Flagship premium finish | Aurora gradients, luminous highlights, luxury story | Luminous violet, icy teal, champagne gold |
- Remaining catalog will fall back to tone defaults; capture these palettes/narratives next sprint as we ingest new styles.

## 3. Design Token Inventory (for Story Layer Styling)
- **Color variables** (`src/styles/tokens.css`): `--brand-indigo`, `--brand-purple`, `--brand-pink`, `--brand-emerald`, `--gradient-cta`, `--gradient-preview-bg`, etc.
- **Shadows & glow**: `--glow-purple`, `--glow-blue`, `--glow-soft`, `--shadow-xl`, `--shadow-inner`.
- **Tailwind extensions** (`tailwind.config.ts`): gradient utilities (`bg-gradient-cta`, `bg-gradient-preview-bg`), shadow utilities (`shadow-glow-purple`), rounded corners (`rounded-founder`), animation keyframes (`pulseGlow`, `tone-ambient-pulse`, `badge-shimmer`).
- Typography stacks: `font-display` (Playfair Display) for headlines, `font-sans` / `font-poppins` for body copy.
- Use these tokens to stay aligned with existing Studio aesthetics; avoid introducing new raw hex values.

## 4. Integration Review Notes
- **`CanvasPreviewPanel.tsx`**: main preview lives inside `max-w-2xl` container; “Save to Gallery” block sits at `mt-6`. The Story Layer can safely mount immediately after this block before the desktop-only CanvasInRoom section.
- **`CanvasInRoomPreview.tsx`**: lazy-loaded component keyed by orientation; reads from store for preview image, orientation transitions, shimmer sequencing. No direct changes needed—ensure Story Layer consumes already provided props.
- **Telemetry (`src/utils/telemetry.ts`)**: current helpers log to console (`emitStepOneEvent`, `trackCanvasCTAClick`, etc.). New story analytics should live in a separate helper (e.g., `storyLayerAnalytics.ts`) to avoid polluting Step One events while keeping console logging consistent for now.

## 5. Deliverables Checklist
- [x] Feature flag requirement documented (to be added in Phase 1).
- [x] Top five styles identified with initial narrative/palette direction.
- [x] Design tokens catalogued for reuse.
- [x] Component & telemetry touchpoints reviewed; integration approach confirmed.

These notes satisfy Phase 0 prep and will guide implementation during Phases 1–6.
