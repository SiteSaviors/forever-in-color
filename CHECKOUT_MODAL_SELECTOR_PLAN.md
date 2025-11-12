## Canvas Checkout Modal – Selector Refactor Notes

### 1. Profiling Snapshot (user-supplied React DevTools run)
- Scenario: full Canvas Checkout flow (open modal, pick frame/size, proceed to contact).
- Commit duration: ~0.5 ms render / 0.1 ms layout per commit (profile shows 70 commits).
- Hot components triggered: `ToneStyleCard`, `motion.button`, `OriginalImageCard`, `UpgradePromptModal` — indicates shared store updates ripple beyond the modal.
- Takeaway: even light interactions cause wide commit trees because multiple subscribers listen to the same broad store slice.

### 2. Dependency Matrix (CanvasCheckoutModal)
| Modal Zone | Store fields currently consumed | Notes |
|------------|---------------------------------|-------|
| **Preview column** (style badge, CanvasInRoomPreview, sticky guarantee trigger) | `canvasModalOpen`, `selectedCanvasSize`, `selectedFrame`, `orientationPreviewPending` | The preview only needs size/frame/orientation state; feels effects from unrelated enhancement toggles. |
| **Frame selector** | `selectedFrame`, `enhancements` (floating-frame status), `orientationPreviewPending` | Only floating-frame enhancement matters here. |
| **Size selector** | `selectedCanvasSize`, `enhancements` (for shimmer cue), `orientationPreviewPending` | Recommendation telemetry also derives from `orientation` + `smartCrops` (from `useUploadState`). |
| **Order summary** | `selectedCanvasSize`, `selectedFrame`, `enhancements`, `orientation` | Does not need modal open flag or preview pending. |
| **CTA footer** | `selectedCanvasSize`, `orientationPreviewPending` | Needs total from actions hook but not other enhancement data. |
| **Exit confirmation / success step** | `canvasModalOpen`, `step` (from checkout store) | Independent from most canvas-state values. |

### 3. Current Consumers of `useCanvasConfigState`
| File / Feature | Usage |
|----------------|-------|
| `src/components/studio/CanvasCheckoutModal.tsx` | All modal logic (size/frame selection, summary, CTA). |
| `src/components/studio/CanvasInRoomPreview.tsx` | Reads `selectedFrame`, `selectedCanvasSize` to align art overlay. |
| `src/components/checkout/CheckoutSummary.tsx` | Pulls `selectedCanvasSize`, `enhancements` for the checkout sidebar. |
| `src/components/checkout/PaymentStep.tsx` | Reads size + enhancements for payment intent calculations. |
| `src/components/studio/LivingCanvasModal.tsx` | Uses `livingCanvasModalOpen`, `livingCanvasEnabled`. |
| `src/hooks/studio/useCanvasCtaHandlers.ts` | Uses `enhancements` when opening checkout from Studio. |
| `src/components/navigation/FounderNavigation.tsx` | Checks enhancement state for header badge. |
| `src/components/studio/orientation/OrientationBridgeProvider.tsx` | Reads `selectedCanvasSize` for orientation enforcement. |
| `src/components/studio/CanvasInRoomPreview.tsx` | Frame + size for preview overlay. |
| Tests (`tests/studio/*.spec.tsx`) | Mocking helper. |

### 4. Risks / Considerations
- Changing `useCanvasConfigState` signature impacts every consumer above; plan for phased migrations or wrapper helpers.
- `livingCanvas*` fields are still provided even though the AR upsell was removed—dropping them now affects LivingCanvasModal only.
- Selector refactor should coincide with memoized child components to capture real gains.

### 5. Next Steps
1. Refactor `useCanvasConfigState` to accept a selector function (mirrors `useFounderStore`) so each consumer subscribes only to what it needs.
2. Split CanvasCheckoutModal into smaller memoized sections with scoped selectors.
3. Re-run React DevTools profiling after refactor to capture new commit counts/durations.
