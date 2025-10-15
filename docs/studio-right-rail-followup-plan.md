# Studio Right Rail Progressive Disclosure – Follow-up Fix Plan

Goal: polish Claude’s implementation so the progressive-disclosure flow is accessible, discoverable, and resilient on both mobile and desktop—without regressing the high-performing desktop experience.

---

## Phase 1 – Essential Fixes (Completed)

1. **Token Counter Visibility**
   - File: `src/components/studio/ActionRow.tsx`
   - Replace `entitlements?.tokens_remaining` with `entitlements?.remainingTokens`.
   - Guard for `null` and pluralization (`token/tokens`).
   - Confirm the value updates after downloads (entitlement hydrate happens post-download today).

2. **Canvas CTA Accessibility**
   - File: `ActionRow.tsx`
   - Add `aria-expanded` / `aria-controls` to the “Create Canvas” button.
   - Provide `id` on the accordion container (`CanvasConfig.tsx`) to match.
   - Ensure button text remains unchanged for screen readers.

3. **Drawer History Safety**
   - File: `MobileStyleDrawer.tsx`
   - Wrap the `window.history.back()` cleanup in a try/catch and check `window.history.state?.drawer === 'open'` before popping.
   - Add boolean guard to avoid double-pop when the user manually closes and then presses back.

---

## Phase 2 – UX Enhancements (Completed)

4. **Canvas Preview Discoverability**
   - Files: `StickyOrderRail.tsx`, `CanvasConfig.tsx`
   - Allow the “Create Canvas” button to open the panel even if `hasFinalizedPhoto` is `false`.
     - Keep primary controls disabled, but show the size list/order summary in a muted state with a tooltip (“Finalize your photo to order.”).
     - Maintain existing disable logic for checkout CTA.

5. **Mobile Sticky Bar Safety Margin**
   - File: `ActionRow.tsx` (sticky mini-bar)
   - Replace hard-coded `top-14` with `style={{ top: \`calc(env(safe-area-inset-top, 0px) + 56px)\` }}` or matching CSS utility.
   - Add `padding-inline` so it doesn’t clash with edge-to-edge gestures.

---

## Phase 3 – Accessibility & Motion Polish (Completed)

6. **Focus Management & Motion Alternatives**
   - Files: `CanvasConfig.tsx`, `ActionRow.tsx`
   - When the canvas panel opens:
     - Focus the first size button (`ref.focus()` after animation completes) unless `prefers-reduced-motion`.
     - Add `prefers-reduced-motion` detection to skip the scroll animation (legacy support already partly in place).
   - Ensure accordion close returns focus to the toggle button.

---

### Testing Checklist
- **Manual:** iOS Safari + Android Chrome; keyboard-only navigation; VoiceOver/TalkBack; rapid tapping on the Download/Canvas buttons; open/close drawer repeatedly.
- **Regression:** Desktop (lg+) unaffected; download flow still honors entitlements; orientation changes keep state.
- **Analytics sanity:** CTA click events still fire after code changes; new disabled state doesn’t break telemetry.

This staggered plan is now delivered end-to-end; future iterations can focus on personalization experiments and analytics-informed refinements.
