# Phase 0 – Supabase Auth Baseline (Discovery Notes)

## Current Import Graph
- `src/utils/supabaseClient.loader.ts`
  - Lazy loads `supabaseClient.ts` and exports `getSupabaseClient`, `prefetchSupabaseClient`, `withSupabaseClient`.
  - Instruments runtime metric `supabase_client_initialized` on first resolve.
- Consumers of the loader:
  - `src/providers/AuthProvider.tsx`
    - Prefetches client on mount, hydrates session via `auth.getSession`, sets magic-link sessions, listens to `auth.onAuthStateChange`.
  - `src/store/founder/sessionSlice.ts`
    - Calls `supabaseClient.auth.signOut()` on logout; relies on loader for session tokens.
  - `src/store/founder/authSlice.ts`
    - Exposes `prefetchAuthClient` which wraps `prefetchSupabaseClient()` to prepare auth during Launchflow onboarding.
  - `src/store/founder/entitlementSlice.ts`
    - Hydrates entitlements only after confirming a logged-in user; obtains client before invoking `fetchAuthenticatedEntitlements()`.
  - `src/utils/entitlementsApi.ts`
    - Calls `supabaseClient.from('v_entitlements').select(...).maybeSingle()` to map tier/quota data.
  - `src/utils/imageUtils.ts`
    - When HEIC edge conversion is enabled, fetches `supabaseClient` for access tokens before contracting with Supabase functions.
  - `src/components/modals/AuthModal.tsx`
    - Sends magic-link sign-in via `auth.signInWithOtp`.
  - `src/components/modals/AuthGateModal.tsx`
    - Initiates Google OAuth via `auth.signInWithOAuth`.

## Supabase SDK Surface in Use
- **GoTrue Auth** (actively used)
  - `auth.getSession`, `auth.setSession`, `auth.onAuthStateChange`, `auth.signInWithOtp`, `auth.signInWithOAuth`, `auth.signOut`.
  - Used across AuthProvider, session slice, AuthModal, AuthGateModal, HEIC fallback.
- **Postgrest Client** (actively used)
  - `.from('v_entitlements').select(...).maybeSingle()` inside `fetchAuthenticatedEntitlements`.
- **Storage helpers** (not via SDK)
  - Direct REST hits in `premiumDownload.ts` and `storagePaths.ts`; they build URLs manually without importing storage client.
- **Edge Functions**
  - No direct usage of `supabase.functions`; HEIC edge flow calls custom fetch helper `convertHeicUsingEdge`.
- **Realtime / Channel / Query helpers**
  - Not used.
- **Supabase fetch polyfill**
  - Bundled implicitly with `@supabase/supabase-js` (observed via chunk import of node-fetch ponyfill).

## Baseline Bundle Metrics (current build)
- Entry chunk `dist/assets/index-jDXzO9Mc.js`
  - 150 635 bytes minified, 40 893 bytes gzip.
  - Immediately references `assets/supabaseClient-Csy4xhhJ.js` through dynamic import map.
- Supabase client chunk `dist/assets/supabaseClient-Csy4xhhJ.js`
  - 114 051 bytes minified, 31 126 bytes gzip.
  - Includes GoTrue auth, Postgrest client, fetch ponyfill, error classes, and helper utilities.

## Hydration & Telemetry Touchpoints
- `AuthProvider` logs `devLog('AuthProvider', ...)` throughout session bootstrap; `prefetchSupabaseClient()` fires on mount.
- `supabase_client_initialized` runtime metric triggered once the client resolves (see `index-jDXzO9Mc.js` snippet around line ~9 900).
- Entitlement hydration logs `entitlementsApi` messages after REST call finishes (`devLog`, `devWarn`).

## Observations
- Only auth + Postgrest capabilities are leveraged; storage, functions, realtime, and query helpers are unused, indicating opportunity to slim dependencies.
- Storage downloads already use bespoke REST requests, suggesting consistency if entitlements follow similar REST approach.
- `prefetchSupabaseClient` ensures the heavy chunk is fetched eagerly even for unauthenticated sessions—highlighting the benefit of shrinking the module.

