## Canvas Checkout Modal – Selector Refactor Notes

### Phase Progress
| Phase | Scope | Status | Notes |
| --- | --- | --- | --- |
| 2.1 | Hook API groundwork | ✅ | `useCanvasConfigState` now mirrors `useFounderStore` selectors; `useLegacy` shim removed after migrations. |
| 2.2 | Dedicated helper hooks | ✅ | Interim helper hooks enabled migrations; now superseded by `useFounderCanvasStore` selectors + upload hooks. |
| 2.3 | Incremental consumer migration | ✅ | Canvas modal, previews, checkout summary, and partner components now consume scoped selectors/helpers. |
| 2.4 | Cleanup & validation | ✅ | Legacy hook deleted, store imports updated, baseline lint/build/deps checks run post-migration. |
| 3.1 | Preview column extraction | ✅ | PreviewColumn memoized with local selector usage; derived preview assets scoped internally. |
| 3.2 | Frame selector extraction | ✅ | `CanvasFrameSelector` handles floating-frame logic + shimmer trigger without parent subscriptions. |
| 3.3 | Size selector extraction | ✅ | `CanvasSizeSelector` owns recommendations, shimmer trigger, and drawer auto-expand telemetry. |
| 3.4 | Order summary card | ✅ | `CanvasOrderSummary` memoized; edit CTAs now call ref-based scroll helpers. |
| 3.5 | Checkout footer | ✅ | New `CheckoutFooter` renders trust strip + CTA using scoped selectors and memoized CTA handler. |
| 3.6 | Integration & profiling prep | ⚙️ | Inline footer removed from modal; need to finish DOM-ref scroll wiring + profiling notes. |

### Outstanding Items Before Phase 4
- Replace `[data-modal-content]` queries with explicit refs to avoid forced layouts in CTA + edit handlers.
- Re-run React Profiler to confirm PreviewColumn/FrameSelector/SizeSelector/OrderSummary/CheckoutFooter only re-render on scoped state changes.
- Throttle recommendation telemetry (one log per modal open) and gate size drawer timer to avoid idle work.
- Consolidate redundant testimonial/trust stacks across sections; keep SHOW_STATIC_TESTIMONIALS flag behavior consistent.
- Prep component splitting/memoization checklist for remaining checkout steps (contact/shipping/payment) once footer integrations settle.
