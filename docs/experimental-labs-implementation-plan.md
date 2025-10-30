## Experimental Labs – Implementation Blueprint

### Phase 0 – Discovery & Guardrail Alignment ✅
- [x] Re-read core guardrail docs (README.md, FOUNDER_WORKFLOW.md, agents.md).  
  - Reinforced Wondertone mandate (premium UX/perf), VS Code-first workflow, mandatory lint/build/analyze/deps checks, bundle ceiling enforcement, and telemetry guardrails (Step One via `emitStepOneEvent`, no bypassing `startStylePreview`).
- [x] Validate tone architecture.  
  - `STYLE_TONE_DEFINITIONS` + `STYLE_TONES_IN_ORDER` drive accordion ordering; new tone requires entry + sort order.  
  - `toneGradients.ts` supplies ambient/highlight/panel styling per tone; Experimental Labs needs a new gradient entry.  
  - `registryLazy.ts` lazy-loads tone bundles via explicit `switch` cases—must add `experimental` branch when tone is created.
- [x] Confirm Supabase expectations.  
  - Style prompts sourced from `docs/style_prompts_rows.json` → `registry/stylePromptsSource.ts` → Supabase `style_prompts` (migrations 20250627*).  
  - `generate-style-preview/index.ts` expects valid `style_id`, prompt metadata, caching fields; deployment required after registry updates (`supabase functions deploy generate-style-preview`, etc.).
- [x] Capture constraints & workflow.  
  - Bundle budget: production `dist/assets/index-*.js ~567 KB` ceiling (agents.md §5); maintain lazy splits to stay under.  
  - Maintain telemetry + gating pathways (`ToneStyleCard`, `useToneSections`, `previewSlice`).  
  - Continue VS Code-first process: branch per task, run scripted checks, no direct pushes to `main`.

### Phase 1 – Tone Definition & Visual System ✅
- [x] Extend `STYLE_TONE_DEFINITIONS` with `experimental` (label “Experimental Labs”, Wondertone Lab description, sort order 70, Creator tier).
- [x] Ensure `STYLE_TONES_IN_ORDER` automatically reflects new tone via sort key.
- [x] Add Experimental Labs gradient token set in `toneGradients.ts` (crimson/ember palette matching existing texture conventions).
- [x] Provide Experimental Labs icon in `toneIcons.tsx` (lab flask silhouette with consistent stroke/animation affordances).
- [ ] Visual validation: run Storybook/Chromatic tone snapshots prior to release (deferred to execution QA).

### Phase 2 – Style Catalog Authoring ✅
- [x] Defined 8 premium transformations (Plush Figure, Candy Gummy, Action Figure, Porcelain Figurine, Ice Sculpture, Bronze Statue, Wax Candle, Sand Sculpture) under the Experimental Labs tone.
- [x] Finalized IDs/slugs, Creator-tier gating (`requiredTier: 'creator'`, `defaultUnlocked: false`), marketing copy, and reuse of the premium badge.
- [x] Provisioned placeholder assets (JPG + `webp`/`avif` variants generated via `sharp`) in `public/art-style-thumbnails/`.
- [x] Added catalog entries to `registry/styleRegistrySource.ts` with numeric IDs 40–47 (supabase coordination pending prompt ingestion).
- [ ] Story content to be authored separately (deferred).  
No asset validation overrides required at this stage.

### Phase 3 – Prompt & Supabase Coordination ✅
- [x] Added Experimental Labs prompt entries (style IDs 40–47) to `docs/style_prompts_rows.json` with UUIDs + UTC timestamps.
- [ ] Mirror rows in Supabase `preview_styles` (numeric IDs 40–47) and confirm rollout flags (pending edge sync).
- [x] Telemetry flags unchanged (premium badge reused; no new feature flags required).
- [ ] Coordinate with backend to verify generate-style-preview handling (deferred to deployment checklist).

### Phase 4 – Code Generation & Typing ✅
- [x] Ran `npm run build:registry` generating updated registry bundles (including `experimentalTone.generated.ts` with assets/prompts/badges).
- [x] Confirmed type union already extended in Phase 1 (`StyleTone` includes `experimental`).
- [x] Reviewed generated tone file to ensure metadata accuracy.
- [ ] Commit artifacts in the next change set after final QA (pending).

### Phase 5 – UI Integration & UX Validation ⚙️
- [x] Confirmed `useToneSections` / `StyleAccordion` ingest the new tone automatically via `StyleTone` union + gradient tokens (no additional code required).
- [x] Verified `ToneStyleCard` badge/icon coverage (premium badge reused, Experimental tone icon in place).
- [ ] Manual Studio QA (expand Experimental Labs drawer, hover/parallax, gating/favorites) — pending once UI build is run.

### Phase 6 – Telemetry & Analytics ✅
- [x] `emitStepOneEvent` now includes `tone` for locked events (StyleAccordion/useHandleStyleSelect), ensuring Experimental Labs appears in view/select/locked analytics.
- [x] Launchflow/Studio dashboards automatically receive the new tone via existing event pipeline (no additional flags needed).
- [ ] Gallery Quickview tracking unchanged (no tone-specific metrics requested).
- [ ] Document tone addition for analytics team (events dictionary update pending rollout notes).

### Phase 7 – Performance & Regression Suite
- Run full checks: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`, `npm run test` (if coverage exists).
- Compare bundle outputs; ensure new `experimentalTone` chunk aligns with expectations (<15 KB minified). Document delta.
- Lighthouse/Pagespeed sample to confirm marketing pages unaffected (tone chunk lazy-loaded).
- Validate Supabase edge deployment: `supabase functions deploy generate-style-preview`, `save-to-gallery`, `get-gallery`, `persist-original-upload`.
- Smoke Studio: generate 2–3 previews per style; check Supabase logs for prompt contract success.

### Phase 8 – Documentation & Launch Readiness
- Update product docs (`docs/studio-configurator-*`, `TECHNICAL-SPEC.md`, marketing briefs) with Experimental Labs tone overview.
- Prepare release notes (Premium transformations now available) and internal rollout checklist (support scripts, help centre).
- Coordinate feature flag strategy if soft launch required (use `featureFlags.rolloutPercentage` & gating toggles).
- Finalise PR summary referencing guardrails, performance impact, QA proof.

### Phase 9 – Post-Launch Monitoring
- Monitor Supabase logs & telemetry dashboards for errors or timeouts specific to new prompts.
- Track adoption metrics via analytics events, gather user feedback on transformations.
- Schedule follow-up tasks: additional lab styles backlog, dynamic lab promotions, asset refresh cadence.
