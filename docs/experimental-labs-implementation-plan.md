## Experimental Labs – Implementation Blueprint

### Phase 0 – Discovery & Guardrail Alignment
- Re-read core guardrail docs: README.md, FOUNDER_WORKFLOW.md, agents.md.
- Validate tone architecture: `STYLE_TONE_DEFINITIONS`, `toneGradients`, `registryLazy`.
- Confirm Supabase expectations: `preview_styles` schema, prompt sourcing, edge deployment flow.
- Capture constraints: bundle ceiling (`dist/assets/index-*.js ~567 KB`), telemetry guarantees (`emitStepOneEvent`, gating), VS Code-first workflow.

### Phase 1 – Tone Definition & Visual System
- Extend `STYLE_TONE_DEFINITIONS` with `experimental`; craft label, description, icon semantics, sort order (after Signature).
- Update `STYLE_TONES_IN_ORDER`, ensuring downstream hooks naturally pick up the tone.
- Add `Experimental Labs` gradient entry in `toneGradients.ts` (panel, ambient, highlight colors); align texture and opacity with existing drawers.
- Provide a tone icon in `toneIcons.ts` (eg. flask/atom) that fits visual language (stroke widths, animation states).
- Output: design tokens validated in Storybook/Chromatic for tone header.

### Phase 2 – Style Catalog Authoring
- Define 8 premium transformations (eg. Ice Sculpture, Bronze Statue, Gummy Candy, Action Figure, Lava Core, Marble Bust, Origami Paper, Neon Gel).
- For each style: finalize `id`/`slug`, tier metadata (`requiredTier: 'creator'`, `defaultUnlocked: false`), badges, marketing copy, story hooks.
- Provision high-quality base thumbnails & previews (JPG master ≥2048px). Generate optimized `webp`/`avif` derivatives via `sharp`.
- Insert entries into `registry/styleRegistrySource.ts` with accurate `numericId` placeholders (coordinate with Supabase).
- Update asset validation map if any style skips preview/thumbnail checks.

### Phase 3 – Prompt & Supabase Coordination
- Insert prompt rows into `docs/style_prompts_rows.json` with unique UUIDs, timestamps, and sanitized prompt text for each `style_id`.
- Mirror rows in Supabase `preview_styles` (numeric IDs 40–47 or next available). Verify prompt indexing & rollout flags.
- Add telemetry metadata if needed (eg. internal tracking tags via `badges` or `featureFlags.disabledReason`).
- Sync with backend team to confirm generate-style-preview path handles new transformations (temperature, engine).

### Phase 4 – Code Generation & Typing
- Run `npm run build:registry` to regenerate:
  - `src/config/styles/styleRegistry.generated.ts`
  - `src/config/styles/tones/experimentalTone.generated.ts`
  - `supabase/functions/_shared/styleRegistry.generated.ts`
  - `src/config/styles/registryCore.generated.ts`
- Inspect generated tone file to ensure assets, prompts, badges populated.
- Update type exports if necessary (enum additions).
- Commit generated artifacts as part of isolated change set.

### Phase 5 – UI Integration & UX Validation
- Verify `useToneSections` picks up the new tone; ensure gating logic marks section as locked when user lacks tier.
- Adjust `toneCardStagger`/animation tokens if needed for new tone density.
- Confirm `StyleAccordion` renders the drawer with correct gradient and extended sort order (set `collapsedTones` defaults if necessary).
- QA in Studio: open Experimental Labs drawer, scroll, check parallax/hover interactions (ToneStyleCard). Validate favourites or gating states.
- Ensure `ToneStyleCard` invests iconography/badges for transformations (eg. “Lab” badge or new icon).

### Phase 6 – Telemetry & Analytics
- Confirm `emitStepOneEvent` events include `tone: 'experimental'` for view/select/locked states.
- Audit Launchflow analytics / Studio feedback to ensure new tone surfaces in dashboards.
- Add tracking for style usage in `galleryQuickviewTelemetry` if necessary.
- Update documentation for analytics team (events dictionary).

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

