# Style Card “Ready” Indicator – Implementation Plan

## Goal
Help shoppers understand which styles already have a cached preview ready to revisit. When a generation completes:

- Highlight the thumbnail with a **gold gradient frame**.
- Add a **diagonal “READY” ribbon** across the lower‑right corner.
- Keep the rest of the card layout untouched so long titles remain readable.

## Visual spec

| Element | Treatment |
| --- | --- |
| Border | 2 px stroke, rounded to match the thumbnail (`rounded-[22px]`). Use a metallic gradient: `linear-gradient(135deg, #FDEC8B 0%, #E2A93B 48%, #F9D95D 100%)`. Add an outer glow (`0 0 18px rgba(249, 217, 93, 0.35)`) for warmth. |
| Ribbon | Place inside a rotated container (`transform: rotate(-32deg)`) anchored bottom-right. Background: `linear-gradient(135deg, rgba(183, 255, 83, 0.92), rgba(132, 229, 53, 0.78))`. Outline with `1px solid #2C6512`. Text: uppercase “READY”, `font-weight: 700`, tracking `0.06em`, shadow `0 2px 6px rgba(0,0,0,0.25)` for legibility. |
| Animation | When a preview first finishes, fade the border from 0→1 and slide the ribbon in (`translate(12px, 12px)` → `translate(0,0)` over 220 ms with an easing or spring). Remove instantly if the preview is invalidated. |
| Accessibility | Ribbon container should expose `aria-label="Preview ready"`; the card can optionally announce a polite live region message (“Preview for Watercolor Dreams is ready”). |

## State detection

Reuse preview store data:

```ts
const readyState = usePreviewStore((state) => state.previews[styleId]);
const hasReadyPreview =
  readyState?.status === 'ready' &&
  (readyState.data?.previewUrl || readyState.data?.storagePath || readyState.data?.storageUrl);
```

Additionally, confirm the style isn’t in a transient state (`orientationPreviewPending`, etc.) before showing the cue.

## Component changes

1. **Tone mapping (`useToneSections.ts`)**
   - While building `ToneSectionStyle`, compute `hasReadyPreview` using the logic above.
   - Include the flag in each style entry.

2. **`ToneStyleCard.tsx`**
   - Accept a `hasReadyPreview` prop.
   - Wrap the thumbnail in a `relative` container with a conditional modifier class (`thumbnail--ready`).
   - Render the ribbon markup only when `hasReadyPreview` is true.

3. **Styling**
   - Add CSS (module, Tailwind component class, or styled component) for `.thumbnail--ready` and `.thumbnail--ready .ready-ribbon`.
   - Ensure `pointer-events: none` on the ribbon to avoid blocking clicks.

4. **Animation hook**
   - Use a `useEffect` to trigger a `motion.div` or CSS keyframe when `hasReadyPreview` transitions from false → true.

5. **Testing**
   - Unit: mock preview store to ensure the ribbon appears/disappears per state.
   - Integration: confirm selecting a ready style toggles the viewport without extra requests.
   - Visual QA across desktop/mobile, dark/light gradient backgrounds.

## Optional telemetry

If desired, emit `trackStyleReady({ styleId, tone })` when the status flips. This is optional and can be added later.

## Handoff checklist

- [ ] `hasReadyPreview` computed and passed into `ToneStyleCard`.
- [ ] Gold border + ribbon appear only when preview cache exists.
- [ ] Animations smooth, no layout shift.
- [ ] Ribbon and border colors meet contrast (WCAG AA).
- [ ] Storybook or Chromatic capture showcasing both states.

Once implemented, rerun `npm run test`, `npm run lint`, and `npm run build` to validate the change set.
