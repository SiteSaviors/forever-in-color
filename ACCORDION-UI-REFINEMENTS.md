# Accordion UI Refinements (Post-Implementation)

**Status**: Bookmarked for next implementation phase
**Priority**: High (UI/UX polish)
**Context**: Desktop screenshot review on 2025-10-17

CODEX ANALYSIS

Here’s what stood out while reviewing the staged accordion work:

StyleAccordion is calling showUpgradeModal with non-existent props (message, reason) instead of the description signature the hook exposes (src/sections/studio/components/StyleAccordion.tsx:35). That will throw a type error and the modal won’t render anything.
The same file logs StepOne analytics with a shape our union type doesn’t accept—emitStepOneEvent({type:'tone_style_locked', value, metadata}) (StyleAccordion.tsx:57, 81). The only valid fields are styleId, tone, requiredTier; so telemetry is currently broken.
There’s duplicate gating logic in StyleAccordion: we’re looking up section.styles to block locked styles and show modals, but useHandleStyleSelect already evaluates the gate and fires the onGateDenied callback. It’s cleaner to pass handleGateDenied into the hook (as we do in StudioConfigurator) and let it drive the modal, otherwise we risk the gate state getting out of sync.
useEffect(() => {...}, []) at the top of StyleAccordion prefetches thumbnails but references toneSections/prefetchThumbnails without dependencies, so it only ever runs once and eslint will flag it. If you keep the effect, add the dependencies or move prefetch into the toggle handler.
OriginalImageCard triggers emitStepOneEvent({ type: 'tone_style_select', value: ... }) before delegating to useHandleStyleSelect; that duplicates logging and uses the wrong property (OriginalImageCard.tsx:21). The hook already emits the correct event.
We’ve removed the reusable tone-section prefetch hook from the mobile drawer, but the replacement prefetch calls new Image() for every expansion and doesn’t guard against re-running. It would help to either track hasPrefetched or re-use the existing helper to avoid hammering the network.
Mobile drawer auto-closes via an effect watching selectedStyleId, which is a nice touch, but note the drawer no longer prevents interaction while styles are locked—aria-disabled is set, yet there’s no explicit modal prompt unless we pass the same gate handler through the hook.
Overall polish: expanding a tone being a full-width centered button feels more like a filter chip than an accordion section. Consider keeping icons/labels left-aligned, and maybe preserving multi-section visibility on desktop so the user isn’t forced to toggle constantly. Performance-wise the screenshot looks great, but the code needs the fixes above before it’ll compile cleanly.

CODEX THOUGHTS - From a UI / animations / upgrade perspective:

If we want the left rail to feel like Wondertone—not just “accordion” UI—lean into the brand’s cinematic, art-studio energy. Here’s how I’d push the visual/motion language:

Color & Lighting

Give each tone a subtle gradient “wash” that feels like a painter’s palette. Example: Trending → magenta→tangerine, Classic → sepia→cream, Electric → neon violet→cyan.
Fade that gradient into a softly blurred background layer (CSS backdrop-filter) so the UI feels like it’s lit by studio gels.
Add a rotating gradient edge or glow on the currently open section to mimic gallery lighting catching a frame.
Typography & Iconography

Headings in something charismatic like Clash Display or Recia for section titles; keep body copy in a clean sans (e.g., General Sans, Inter).
Use small tone-specific glyphs—paint strokes, neon strokes, charcoal smudges—rather than stock emojis. You can inlay these into the icon circle with SVG masks.
Tone Sections

When a tone expands, let the section slide open on a z-axis: scale the entire card to 1.02 with a soft drop shadow so it feels like it’s lifting off the sidebar.
Add a gentle gradient sweep on hover (CSS background-position animation) to emulate light passing over a framed canvas.
Within the section, highlight one “hero” style with a larger card and add a mini marketing snippet (“Best for portraits under golden hour”); let the rest remain smaller tiles.
ToneStyleCard Interactions

Introduce a parallax hover effect: move the thumbnail 2–3px opposite cursor direction (GPU-friendly transform).
Add a shimmer highlight to the badge row using a mask animation (background: linear-gradient; background-size: 200%).
For locked cards, use a translucent “glass” overlay, thin gold border, and animated lock icon (subtle bounce or pulse) to sell premium value.
Micro Interactions

When a user selects a style, play a 120ms scale/opacity animation and leave behind a soft “ink blot” ripple in the tone color.
For favorites (phase 4), animate the star with a path-drawing or starburst particle effect using clip-path or a small Lottie.
When a tone section expands, have the tone icon rotate 15° then settle back, and slide the chevron with easing (cubic-bezier(0.34, 1.56, 0.64, 1)).
Upgrade Modal & Toasts

To match the premium tone, add dynamic imagery in the modal header: use a blurred background preview of the selected style and overlay the Wondertone logo watermark.
Include per-tone copy from the catalog (marketingCopy) in the modal so it reads like “Unlock Aurora Signature: luminous aurora light, priority rendering, watermark-free exports.”
Mobile and Drawer

Rather than stacking everything vertically, use horizontally swipeable tone chips at the top (like pill tabs), with the accordion beneath. This reduces vertical thrash.
Add a snap scroll effect (CSS scroll-snap-type) inside the drawer so each tone section feels like paging through art prints.
Performance & Implementation Notes

Rely on GPU-accelerated transforms (translate, scale, opacity) for animations; avoid animating box-shadows directly—use pseudo-elements for glowing edges.
Prefetch tone thumbnails gradually: load hero first, then others via requestIdleCallback or intersection observer—don’t spin up dozens of new Image() calls at once.
Keep motion accessible: tie major animations to prefers-reduced-motion and offer simplified transitions for those users.
Applying this treatment will make the left rail feel like Wondertone’s signature surface—immersive, aspirational, and unmistakably premium—rather than a straightforward accordion.
