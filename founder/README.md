# Wondertone Founder Vision — Codex Rebuild

This workspace captures a ground-up exploration of Wondertone as “the world’s greatest AI art company.” It lives outside production code while we iterate quickly.

## Vision Pillars
- **Instant Magic** — every visitor sees transformation within 5 seconds.
- **Story-Driven Commerce** — emotional arcs (memory → art → AR) woven across landing + configurator.
- **Studio-Class Configurator** — launchpad + studio in one responsive canvas.
- **Living Ecosystem** — membership, social proof, creator marketplace hooks for future expansion.

## Roadmap (Founder Cut)
1. **Foundations** — design tokens, layout primitives, GPU-friendly animations, TypeScript-first app shell.
2. **Landing Experience** — cinematic hero with real-time style carousel, AR storytelling, social trust, “Browse or Upload” dual CTA.
3. **Launchpad Studio** — multi-preview rail, guided onboarding, stateful canvas with sticky order rail, micro-upsells.
4. **Commerce & Loyalty** — token bundles, subscription hooks, community gallery, referral loops.
5. **AI Infrastructure** — preview batching, cache telemetry, personalization engine, quality scoring.

## Prototype Stack
- Vite + React 18 + TypeScript
- Tailwind with custom tokens + Radix UI fundamentals
- Zustand for lightweight global state (keeps `useProductFlow` inspirations but founder-led)
- Storybook-ready component structures (optional)

Clone this `founder` workspace into a branch when Git permissions allow: `git checkout -b founder/vision && git add founder/*`.

## Quick Start
1. `cd founder`
2. `npm install`
3. `npm run dev`
4. Visit `http://localhost:4175` for the founder landing + studio demo.

> Note: Tailwind requires the Vite build step; ensure the dev server runs from inside the `founder` directory.
