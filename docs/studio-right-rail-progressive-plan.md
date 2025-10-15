# Studio Right Rail – Progressive Disclosure Plan

## Overview
Rework the Studio configurator’s right rail so users see two clear “next steps” (download vs canvas) without burying either revenue stream. Canvas preview remains visible at all times; orientation controls stay put. The new rail progressively reveals detail only when the user asks for it.

---

## Phase 1 · Quick Win (1–2 hrs)
**Goal:** Ship a fast, low-risk restructure that surfaces both exits and removes clutter.

**Primary files to touch**
- `src/sections/StudioConfigurator.tsx` (right-rail layout, action row, accordion wrapper)
- `src/components/studio/StickyOrderRail.tsx` (any shared utilities reused in the accordion)
- `src/components/modals/DownloadUpgradeModal.tsx` (ensure download CTA hooks in cleanly)
- `src/styles/studio.css` or tailwind utility additions (divider, spacing tweaks)

1. **Right Rail Stack**
   - Keep `Orientation` buttons at the top.
   - Insert an “Action Row” directly below:
     - `Download HD` button (secondary styling).
     - `Order Canvas` button (primary styling).
     - Under each button, add a 1-line value prop (e.g., “Instant 4K files • Uses 1 token” vs “Handcrafted gallery canvas • Ships in 5 days”).
   - Add a subtle divider line below the action row (`border-t border-white/10`).

2. **Canvas Config Collapsed by Default**
   - Wrap existing Canvas Size, Enhancements, Living Canvas, and Order Summary inside an accordion/panel titled “Canvas Options”.
   - Default state is collapsed.
   - Tapping `Order Canvas` expands the panel (no hard animations needed yet) and scroll-locks the rail so the expanded content is in view.
   - Persist any selections in Zustand so collapsing doesn’t reset choices.

3. **Download Path**
   - Tapping `Download HD` triggers the existing tier gate:
     - If user has entitlement: show inline confirmation/spinner, then success toast.
     - If not: show upgrade modal / paywall.

4. **Resulting Flow**
   - User sees the art, adjusts orientation, and immediately encounters two obvious next steps.
   - Digital-first users avoid canvas clutter.
   - Canvas shoppers still reach familiar controls with one tap.

---

## Phase 2 · Optimization (3–4 hrs)
**Goal:** Polish hierarchy, motion, instrumentation, and make each path persuasive.

**Primary files to touch**
- `src/sections/StudioConfigurator.tsx` (button styling updates, animation triggers)
- `src/components/ui/Button.tsx` or utility tokens for gradient/outline variants
- `src/components/studio/CanvasInRoomPreview.tsx` (auto-scroll focus hooks if needed)
- `src/utils/telemetry.ts` & analytics wiring for new event names
- `src/styles/studio.css` or global animation definitions

1. **Visual Hierarchy**
   - Style buttons: `Order Canvas` as primary gradient; `Download HD` as ghost/outline.
   - Update microcopy to emphasize emotion vs utility (“Turn this into wall art” vs “Instant 4K JPEG”).

2. **Motion & Feedback**
   - Add a 200 ms ease animation when expanding/collapsing the canvas panel (height + opacity).
   - Auto-scroll the first canvas subsection into view (e.g., size grid) when expanded.
   - After a download success, surface a toast offering a canvas upsell (“Make it a canvas in 5 days?”).

3. **Analytics & Experiments**
   - Track `cta_download_click`, `cta_canvas_click`, `canvas_panel_open`, `download_success`, `order_started`.
   - Prepare for an A/B test: swap button order (canvas vs download first) and monitor revenue per session.
   - Record dwell time inside the canvas panel (opening but not ordering) for future funnel insights.

4. **Mobile Enhancements**
   - On small screens, keep the two buttons within thumb reach (sticky mini-bar when the user scrolls past them).
   - Canvas panel can open as a bottom sheet drawer with the same content, matching native patterns.

5. **Conversion Touches**
   - Surface token balance next to `Download HD` to encourage upgrades.
   - When users open the canvas panel, highlight reviews/testimonials or Living Canvas upsell inside the section.

---

## Phase 3 · Personalization (Future)
**Goal:** Adapt the rail to individual behavior to lift lifetime value.

**Primary files to touch**
- `src/store/useFounderStore.ts` (persisting canvas/download preferences)
- `src/utils/localPreferences.ts` or new helper for localStorage personalization
- `src/utils/telemetry.ts` (feeding events into lifecycle automation)
- `src/sections/StudioConfigurator.tsx` (conditional default states based on stored preference)
- Marketing/lifecycle hooks (e.g., PostHog/Supabase triggers) once the data is available

1. **Preference Memory**
   - Store the user’s last chosen path (localStorage or user profile).
   - If they always download, keep canvas collapsed and prompt them with digital-focused copy.
   - If they often explore canvas, auto-open the canvas panel on return visits.

2. **Contextual Nudges**
   - After a download success, offer a limited-time canvas discount with “Convert this to canvas” CTA.
   - If the user has a canvas history, preselect their previous size/frame for faster checkout.

3. **Dynamic Messaging**
   - Rotate CTA copy based on behavior (scarcity, emotional resonance, bundle offers).
   - Add cross-sell modules (frames, gift cards) once the canvas panel is open.

4. **Data Feedback Loop**
   - Feed CTA interactions into lifecycle marketing (emails, reminders).
   - Use aggregated data to inform product decisions (e.g., auto-expanding the panel for users who frequently browse sizes but never purchase).

---

## Experience Summary
1. **Orientation** always available at the top.
2. **Two primary CTAs** (“Download HD” and “Order Canvas”) visible immediately.
3. **Canvas configurator** only expands when requested, keeping the interface calm.
4. **CanvasPreview** remains on-screen at all times, reinforcing premium intent.
5. **Future layers** personalize the rail without inventing complex modes.

This structure offers a fast digital exit, preserves canvas visibility, and scales into intelligent upsells as Wondertone learns from user behavior.
