# Integration Notes

## Existing Contracts to Respect
- `src/components/product/hooks/useProductFlow.ts`: step gating, orientation resets, preview clearing.
- `src/components/product/components/PhotoAndStyleStep.tsx`: StepOne provider + telemetry interactions.
- `src/components/product/hooks/usePreviewGeneration.ts`: single source for preview generation; uses Supabase edge function.
- `src/utils/stylePreviewApi.ts`: Supabase invocation contract (session, aspect ratio, watermark).
- `src/utils/previewGeneration.ts`: watermark manager, polling, persistence.
- `src/hooks/useStripePayment.ts`: Stripe checkout invocation, token purchase flow.
- Supabase edge functions under `supabase/functions/`: `generate-style-preview`, `remove-watermark`, `create-payment`.

## Adapter Plan
- Build new founder store mirroring key outputs of `useProductFlow` for compatibility.
- Provide analytics adapters to forward StepOne events to existing listeners during migration.
- Ensure preview request payloads remain compatible with Supabase edge functions.
- Wrap Stripe invocations with new UI while keeping body schemas untouched.

## Data Sources
- Supabase: previews, purchases, tokens.
- Stripe: checkout session URLs.
- React Query currently minimal; founder state will rely on Zustand + direct fetch with caching.

## Phase 2 Notes
- Preview client reads optional `VITE_FOUNDER_PREVIEW_ENDPOINT` and `VITE_FOUNDER_PREVIEW_TOKEN` environment variables to hit Supabase edge functions; mock previews fallback automatically when unset.
- Sticky order rail + Living Canvas modal mirror production bundle logic while staying store-driven.
- Launchpad upload pipeline uses FileReader + canvas utilities for smart crop; orientation detection mirrors `detectOrientationFromImage` behaviour.
- Manual crop leverages `react-easy-crop`; integrate with production Cropper by swapping data URL helpers with existing utilities.
