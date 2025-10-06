
## Launchpad & Studio Prototype (2025-XX Codex)

- Location: `prototypes/launchpad-prototype/index.html`
- Purpose: visual walkthrough of the proposed hero carousel → launchpad → studio flow without touching production routes or build pipes.
- How to preview:
  1. Open the HTML file directly in a browser (`open prototypes/launchpad-prototype/index.html` on macOS).
  2. Use the hero CTA / “Browse Styles First” buttons to scroll between sections.
  3. Click “Try This Style” on any card to update the hero preview and status rail (simulated pre-generation).
- Notes:
  - Tailwind CDN + lightweight vanilla JS powers the layout for speed; no bundler or React runtime required.
  - Buttons like “Upload Photo” and “Complete Order” are illustrative only—no network or state mutations occur.
  - The summary sidebar and studio pricing reflect the recommended UX but remain static placeholders pending production integration.
