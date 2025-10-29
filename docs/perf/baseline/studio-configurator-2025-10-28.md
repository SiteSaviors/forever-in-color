# Studio Configurator Baseline — 2025-10-28

This snapshot captures the production build profile and validation guardrails before the Studio Configurator modularization effort begins.

---

## Build Artifact Summary

Command:  
```bash
npm run build:analyze
```

Key chunks of interest (pre-refactor):

| Chunk | Size | Gzip | Notes |
| --- | --- | --- | --- |
| `dist/assets/StudioConfigurator-B8IBW8MD.js` | 45.60 kB | 13.51 kB | Primary target for modularization (current monolithic component). |
| `dist/assets/StickyOrderRail-jVwJOKxq.js` | 16.13 kB | 4.41 kB | Checkout rail logic bundled by default. |
| `dist/assets/CanvasCheckoutModal-Bcg1-pKv.js` | 10.78 kB | 3.39 kB | Stripe checkout modal delivered eagerly. |
| `dist/assets/CanvasInRoomPreview-D1PVCmf_.js` | 6.16 kB | 2.64 kB | In-room visualization still part of initial Studio payload. |
| `dist/assets/StudioPage-8sWp5Y9d.js` | 25.45 kB | 8.31 kB | Page shell that bootstraps Launchflow + Studio. |
| `dist/assets/LaunchpadLayout-uiGlzwBS.js` | 34.54 kB | 10.11 kB | Launchflow flow; loads alongside Studio page. |
| `dist/assets/CheckoutPage-BUOlFGT5.js` | 48.96 kB | 14.35 kB | Downstream checkout route; currently part of shared vendor graph. |
| `dist/assets/motion-vendors-DUAy35H7.js` | 122.92 kB | 40.75 kB | Framer Motion + Radix presence. |
| `dist/assets/supabaseClient-ByXiJrV0.js` | 114.10 kB | 31.16 kB | Supabase client bundle; shared across Studio flows. |
| `dist/assets/heic2any-o99MUrg8.js` | 1,352.89 kB | 341.42 kB | Heavy image conversion dependency (baseline reference). |

CSS footprint:  
`dist/assets/index-DOyCdwD1.css` → 124.86 kB (gz 18.28 kB)

> _Note:_ Baseline numbers will be used to quantify modularization wins; retain this file for post-implementation comparison.

---

## Validation & Smoke Test Guardrails

Required automated checks (to be rerun after every major phase):
- `npm run lint`
- `npm run test -- tests/store/canvasModal.spec.ts tests/studio/actionGridOrientationBridge.spec.tsx`
- `npm run build`

Manual smoke script (source: `docs/founder-store-phase1-execution-plan.md`, Phase 6):
1. Launch `npm run dev`.
2. Upload photo in Launchflow.
3. Crop image and proceed to Studio.
4. Select a style → confirm preview generation.
5. Download preview (watermarked for free tier).
6. Save preview to gallery (authenticated path).
7. Open and close the Canvas modal; verify orientation bridge + analytics.

Supplementary context: `docs/phase-b-store-architecture-opportunities.md` outlines current bottlenecks (selector over-selection, previews cache behavior) that motivate this refactor.

---

## Next Steps
- Update `docs/studio-configurator-modularization-plan.md` with Phase 0 completion details.
- Begin Phase 1 only after this baseline file and plan updates are committed.
