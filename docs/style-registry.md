## Wondertone Style Registry – Contributor Guide

The style selector now derives all metadata from a single generated registry. This guarantees Supabase prompt IDs, frontend catalog data, and operational flags stay in sync.

### Source of Truth

- `registry/styleRegistrySource.ts` – hand-edited metadata (slug, tone, tier, assets, rollout defaults).
- `docs/style_prompts_rows.json` – export of Supabase `style_prompts` table (numeric IDs + prompt text).

Use these inputs to regenerate runtime artifacts:

```bash
npm run build:registry
```

This command generates:

- `src/config/styles/styleRegistry.generated.ts` – typed data for the frontend.
- `supabase/functions/_shared/styleRegistry.generated.ts` – lightweight map for edge functions.

### Validation Workflow

1. Update `registry/styleRegistrySource.ts` with new style metadata (include numeric ID once provisioned in Supabase).
2. Ensure Supabase prompts exist in `docs/style_prompts_rows.json` (export fresh rows if needed).
3. Run `npm run build:registry` to regenerate artifacts.
4. Run `npm run validate:registry` – fails if generated files are out of date or if assets/prompts are missing.
5. Commit both generated files and source changes together.

### Adding a New Style

1. Reserve a numeric ID in Supabase and insert the prompt via migration.
2. Add the style entry to `registry/styleRegistrySource.ts` (set feature flags, sort order, assets).
3. Drop the thumbnail(s) into `public/art-style-thumbnails/`.
4. Run the generator + validator and commit results.

### Supabase Prompt Workflow

- Migrations in `supabase/migrations/*_style_prompts.sql` seed/update the `style_prompts` table. Run `supabase db push` before deploying new styles.
- The edge runtime imports `EDGE_STYLE_REGISTRY`; prompt warmup iterates every enabled style with a numeric ID. No environment variable is required, but you can override with `PROMPT_CACHE_WARMUP_STYLES` if needed.
- `StylePromptService.resolveStyleId` now throws when a style name/slug is unknown or missing a numeric ID, preventing silent fallbacks. Keep the registry and Supabase in sync to avoid runtime errors.
- To validate prompts locally, refresh `docs/style_prompts_rows.json` from Supabase; `npm run build:registry` will fail if any numeric ID lacks a prompt.

### Runtime Notes

- Feature flags default to `isEnabled: true`, `rolloutPercentage: 100`. Adjust as needed.
- Asset validation is enforced unless explicitly disabled (e.g., for placeholders). Supply assets whenever possible.
- Edge functions now fail fast if a style name/slug is unknown or lacks a numeric ID, preventing silent prompt fallbacks.

Keep this document updated as the registry evolves.
