# Founder store scaffolding

This directory houses the slice-oriented type snapshots that mirror the current
`useFounderStore` shape. Phase 0 of the hardening plan keeps runtime behavior
unchanged while documenting the boundaries we will tease apart in upcoming
refactors (session, entitlements, media pipeline, preview orchestration, and
UI helpers).

Future phases will introduce actual slice implementations and React Query
backed preview orchestration, replacing the monolithic `useFounderStore`
composition.
