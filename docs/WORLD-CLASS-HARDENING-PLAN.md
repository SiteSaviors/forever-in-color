# Wondertone World-Class Hardening Plan

## Overview

This document captures the end-to-end roadmap for taking Wondertone from “leaning” to **world-class**. Each initiative is prioritized by security impact, customer risk, and long-term maintainability. For every task you’ll find:

- **Risk** — What breaks if we ignore it.
- **Implementation Plan** — Concrete steps, owners, and dependencies.
- **Signals of Success** — How we know the fix sticks.
- **Notes & Open Questions** — Anything we still need to clarify before shipping.

## Prioritized Initiatives

| Order | Initiative | Core Theme | Primary Owner |
| ----- | ---------- | ---------- | ------------- |
| 1 | Lock down gallery image ingestion | Security | Edge / Backend |
| 2 | Harden preview generation inputs | Security | Edge / Backend |
| 3 | Normalize gallery persistence | Data integrity | Edge / Backend |
| 4 | Streamline gallery delivery pipeline | Performance / Cost | Edge + Frontend |
| 5 | Modularize state & studio flows | Architecture | Frontend |
| 6 | Establish automated test coverage | Quality | Platform |
| 7 | Add CI guardrails (bundle + lint/test gates) | DX | Platform |
| 8 | Trim dependencies & centralize fetch headers | Maintainability | Frontend |
| 9 | Document architectural guardrails | Culture | Platform |

---

## 1. Lock Down Gallery Image Ingestion

- **Risk**
  - Current `save-to-gallery` accepts any `imageUrl`, enabling SSRF against internal services or storing arbitrary payloads.
  - If exploited, attackers can exfiltrate metadata or poison storage/CDN.
- **Implementation Plan**
  1. Update `save-to-gallery` to require a signed Supabase storage path (`bucket/object`), rejecting absolute URLs.
  2. Verify the supplied path belongs to Wondertone’s public bucket using Supabase SDK before insertion.
  3. Add unit tests + integration test with Supabase CLI to cover valid/invalid submissions.
  4. Create migration/backfill script to normalize existing rows (drop non-Wondertone URLs).
- **Signals of Success**
  - Supabase audit logs show no external-origin URLs stored in `user_gallery`.
  - Integration tests run in CI and fail on malicious payloads.
- **Notes & Open Questions**
  - Confirm whether legacy mobile apps rely on absolute URLs. If yes, coordinate migration plan.
  - Decide if we want to rotate gallery tokens post-cleanup.

## 2. Harden Preview Generation Inputs

- **Risk**
  - `generate-style-preview` fetches arbitrary URLs supplied by the client.
  - Attackers can leverage SSRF or force large file downloads, DoS-ing the edge.
- **Implementation Plan**
  1. Restrict preview inputs to Wondertone storage paths or vetted signed URLs.
  2. Implement allowlist + private CIDR guard before fetch.
  3. Enforce payload size limits (e.g., abort requests >15 MB).
  4. Add structured logging and metrics for rejected requests.
- **Signals of Success**
  - Edge function rejects non-Wondertone origins with `4xx`.
  - Resource usage on Supabase edge decreases during known scraping spikes.
- **Notes**
  - Coordinate with frontend to ensure uploads go through the blessed pipeline (no regression of legitimate flows).

## 3. Normalize Gallery Persistence

- **Risk**
  - `user_gallery` rows store full URLs (possibly data URIs) in both `watermarked_url` and `clean_url`.
  - Bloat, inconsistent data, and easier attack surface.
- **Implementation Plan**
  1. Add migration that introduces `storage_path` (bucket/object) column.
  2. Backfill existing rows → parse and store canonical path; drop raw URL columns after verification.
  3. Update edge functions + frontend API helpers to read/write `storage_path` and construct URLs server-side.
- **Signals of Success**
  - Database size drops; columns normalized.
  - API clients consume only derived URLs (no raw persisted strings).
- **Notes**
  - Ensure RLS policies still hold after schema change.

## 4. Streamline Gallery Delivery Pipeline

- **Risk**
  - Listing the gallery currently composites a watermark per item in real time, forcing dozens of storage fetches and ImageScript conversions.
  - Directly impacts latency and edge costs as usage grows.
- **Implementation Plan**
  1. Decide on strategy: (a) pre-generate watermarked thumbnails on save, or (b) serve signed clean URLs to the client and watermark lazily on demand.
  2. Update edge function to skip watermarking on list if thumbnails exist (or if client handles it).
  3. Add caching headers to gallery responses.
  4. Benchmark before/after to ensure speedup.
- **Signals of Success**
  - Gallery load time and Supabase storage egress drop measurably.
  - Edge function CPU usage decreases.
- **Notes**
  - Align with product on acceptable watermark strength for thumbnails vs downloads.

## 5. Modularize State & Studio Flows

- **Risk**
  - `useFounderStore` (1.5 K lines) and `StudioConfigurator` (870 lines) act as god modules; they inflate bundle size, complicate testing, and cause over-rendering.
- **Implementation Plan**
  1. Identify natural slices: upload/crop, preview generation, entitlements, checkout, gallery.
  2. Move each slice to its own file using Zustand’s `create` + compose pattern; export typed selectors.
  3. For the UI, split `StudioConfigurator`/`LaunchpadLayout` into smaller, single-responsibility components.
  4. Introduce lazy loading (React.lazy/Suspense) for heavy, non-critical slices.
- **Signals of Success**
  - Main bundle shrinks below 450 KB gzip.
  - Individual slice files drop below 300 lines.
  - Component render profiling shows reduced re-renders (tracked via React DevTools).
- **Notes**
  - Prioritize profiling to ensure we don’t introduce regressions during refactor.

## 6. Establish Automated Test Coverage

- **Risk**
  - No unit/integration tests; complex flows are brittle.
- **Implementation Plan**
  1. Adopt Vitest (or Jest) for unit tests; wire into `npm test`.
  2. Start with critical slices: entitlements logic, preview orchestration, gallery reducers.
  3. Use Supabase CLI to run edge-function integration tests locally.
  4. Add coverage threshold and fail CI if it regresses.
- **Signals of Success**
  - CI runs tests on every PR.
  - Coverage report for core modules exceeds 60% and trending upward.
- **Notes**
  - Document testing patterns to ease onboarding (mocking Supabase, Zustand store resets, etc.).

## 7. Add CI Guardrails

- **Risk**
  - Without automated checks, bundle bloat and lint drift reappear.
- **Implementation Plan**
  1. Integrate a GitHub Action (or equivalent) that runs: lint, tests, `npm run build`, bundle-size check (e.g., `bundlesize` or custom script).
  2. Define budgets: main bundle <= 500 KB gzip, lint/test must pass.
  3. Block merges when thresholds fail.
- **Signals of Success**
  - PRs cannot merge without passing guardrails.
  - Bundle size growth is caught early.
- **Notes**
  - Ensure secret management in CI is tight (read-only Supabase anon key only).

## 8. Trim Dependencies & Centralize Headers

- **Risk**
  - Unused packages and repeated request header logic add drift and onboarding fatigue.
- **Implementation Plan**
  1. Run `npm run deps:check`, remove unused deps, adjust code if anything legitimate pops up.
  2. Create `utils/supabaseRequest.ts` with a shared `buildFunctionRequest({ method, body, anonToken, accessToken })`.
  3. Update gallery/entitlement/style preview APIs to consume the helper.
- **Signals of Success**
  - `depcheck` returns clean slate.
  - API helper code shrinks; new functions automatically inherit best practices.
- **Notes**
  - Communicate removal timeline so authors relying on stale packages aren’t surprised.

## 9. Document Architectural Guardrails

- **Risk**
  - Without explicit guidance, new contributors may reintroduce direct URL storage, bypass state slices, or drift from testing standards.
- **Implementation Plan**
  1. Create `docs/ARCHITECTURE-GUARDRAILS.md` summarizing storage path validation, store slicing patterns, testing requirements, CI gates, and performance budgets.
  2. Reference the doc from `README.md` and onboarding materials.
  3. Review quarterly to keep aligned with evolving product needs.
- **Signals of Success**
  - New PRs reference guardrails, reducing review churn.
  - Onboarding time decreases because expectations are codified.
- **Notes**
  - Pair documentation rollout with lunch-and-learn / Loom to socialize the changes.

---

## What “World-Class” Looks Like Once Complete

- All edge functions reject malicious input by construction; security incidents move from “possible” to “unlikely.”
- Bundle size and state complexity are predictable and constantly monitored.
- Automated tests and CI gates ensure refactors land safely.
- Engineers can contribute without memorizing tribal knowledge because guardrails are in writing.

This plan should be revisited after each major milestone to confirm priorities and add any new risks uncovered along the journey.
