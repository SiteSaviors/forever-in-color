# Wondertone – Current State & Next Steps (October 2025)

## App Snapshot
- **Codebase**: `src/` now runs the former founder flow (landing, launchpad, studio).
- **Navigation**: `FounderNavigation` mounted on both home and studio pages.
- **Canvas Sizes**: Orientation-aware pricing lives in `src/utils/canvasSizes.ts`; UI adapts per orientation.
- **Crop Flow**: Orientation changes open a cropper, persist the new crop, and force a refreshed preview.
- **Spec Docs**:
  - `TECHNICAL-SPEC.md` – architecture, entitlement rules, rollout plan.
  - `docs/canvas-size-upgrade-plan.md` – detailed pricing matrix & implementation notes.

## Outstanding Initiatives
1. **Auth + Tokens (Phase 1)**  
   - Reintroduce Supabase Auth (anonymous + email).  
   - Persist anonymous quotas (5 soft / 10 hard) and hydrate `freeTokensRemaining`.  
   - Soft prompt after 5 previews, hard gate at 10. Always watermark.

2. **Stripe Subscription Integration (Phase 2)**  
   - Supabase tables: `anonymous_tokens`, `preview_logs`, `subscriptions`.  
   - Edge function enforces quotas, returns `requires_watermark`.  
   - Stripe webhooks update quotas (Creator 50, Plus 250, Pro 500 per month).  
   - Client surfaces remaining tokens & upgrade modals.

3. **Telemetry**  
   - Mirror preview events to Supabase/PostHog, alert on abuse.
   - Track conversion funnel (anonymous → signup → subscription).

## Testing Account Consideration
- Introduce a server-side flag for specific user IDs (e.g., `profiles.dev_override = true`) that bypasses quotas and watermark checks.  
- Edge function should treat flagged accounts as `requires_watermark = false` and skip token deduction.  
- Never rely on client-side checks for this bypass.

## Immediate TODOs
- Implement Supabase client + auth wiring.  
- Add anonymous token issuance & gating in `useFounderStore`.  
- Sketch Stripe webhook handler + entitlement update flow (service key).  
- Design upgrade modal content aligning with Creator/Plus/Pro tiers.  
- Create developer test account flag (see above) to support QA without limits.

This brief, combined with `TECHNICAL-SPEC.md`, should give the next agent everything needed to continue.
