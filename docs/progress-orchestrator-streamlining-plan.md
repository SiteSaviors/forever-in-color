# Progress Orchestrator Streamlining Plan

## 1. Current State Analysis

### 1.1 File & component inventory
- **Core orchestration**: `progressReducer.ts`, `ProgressOrchestrator.tsx`, `ProgressSlices.tsx`, `types.ts`, and selectors/hooks under `progress/hooks`.【F:src/components/product/progress/progressReducer.ts†L1-L184】【F:src/components/product/progress/ProgressOrchestrator.tsx†L2-L62】【F:src/components/product/progress/ProgressSlices.tsx†L1-L145】【F:src/components/product/progress/hooks/useProgressSelectors.ts†L1-L59】【F:src/components/product/progress/types.ts†L1-L55】
- **Primary consumers**: Step 1 surface (`PhotoAndStyleStep`, `ProgressStateManager`, `EnhancedHandlers`, `SmartProgressIndicator`, `ContextualHelp`, `MobileGestureHandler`) and the conversion widget (`UnifiedSocialMomentumWidget`). No other modules import orchestrator selectors or context hooks.【0ed723†L1-L20】
- **Product shell**: The Product page wraps the entire configurator (header, content, testimonials, widgets, footer) in `ProgressOrchestrator`, making the reducer global to the Product route.【F:src/pages/Product.tsx†L45-L104】

### 1.2 Data flow overview
```
useProductFlow (canonical step + completion state)【F:src/components/product/hooks/useProductFlow.ts†L8-L142】
        ↓ props
Product.tsx renders ProductContent inside ProgressOrchestrator【F:src/pages/Product.tsx†L45-L101】
        ↓ reducer + nested slice providers
ProgressStateManager re-dispatches step/sub-step/completion events to context【F:src/components/product/components/ProgressStateManager.tsx†L21-L52】
        ↓ selectors
Step 1 helpers (ContextualHelp, MobileGestureHandler, EnhancedHandlers, SmartProgressIndicator) & UnifiedSocialMomentumWidget read slices via hooks.【F:src/components/product/help/ContextualHelp.tsx†L14-L200】【F:src/components/product/mobile/MobileGestureHandler.tsx†L16-L162】【F:src/components/product/components/EnhancedHandlers.tsx†L4-L48】【F:src/components/product/progress/SmartProgressIndicator.tsx†L6-L45】【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L19-L101】
```

### 1.3 State property usage audit

#### Progress slice
| Property | Writers | Readers | Notes |
| --- | --- | --- | --- |
| `currentStep` | Synced from `ProgressStateManager` effect.【F:src/components/product/components/ProgressStateManager.tsx†L21-L24】 | No selectors consume it (`useCurrentStep` unused).【1b5019†L1-L3】 | Duplicates `useProductFlow` state without downstream readers.【F:src/components/product/hooks/useProductFlow.ts†L8-L142】 |
| `currentSubStep` | Derived in `ProgressStateManager` based on upload/style status.【F:src/components/product/components/ProgressStateManager.tsx†L41-L50】 | Used by `ContextualHelp` for timing, `MobileGestureHandler` for hints.【F:src/components/product/help/ContextualHelp.tsx†L20-L54】【F:src/components/product/mobile/MobileGestureHandler.tsx†L24-L43】 | Drives Step 1 UX only. |
| `completedSteps` | Mirrored from props by `ProgressStateManager`.【F:src/components/product/components/ProgressStateManager.tsx†L26-L39】 | Counted by `SmartProgressIndicator` for progress copy.【F:src/components/product/progress/SmartProgressIndicator.tsx†L9-L45】 | Also maintained by `useProductFlow`, creating double bookkeeping.【F:src/components/product/hooks/useProductFlow.ts†L10-L142】 |

#### Engagement slice
| Property | Writers | Readers | Notes |
| --- | --- | --- | --- |
| `userBehavior.lastInteraction` | Updated on every step/sub-step/complete dispatch in reducer wrapper.【F:src/components/product/progress/progressReducer.ts†L86-L100】 | Used by `MobileGestureHandler` and `UnifiedSocialMomentumWidget` to infer hesitation.【F:src/components/product/mobile/MobileGestureHandler.tsx†L24-L43】【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L24-L59】 | Only `lastInteraction` is consumed; other behavior fields (`hesitationCount`, `timeOnStep`, `hoverDuration`) are never referenced.【453041†L1-L5】【eece17†L1-L5】【7f2f9c†L1-L5】 |
| `contextualHelp` | `ProgressStateManager` never shows help; only `HIDE_HELP` clears values.【F:src/components/product/progress/progressReducer.ts†L100-L117】 | `ContextualHelp` reads tooltip data/visibility, `UnifiedSocialMomentumWidget` checks `showTooltip`.【F:src/components/product/help/ContextualHelp.tsx†L15-L200】【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L24-L59】 | Visibility is controlled elsewhere via DOM events; orchestrator never sets `showTooltip` true. |
| `socialProof.recentActivity` | Static initial list.【F:src/components/product/progress/progressReducer.ts†L23-L34】 | Rotated through in widget and displayed in Activity card.【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L31-L63】【F:src/components/product/components/unified-momentum/ActivityDisplay.tsx†L10-L31】 | Other social metrics (`confidenceScore`, `liveUserCount`) unused.【c7eb9f†L1-L5】【7b6eb8†L1-L5】 |
| `conversionElements.momentumScore` | Static default, never mutated.【F:src/components/product/progress/progressReducer.ts†L35-L40】 | Used for momentum level badges in widget.【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L62-L88】 | Remaining fields (`urgencyMessage`, `personalizationLevel`, `timeSpentOnPlatform`) unused by consumers.【132fb3†L1-L5】【230c91†L1-L5】 |

#### AI insights slice
| Property | Writers | Readers | Notes |
| --- | --- | --- | --- |
| `aiAnalysis.isAnalyzing` & `analysisStage` | Toggled by `useAIAnalysis` helpers when `EnhancedHandlers` dispatch upload events.【F:src/components/product/progress/hooks/useAIAnalysis.ts†L6-L14】【F:src/components/product/components/EnhancedHandlers.tsx†L11-L33】 | No component reads `isAnalyzing` or `analysisStage`.【ae5f68†L1-L13】 | Candidate for removal or local loading state. |
| `aiAnalysis.imageType` | Set on simulated completion in `EnhancedHandlers`.【F:src/components/product/components/EnhancedHandlers.tsx†L21-L33】 | Used only by `ContextualHelp` to tweak messaging.【F:src/components/product/help/ContextualHelp.tsx†L76-L117】 | Can stay with Step 1 scope. |
| `aiAnalysis.recommendedStyles` | Populated alongside `imageType`.【F:src/components/product/components/EnhancedHandlers.tsx†L21-L33】 | Not consumed anywhere else.【cc45b7†L1-L9】 | Dead data. |

### 1.4 Performance & architectural observations
- **Global provider scope**: Wrapping the entire Product route in the orchestrator means every dispatch triggers reconciliation for header, testimonials, momentum popups, and footer even though they never read the context.【F:src/pages/Product.tsx†L45-L104】【F:src/components/product/progress/ProgressOrchestrator.tsx†L15-L32】
- **Double state sources**: `useProductFlow` already tracks `currentStep`, `completedSteps`, image/style selections, etc.; `ProgressStateManager` merely replays the same facts into the reducer, adding more renders and bookkeeping risk.【F:src/components/product/hooks/useProductFlow.ts†L8-L142】【F:src/components/product/components/ProgressStateManager.tsx†L21-L52】
- **Unused actions**: `ADD_PERSONALIZED_MESSAGE` is dispatched but never handled, proving parts of the reducer are vestigial.【F:src/components/product/components/EnhancedHandlers.tsx†L16-L40】【F:src/components/product/progress/progressReducer.ts†L58-L119】【F:src/components/product/progress/types.ts†L41-L52】
- **Selector granularity**: Memoized slice providers prevent context value churn, but they cannot stop React from re-rendering the entire tree because the provider wraps the whole Product page. Only Step 1 components and the momentum widget observe state updates; everything else re-renders for no gain.【0ed723†L1-L20】【F:src/pages/Product.tsx†L45-L104】

## 2. Proposed Architecture

### 2.1 Target structure
```
src/components/product/progress/
  useProgressExperience.ts        # local hook for Step 1 UX state
  ProgressExperienceProvider.tsx  # optional scoped context mounted inside PhotoAndStyleStep
  constants/socialProof.ts        # static activity/momentum seeds
```
`ProgressOrchestrator`, `ProgressSlices`, the legacy reducer, and unused selectors/types are deleted once migration is complete.

### 2.2 Scope & ownership changes
- Mount the new provider (or hook) inside `PhotoAndStyleStep` so only Step 1 descendants subscribe to updates. The widget can either render within that subtree or receive derived props explicitly.【F:src/components/product/components/PhotoAndStyleStep.tsx†L74-L142】【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L19-L101】
- Promote `useProductFlow` as the single source of truth for step and completion data. Instead of re-dispatching them, pass the existing props to any component that needs them (e.g., `SmartProgressIndicator`).【F:src/components/product/hooks/useProductFlow.ts†L8-L142】【F:src/components/product/progress/SmartProgressIndicator.tsx†L9-L38】
- Keep only the engagement fields that have live consumers (`lastInteraction`, `showTooltip`, `tooltipType/message`, `recentActivity`, `completionRate`, `momentumScore`). All other fields move to local state or constants where necessary.【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L24-L88】【F:src/components/product/help/ContextualHelp.tsx†L65-L189】

### 2.3 Simplified state shape
```ts
type StepOneExperience = {
  subStep: 'upload' | 'analyzing' | 'style-selection' | 'complete';
  lastInteractionAt: number;
  ai: { status: 'idle' | 'analyzing' | 'complete'; imageType: 'portrait' | 'landscape' | 'square' | 'unknown' };
  help: { isVisible: boolean; level: 'minimal' | 'detailed'; type: 'hesitation' | 'recommendation' | 'social' | 'general'; message: string };
  socialProof: { recentActivity: string[]; completionRate: number };
  momentumScore: number;
};
```
`completedSteps` and the canonical step index remain props derived from `useProductFlow`. Static copy such as the activity list moves to module-level constants.

### 2.4 Components impacted
- **Refactor**: `PhotoAndStyleStep`, `ProgressStateManager` (replaced with local hook calls), `EnhancedHandlers`, `ContextualHelp`, `SmartProgressIndicator`, `MobileGestureHandler`, `UnifiedSocialMomentumWidget`.
- **Remove**: `ProgressOrchestrator`, `ProgressSlices`, `progressReducer`, `useProgressSelectors`, unused action types.
- **Unaffected**: Downstream steps (size, orientation, customization), testimonials, payment flows.

## 3. Migration Strategy
1. **Introduce scoped experience hook/context**
   - Implement `useProgressExperience` with `useReducer`/`useState` to track sub-step, last interaction, help state, and AI image type. Seed social proof and momentum defaults from the current reducer’s initial state.【F:src/components/product/progress/progressReducer.ts†L4-L49】
   - Expose imperative helpers equivalent to current dispatch patterns (e.g., `markInteraction`, `setHelp`, `beginAnalysis`, `completeAnalysis`).
2. **Bridge Step 1 components**
   - Replace `ProgressStateManager` with the new hook: compute `subStep` locally, feed `lastInteraction` updates through helper callbacks, and forward `completedSteps` straight from props.【F:src/components/product/components/ProgressStateManager.tsx†L21-L52】【F:src/components/product/components/PhotoAndStyleStep.tsx†L84-L140】
   - Update `SmartProgressIndicator` to consume `completedSteps` via props and, if necessary, an explicit `onMilestone` callback instead of reaching into context.【F:src/components/product/progress/SmartProgressIndicator.tsx†L9-L45】
3. **Rework engagement consumers**
   - Convert `ContextualHelp`, `MobileGestureHandler`, and `EnhancedHandlers` to use the new hook/context API; ensure help visibility and last-interaction timers still behave as before.【F:src/components/product/help/ContextualHelp.tsx†L24-L189】【F:src/components/product/mobile/MobileGestureHandler.tsx†L29-L159】【F:src/components/product/components/EnhancedHandlers.tsx†L11-L48】
4. **Update UnifiedSocialMomentumWidget**
   - Either render it inside the new provider subtree (if layout allows) or pass the required data (`recentActivity`, `momentumScore`, `lastInteraction`, `isHelpVisible`) from `PhotoAndStyleStep`/Product props. Simplify the widget to rely on constants for static stats.【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L24-L88】
5. **Retire legacy orchestration**
   - Remove old files, delete unused action types, and collapse selector imports. Adjust `Product.tsx` to drop the global wrapper once all consumers are migrated.【F:src/pages/Product.tsx†L45-L104】
6. **Verification & cleanup**
   - Run `npm run lint`, `npm run build`, `npm run build:analyze`, and `npm run deps:check` per repo guardrails.
   - Exercise manual QA cases: repeat uploads, dismiss help, mobile swipes, widget expansion timing, AI recommendation copy consistency.

Rollback checkpoints: after Step 2 (Step 1 consumers migrated) and Step 4 (widget migrated) the legacy orchestrator can temporarily coexist; revert to the prior commit to restore the global context if regressions arise.

## 4. Risk Mitigation
- **Hesitation-driven UX**: Preserve `lastInteraction` updates so gesture hints and widget auto-expand still respond to idle time.【F:src/components/product/mobile/MobileGestureHandler.tsx†L29-L159】【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L50-L88】
- **Contextual help lifecycle**: Maintain `HIDE_HELP` semantics and ensure whatever replaces the reducer still allows DOM events or future analytics to show tooltips without full reloads.【F:src/components/product/help/ContextualHelp.tsx†L24-L189】
- **AI messaging**: Keep the `'analyzing' → 'complete'` transitions that drive current copy variations in help cards.【F:src/components/product/components/EnhancedHandlers.tsx†L11-L40】【F:src/components/product/help/ContextualHelp.tsx†L76-L117】
- **Widget layout**: Validate that extracting the provider does not break fixed positioning or animation classes around the momentum widget.【F:src/components/product/components/UnifiedSocialMomentumWidget.tsx†L24-L100】
- **Analytics placeholders**: Document removal of unused metrics/actions (e.g., personalized messages, confidence scores) so future teams know they were never wired up.

Edge cases to regression-test:
- Multiple rapid uploads and style switches while contextual help is visible.
- Mobile swipes shortly after inactivity to verify vibration still triggers.
- Widget auto-expansion after 20 s idle with and without tooltip visibility.
- AI analysis completion updating help copy for portrait vs. landscape images.

## 5. Effort Estimation
| Task | Estimate | Complexity | Dependencies |
| --- | --- | --- | --- |
| Build `useProgressExperience` hook/context + tests | 4–6 hrs | Medium | None |
| Migrate Step 1 components (PhotoAndStyleStep, indicator, help, gestures) | 6–8 hrs | High | Hook available |
| Adapt UnifiedSocialMomentumWidget & constants | 4 hrs | Medium | Hook data surfaced |
| Remove legacy orchestrator & selectors | 3 hrs | Medium | Consumers migrated |
| QA + required npm scripts (`lint`, `build`, `build:analyze`, `deps:check`) | 1 day | Medium | Refactor complete |

## 6. Success Criteria
- `Product.tsx` no longer imports `ProgressOrchestrator`; Step 1 code compiles against the new scoped experience API.【F:src/pages/Product.tsx†L45-L104】
- Reducer/selector boilerplate (~180 lines) deleted without loss of functionality or UX polish.【F:src/components/product/progress/progressReducer.ts†L1-L184】【F:src/components/product/progress/ProgressSlices.tsx†L1-L145】【F:src/components/product/progress/hooks/useProgressSelectors.ts†L1-L59】
- Step progression, contextual help, mobile gestures, and momentum widget behaviors remain unchanged during manual QA.
- Bundle/build metrics show a reduction after removing the orchestrator layer (validated via `npm run build:analyze`).
- Lint/build/dependency checks succeed without additional warnings.
