# Wondertone Founder Vision

## Mission
Become the world’s most trusted AI art house—turning memories into living stories across physical, digital, and augmented canvases.

## Experience North Stars
1. **Time-to-Wow < 10s**: Visitors should see their own art transform before they finish reading the hero copy.
2. **Studio Flow Ownership**: Launchpad + Studio orchestrate every product interaction; no more multi-panel friction.
3. **Living Canvas as marquee**: AR storytelling is the brand differentiator—highlight it in landing, configurator, and post-purchase loops.
4. **Community flywheel**: Build towards creator drops, galleries, referrals, and tokenized unlocks.

## Product Pillars
- **Landing Cinematics**: autoplay transformations, style carousel with “Try this style”, Living Canvas storytelling, social momentum ticker.
- **Launchpad**: Upload, smart crop, multi-style preview rail, StepOne telemetry, guided progress.
- **Studio**: Dual-pane layout, sticky order rail, dynamic pricing, micro-upsells, trust injection.
- **Commerce**: Simplified guest checkout, upsell bundling, membership/hooks for future tokens.
- **Infrastructure**: Preview batching, Supabase edge caching, analytics + experimentation, QA automation.

Use this document as the canonical guide while iterating in the `founder` workspace.

## North Star Storyboard
1. **Hero (0–5s)**
   - Cinematic transformation reel + dual CTA (“Upload Photo” / “Browse Styles”).
   - Social momentum ticker shows live creations + reviews.
2. **Launchpad (5–20s)**
   - Upload or use sample photo; smart crop + orientation detection.
   - Intelligent style grid streams multi-preview rail; blur skeletons reduce perceived wait.
   - StepOne telemetry tracks sub-steps, unlocks Studio CTA.
3. **Studio (20–60s)**
   - Dual-pane layout keeps canvas in view while editing size, frames, Living Canvas, tokens.
   - Sticky order rail mirrors bundle pricing, progress badge, trust signals.
   - Living Canvas micro-modal triggers after first preview success; shares QR demo option.
4. **Checkout & Celebration (60s+)**
   - Guest-first Stripe checkout (Apple Pay/Google Pay) with email capture.
   - Post-purchase screen offers instant digital download, referral link, gallery submission prompt.

## Integration Touchpoints
- **Telemetry**: `StepOneExperienceProvider`, `SmartProgressIndicator`, social momentum widgets—must emit compatible events or adapter layer.
- **Preview Pipeline**: `usePreviewGeneration`, `stylePreviewApi`, Supabase edge function `generate-style-preview`, watermark manager.
- **Payments**: `useStripePayment`, Supabase functions `create-payment`, `remove-watermark`, token RPCs.
- **Upsells/Order**: Pricing calculators (`PricingSummary`, `OrderActions`), LivingMemory components, token purchase modal.
- **Analytics**: performance monitor hooks, social momentum signals, existing GA/Segment wiring (if present).

## Success Metrics
- **Time-to-wow**: < 10 seconds from upload to first preview (P95).
- **Living Canvas attach rate**: ≥ 20% of canvas purchases include AR add-on.
- **Checkout start rate**: ≥ 60% of users who reach Studio click “Complete Order.”
- **Upload completion**: ≥ 75% of hero CTA clicks result in a successful upload.
- **Return intent**: 30% of purchasers opt into digital bundle or membership prompt.

## Phase Progress Snapshot
- **Phase 1** complete: visual system, landing narrative, launchpad/studio scaffolding delivered.
- **Phase 2** underway: preview pipeline wired with optimistic skeletons, telemetry emitting sub-step events, Living Canvas modal + sticky rail in place.
