# Wondertone - AI-Generated Canvas Artwork

Wondertone is a premium e-commerce experience that transforms personal photos into AI-generated canvas artwork. The application is designed around fast performance, refined UX, and long-term maintainability.

## Core Features

- **AI Art Generation** – Upload a photo and explore curated AI art styles.
- **Four-Step Configurator** – Guided flow for style selection, canvas sizing, customization, and checkout.
- **Augmented Reality "Living Memory"** – Optional video moments linked to the canvas via QR code.
- **Secure Payments** – Stripe-powered checkout plus token purchases for watermark-free downloads.

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State & Data:** Custom hooks with React Query, Supabase SDK
- **Backend / Edge:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI Providers:** Replicate + OpenAI
- **Payments:** Stripe

## Local Development

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Configure environment**
   - Copy project secrets (ask the founders) into a `.env` file. At minimum the frontend expects `VITE_SUPABASE_URL` for preview polling; other keys are provided through Supabase edge functions.
3. **Run the dev server**
   ```sh
   npm run dev
   ```
   - Vite serves the app on `http://localhost:8080/`.
4. **Run quality checks before committing**
  ```sh
  npm run lint
  npm run build
  npm run build:analyze   # optional treemap, opens dist/stats.html
  npm run deps:check
  ```
  These match the default checklist enforced in `agents.md` and the founder workflow.

5. **CI expectations**
   - GitHub Actions runs lint, tests, production builds, bundle analysis, and bundle-size enforcement on every PR targeting `main` (`.github/workflows/ci.yml`).
   - The workflow fails if key entry bundles exceed their budgets; replicate locally with:
     ```sh
     npm run build
     node scripts/verify-bundle-sizes.cjs
     ```
   - Keep builds deterministic—use `npm ci` locally when validating before pushing.

## VS Code Workflow

Wondertone uses a VS Code-first process—create a branch, review diffs in-editor, and run NPM scripts via the sidebar. See `FOUNDER_WORKFLOW.md` for the button-by-button guide and `agents.md` for daily guardrails.

## Supabase & Edge Functions

Edge logic (preview generation, payments, watermark removal) lives under `supabase/functions/`. The frontend calls these functions rather than hitting AI providers directly, so keep those endpoints available during development. For more architectural detail, check `.github/copilot-instructions.md` and `agents.md`.
