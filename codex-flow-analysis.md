# Wondertone Product Flow Audit

## Interaction Diagram (Upload → Checkout)
```
Product.tsx (useProductState → useProductFlow)
├─ ProductHeader (progress social proof)
├─ ProductContent (context consumer)
│  └─ ProductStepsManager (useProductSteps gating)
│     ├─ PhotoUploadStep
│     │  ├─ StepOneExperienceProvider
│     │  ├─ usePhotoUploadState → PhotoUploadContainer → usePhotoUploadLogic → detectOrientationFromImage
│     │  └─ StyleSelector → IntelligentStyleGrid → StyleCard → useStyleCard/useStylePreview → generateStylePreview + watermarkManager
│     ├─ CanvasConfigurationStep → useOrientationSelector → SizeSelectionSection → PsychologyOptimizedSizeGrid/PsychologyOptimizedSizeCard
│     ├─ CustomizationStep → CustomizationSelector → {useCanvasPreview→CanvasPreviewSection, CustomizationOptions, PricingSummary}
│     └─ ReviewOrderStep → ReviewAndOrder → {CanvasMockup→CanvasWallMockup, OrderSummary→OrderItemsList/OrderActions/PaymentForm/Trust layers}
├─ UnifiedSocialMomentumWidget (step 1 nudges)
└─ BottomMomentumPopup (momentum for steps ≥ 2)
```

## Prop-Drilling Chains to Triage
| Prop | Source | Terminal sink | Depth |
| --- | --- | --- | --- |
| `selectedOrientation` | `Product.tsx:60` | `useStylePreview.ts:94` | 9 |
| `onPhotoAndStyleComplete` | `Product.tsx:70` | `usePhotoUploadLogic.ts:12` | 8 |
| `selectedStyle` | `Product.tsx:58` | `StyleCard.tsx:79` | 8 |
| `uploadedImage` | `Product.tsx:62` | `StyleCard.tsx:79` | 8 |
| `onSizeSelect` | `Product.tsx:72` | `PsychologyOptimizedSizeCard.tsx:44` | 7 |
| `customizations` | `Product.tsx:61` | `FloatingFrameCard.tsx:32` | 6 |
| `customizations` | `Product.tsx:61` | `OrderActions.tsx:21` | 6 |
| `selectedSize` | `Product.tsx:59` | `PsychologyOptimizedSizeCard.tsx:162` | 6 |
| `selectedOrientation` | `Product.tsx:60` | `CanvasWallMockup.tsx:15` | 6 |
| `uploadedImage` | `Product.tsx:62` | `OrderItemsList.tsx:20` | 6 |

## De-Drilling Strategy (No New Deps)
1. **`ProductFlowProvider`** – wrap `useProductFlow` once at the page root and expose memoised slices (`photo`, `canvas`, `customization`, `order`, `progress`) with selectors to avoid the progress provider churn flagged in `progressReducer.ts:4-34`.
2. **Slice Hooks for Steps** – replace prop threads with hooks like `usePhotoStepSlice(selector)` inside `ProductStepsManager`. Photo, Canvas, Customization, and Review components pull only the data/actions they need. Keeps `usePreviewGeneration` cache single-sourced per guardrail in `ProductContent.tsx:43-46`.
3. **Preview Coordination** – route `StyleCard` generation writes through the provider slice so `CustomizationSelector` and any future preview consumers reuse the same cache, preserving edge throughput expectations in `generate-style-preview/index.ts:74-120`.
4. **Checkout Context** – expose derived totals and selections through `useOrderSlice` so `OrderItemsList`, `OrderActions`, and `StickyOrderCTA` subscribe to computed fields instead of full state objects, reducing renders when toggling add-ons.

## Five-File Pilot (no visual change, identical behavior, fewer renders)
1. `src/components/product/contexts/ProductFlowContext.tsx` (new)
   ```tsx
   export const ProductFlowContext = createContext<ProductFlowSnapshot | null>(null);
   export const ProductFlowProvider = ({ value, children }: ProviderProps) => (
     <ProductFlowContext.Provider value={value}>{children}</ProductFlowContext.Provider>
   );
   export const useProductFlowContext = () => useContext(ProductFlowContext)!;
   ```
2. `src/pages/Product.tsx`
   ```tsx
   const flow = useProductState();
   return (
     <ProductFlowProvider value={flow}>
       <div className="min-h-screen bg-gray-50">
   ```
3. `src/components/product/ProductContent.tsx`
   ```tsx
   const ProductContent = () => {
     const { progress, photo } = useProductFlowContext();
     const { currentStep, completedSteps } = progress;
   ```
4. `src/components/product/components/PhotoUploadStep.tsx`
   ```tsx
   const { photoStep } = usePhotoStepSlice();
   <ProductStepWrapper
     stepNumber={1}
     isActive={photoStep.isActive}
     onStepClick={photoStep.open}
   >
   ```
5. `src/components/product/components/PhotoAndStyleStep.tsx`
   ```tsx
   const { uploadedImage, selectedStyle, completePhoto } = usePhotoStepSlice();
   <StyleSelector
     croppedImage={uploadedImage}
     selectedStyle={selectedStyle?.id ?? null}
     onComplete={completePhoto}
   />
   ```

Acceptance: zero layout/visual deltas, gating identical, proven render reduction via React Profiler, `npm run lint && npm run build` pass.

## Open Questions / Risks
- Need fast selectors to avoid re-render storms when preview URLs change; consider `useSyncExternalStore` if context selectors thrash during rapid preview updates.
- Ensure dual `usePreviewGeneration` instances stay in sync (page-level and `ProductContent`) — centralising via provider should eliminate duplication but requires regression checks for cached previews when orientation resets.
- Stripe placeholder logic remains untouched; any checkout slice must preserve current fake totals to avoid contract drift with future integration.

## Next Steps
1. Build the provider + Photo step slice, profile Step 1 interactions, and confirm preview cache behaviour.
2. Extend slices to Canvas/Customization/Order once Step 1 stabilises.
3. Harmonise StyleCard preview writes with shared slice to avoid duplicated edge requests.
