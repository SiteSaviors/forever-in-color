# Lint Cleanup Plan - 174 Errors, 22 Warnings

**Date:** 2025-10-02
**Branch:** main
**Total Issues:** 196 (174 errors, 22 warnings)
**Auto-fixable:** 1 error

---

## Executive Summary

Comprehensive analysis of 174 TypeScript/ESLint errors and 22 warnings blocking production-ready code quality. Errors break down into **5 categories** that can be fixed in **6 staged phases** of 30-40 fixes each to minimize risk.

### Error Breakdown by Category

| Category | Count | % of Total | Severity | Auto-fix |
|----------|-------|------------|----------|----------|
| **Unused Variables/Args** | 132 | 75.9% | Medium | Partial |
| **Explicit `any` Types** | 31 | 17.8% | High | No |
| **React Hook Deps** | 22 | 12.6% | Low-Medium | No |
| **Misc (empty blocks, const)** | 6 | 3.4% | Low | Yes |
| **Empty object types** | 1 | 0.6% | Low | No |

---

## Category 1: Unused Variables (132 errors - 75.9%)

### Subcategories:
- **Unused imports:** 20 errors - Remove unused imports
- **Unused caught errors:** 26 errors - Rename to `_error` or `_`
- **Unused function args:** 20 errors - Prefix with `_` or remove
- **Assigned but never used:** 15 errors - Remove dead code
- **Unused destructured vars:** Various - Clean up destructuring

### High-Impact Files:
```
src/components/product/components/UnifiedSocialMomentumWidget.tsx (11 errors)
src/components/product/hooks/useStyleCardHooks.ts (4 errors)
src/hooks/useAuthStore.ts (6 errors)
src/components/product/components/StyleCardContent.tsx (4 errors)
```

### Fix Strategy:
1. **Unused imports** - SAFE: Auto-remove with `--fix` where possible
2. **Unused catch errors** - SAFE: Rename `error` → `_error`
3. **Unused args** - MEDIUM RISK: Prefix with `_` to indicate intentionally unused
4. **Assigned never used** - REQUIRES REVIEW: May indicate dead code or bugs

---

## Category 2: Explicit `any` Types (31 errors - 17.8%)

### Critical File: `StandardizedInterfaces.ts` (10 errors)

**Lines with `any`:**
- Line 22: `DataFlowProps<T = any>` - Core interface affecting many components
- Line 157: Unknown type
- Line 164: Unknown type
- Line 212: Unknown type
- Lines 284-285: Multiple `any` types
- Lines 356, 364, 371, 375: More `any` types

### Other Affected Files:
```
src/components/product/cropper/hooks/useCropState.ts (3 errors)
src/components/product/cropper/components/CropArea.tsx (2 errors)
src/components/product/components/ProductStepsManager.tsx (2 errors)
src/components/product/customization/PremiumVideoOptions.tsx (2 errors)
```

### Fix Strategy:
1. **Phase 1:** Fix `StandardizedInterfaces.ts` first - affects downstream
2. **Define proper types:**
   - `DataFlowProps<T>` → Remove `= any` default, force explicit typing
   - Product customization types → Create `CustomizationData` interface
   - Cropper types → Use `Point`, `Area` from react-easy-crop
3. **Cascade fixes** to components using these interfaces

---

## Category 3: React Hook Dependencies (22 warnings)

### Pattern: Missing or unnecessary dependencies in useCallback/useEffect

**Files affected:**
```
src/components/product/hooks/useStyleCardInteractions.ts (6 warnings)
src/components/product/hooks/useStyleCard.ts (3 warnings)
src/components/product/hooks/useStylePreview.ts (2 warnings)
```

### Fix Strategy:
1. **Unnecessary deps** - SAFE: Remove from array
2. **Missing deps** - REQUIRES ANALYSIS:
   - May need to add dep (risk of infinite loops)
   - May need to useRef/useMemo to stabilize references
   - May indicate intentional omission (add ESLint disable with comment)

---

## Category 4: Miscellaneous (6 errors)

```
1. Empty block statement (CascadeErrorBoundary.tsx:176)
2. prefer-const instead of let (PricingSummary.tsx:23)
3. Empty object type (textarea.tsx:5)
```

### Fix Strategy: All SAFE quick wins

---

## Staged Implementation Plan

### **STAGE 1: Quick Wins (40 fixes, 2 hours)**
**Goal:** Build momentum, reduce error count by 23%

**Tasks:**
1. Auto-fix with `npm run lint -- --fix` (1 error)
2. Fix all unused imports (20 errors) - Remove unused imports
3. Rename all unused catch errors `error` → `_error` (15 errors)
4. Fix misc errors (empty blocks, prefer-const) (4 errors)

**Files to modify:** ~25 files
**Risk:** LOW - Purely cosmetic changes
**Validation:** `npm run lint` after each batch of 10

---

### **STAGE 2: Unused Args & Vars (35 fixes, 2 hours)**
**Goal:** Clean up unused function parameters and dead variables

**Tasks:**
1. Prefix unused args with `_` (20 errors)
2. Remove assigned-but-unused variables (15 errors)
   - Review each carefully for dead code
   - Check if removal breaks functionality

**Files to modify:** ~20 files
**Risk:** MEDIUM - May reveal dead code or missing features
**Validation:** `npm run build && npm run preview` - Manual testing

---

### **STAGE 3: StandardizedInterfaces.ts (10 fixes, 3 hours)**
**Goal:** Fix core type definitions affecting many components

**Tasks:**
1. Fix `DataFlowProps<T = any>` (Line 22)
   ```typescript
   // BEFORE
   export interface DataFlowProps<T = any> {

   // AFTER - Force explicit typing
   export interface DataFlowProps<T> {
   ```

2. Create proper types for Lines 157, 164, 212, 284-285, 356, 364, 371, 375
   - Review each usage
   - Define domain-specific types
   - Update all consumers

**Files to modify:** 1 file + ~15 downstream consumers
**Risk:** HIGH - Core interfaces affect many components
**Validation:** Full type-check `npx tsc --noEmit`

---

### **STAGE 4: Component `any` Types (21 fixes, 3 hours)**
**Goal:** Fix remaining explicit `any` in components

**Priority files:**
1. `ProductStepsManager.tsx` (2 errors)
2. `StyleCardBadges.tsx` (2 errors)
3. `StyleCardButtons.tsx` (2 errors)
4. `StyleCardContent.tsx` (1 error)
5. `StyleCardHeader.tsx` (1 error)
6. Cropper components (5 errors)
7. Customization components (2 errors)

**Tasks:**
- Define proper prop types for each
- Replace `any` with specific interfaces
- Add JSDoc where types are complex

**Risk:** MEDIUM - May reveal type mismatches
**Validation:** Type-check + build

---

### **STAGE 5: Remaining Unused Vars (36 fixes, 2 hours)**
**Goal:** Clean up remaining unused variables in hooks and utilities

**Files:**
- `UnifiedSocialMomentumWidget.tsx` (11 errors)
- `useStyleCardHooks.ts` (4 errors)
- `useAuthStore.ts` (6 errors)
- Various utility files (15 errors)

**Tasks:**
- Review each unused var for dead code
- Remove or rename with `_` prefix
- Check if features are incomplete

**Risk:** MEDIUM
**Validation:** Integration testing

---

### **STAGE 6: React Hook Dependencies (22 warnings, 2 hours)**
**Goal:** Fix useCallback/useEffect dependency arrays

**Strategy:**
1. **Review each warning individually**
2. **Unnecessary deps** → Remove
3. **Missing deps** → Add OR justify omission with comment
4. **Infinite loop risk** → Use useRef/useMemo

**Risk:** MEDIUM - Could introduce infinite renders
**Validation:** Runtime testing with React DevTools Profiler

---

## Risk Mitigation Strategy

### For Each Stage:
1. **Create feature branch:** `fix/lint-stage-{N}`
2. **Fix in batches of 10-15 errors**
3. **Run `npm run lint` after each batch**
4. **Run `npm run build` after stage completion**
5. **Manual testing in preview**
6. **Commit with clear message**
7. **Merge to main only after validation**

### Rollback Plan:
- Git commits every 10-15 fixes
- Can cherry-pick successful batches
- Abort stage if >50% of fixes cause issues

---

## Files Requiring Special Attention

### High-Risk (Many errors OR core functionality):
```
✋ src/components/product/interfaces/StandardizedInterfaces.ts (10 errors)
   - Core type definitions, affects many files

✋ src/components/product/components/UnifiedSocialMomentumWidget.tsx (11 errors)
   - Many unused imports/vars - may indicate incomplete feature

✋ src/hooks/useAuthStore.ts (6 errors)
   - Authentication critical - test thoroughly
```

### Edge Function (@ts-nocheck):
```
⚠️ supabase/functions/generate-style-preview-v2/index.ts:1
   - NOT in current lint output (different ESLint config?)
   - Requires separate investigation
```

---

## Success Criteria

- [ ] All 174 errors resolved
- [ ] All 22 warnings resolved OR justified with comments
- [ ] `npm run lint` exits with 0 errors/warnings
- [ ] `npm run build` succeeds
- [ ] `npm run preview` - App functions correctly
- [ ] No type errors: `npx tsc --noEmit`
- [ ] Core flows tested:
  - [ ] Photo upload
  - [ ] Style selection
  - [ ] Customization
  - [ ] Checkout
  - [ ] Auth

---

## Timeline Estimate

| Stage | Fixes | Time | Cumulative |
|-------|-------|------|------------|
| Stage 1: Quick Wins | 40 | 2h | 2h |
| Stage 2: Unused Args | 35 | 2h | 4h |
| Stage 3: StandardizedInterfaces | 10 | 3h | 7h |
| Stage 4: Component any | 21 | 3h | 10h |
| Stage 5: Remaining Unused | 36 | 2h | 12h |
| Stage 6: React Hooks | 22 | 2h | 14h |
| **Testing & Validation** | - | 2h | **16h** |

**Total: 16 hours (2 full work days)**

---

## Next Steps

1. **Review this plan with team/Codex**
2. **Create `fix/lint-stage-1` branch**
3. **Begin Stage 1: Quick Wins**
4. **Update this document with progress**

---

## Progress Tracking

### Stage 1: Quick Wins ⬜
- [ ] Auto-fix with --fix
- [ ] Remove unused imports (20)
- [ ] Rename unused catch errors (15)
- [ ] Fix misc errors (4)

### Stage 2: Unused Args ⬜
- [ ] Prefix unused args (20)
- [ ] Remove dead variables (15)

### Stage 3: StandardizedInterfaces ⬜
- [ ] Fix DataFlowProps<T>
- [ ] Fix remaining 9 any types

### Stage 4: Component any ⬜
- [ ] ProductStepsManager (2)
- [ ] StyleCard components (6)
- [ ] Cropper components (5)
- [ ] Customization (2)

### Stage 5: Remaining Unused ⬜
- [ ] UnifiedSocialMomentumWidget (11)
- [ ] useStyleCardHooks (4)
- [ ] useAuthStore (6)
- [ ] Other files (15)

### Stage 6: React Hooks ⬜
- [ ] useStyleCardInteractions (6)
- [ ] useStyleCard (3)
- [ ] useStylePreview (2)
- [ ] Other hooks (11)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-02
**Status:** Planning Complete - Ready for Implementation
