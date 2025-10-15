# Mobile Studio Implementation - Phased Execution Plan

**Branch:** `feature/mobile-studio-style-picker`
**Target:** 75% mobile user base
**Objective:** Nail the mobile style selection experience with zero desktop regression

---

## Phase Overview

| Phase | Scope | Duration | Blocker | Validation |
|-------|-------|----------|---------|------------|
| **0** | Pre-flight Setup | 15 min | - | Git branch created ✅ |
| **1** | Layout Foundation | 1 hour | - | Desktop unchanged, mobile stacks |
| **2** | Mobile Style Drawer | 2 hours | Phase 1 | Drawer opens/closes smoothly |
| **3** | FAB Integration | 1 hour | Phase 2 | FAB triggers drawer |
| **4** | iOS/Android Polish | 1.5 hours | Phase 3 | Safe-area, scroll lock working |
| **5** | Testing & QA | 2 hours | Phase 4 | All devices tested |
| **6** | Merge & Deploy | 30 min | Phase 5 | Production ready |

**Total Time:** ~8 hours (1 full day)

---

## Phase 0: Pre-flight Setup ✅

**Status:** Complete

- [x] Created feature branch `feature/mobile-studio-style-picker`
- [x] Reviewed both implementation plans
- [x] Identified best-of-both approach

---

## Phase 1: Layout Foundation (Responsive Grid)

**Goal:** Make desktop 3-column layout responsive without breaking existing desktop UI.

**Time:** 1 hour
**Files Modified:** 1 (`StudioConfigurator.tsx`)
**Risk Level:** Low (scoped to breakpoints)

### 1.1 Changes to StudioConfigurator.tsx

**Step 1.1.1: Update root container (Line 287)**
```tsx
// BEFORE
<div className="flex max-w-[1800px] mx-auto">

// AFTER
<div className="block lg:flex max-w-[1800px] mx-auto">
```

**Step 1.1.2: Hide desktop left sidebar on mobile (Line 289)**
```tsx
// BEFORE
<aside className="w-80 bg-slate-950/50 border-r border-white/10 h-screen sticky top-[57px] overflow-y-auto">

// AFTER
<aside className="hidden lg:block lg:w-80 bg-slate-950/50 border-r border-white/10 lg:h-screen lg:sticky lg:top-[57px] overflow-y-auto">
```

**Step 1.1.3: Make canvas full-width on mobile (Line 378)**
```tsx
// BEFORE
<main className="flex-1 p-8 flex flex-col items-center justify-start">

// AFTER
<main className="w-full lg:flex-1 px-4 py-6 lg:p-8 flex flex-col items-center justify-start">
```

**Step 1.1.4: Make right sidebar stack on mobile (Line 584)**
```tsx
// BEFORE
<aside className="w-[420px]">
  <div className="sticky top-[57px] p-6">

// AFTER
<aside className="w-full lg:w-[420px]">
  <div className="lg:sticky lg:top-[57px] px-4 py-6 lg:p-6">
```

### 1.2 Validation Checklist

**Desktop (≥1024px):**
- [ ] Left sidebar visible with styles
- [ ] 3-column layout intact
- [ ] Sticky positioning works
- [ ] No visual changes

**Mobile (375px):**
- [ ] Left sidebar completely hidden
- [ ] Canvas full-width, stacked vertically
- [ ] Right sidebar (StickyOrderRail) flows below canvas
- [ ] No horizontal scroll

**Test Command:**
```bash
npm run dev
# Open http://localhost:4175/create
# Resize browser: 1440px → 1024px → 768px → 375px
# Verify layout shifts correctly
```

**Checkpoint:** Layout is responsive, desktop unchanged. Proceed to Phase 2.

---

## Phase 2: Mobile Style Drawer Component

**Goal:** Build the bottom sheet drawer with 2-column style grid.

**Time:** 2 hours
**Files Created:** 1 (`MobileStyleDrawer.tsx`)
**Risk Level:** Medium (new component, animations)

### 2.1 Create Component File

**File:** `src/components/studio/MobileStyleDrawer.tsx`

**Features:**
- Framer Motion slide-up animation
- iOS Safari scroll lock
- 2-column grid (responsive to 3-col on wider mobiles)
- Safe-area inset support
- Focus trap for accessibility
- Reduced motion support

### 2.2 Implementation

**Key Sections:**

1. **Props Interface**
```tsx
type MobileStyleDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  styles: StyleOption[];
  selectedStyleId: string | null;
  onStyleSelect: (styleId: string) => void;
  previews: Record<string, PreviewState>;
  canGenerateMore: boolean;
  pendingStyleId: string | null;
  remainingTokens: number | null;
  userTier: string;
};
```

2. **Scroll Lock (iOS Safari Fix)**
```tsx
useEffect(() => {
  if (!isOpen) return;

  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';

  return () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollY);
  };
}, [isOpen]);
```

3. **Animation Config**
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const drawerVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' }
};

const transition = prefersReducedMotion
  ? { duration: 0.15, ease: 'easeOut' }
  : { type: 'spring', damping: 30, stiffness: 300 };
```

4. **Safe-Area Support**
```tsx
<motion.div
  className="fixed inset-x-0 bottom-0 z-50 bg-slate-900 rounded-t-3xl border-t-2 border-white/20"
  style={{
    maxHeight: 'min(85vh, calc(100vh - env(safe-area-inset-top) - 20px))',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
  }}
>
```

5. **2-Column Grid with Responsive Breakpoint**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6">
  {styles.map((style) => (
    <button
      key={style.id}
      onClick={() => handleStyleClick(style.id)}
      className="flex flex-col gap-3 p-3 rounded-2xl min-h-[180px]"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Style card content */}
    </button>
  ))}
</div>
```

6. **Token Counter Integration (from Codex's suggestion)**
```tsx
{/* Footer with token counter */}
<div className="px-6 py-4 border-t border-white/10 bg-slate-950/50">
  <div className="flex items-center justify-between">
    <p className="text-xs text-white/60">
      Tap a style to generate preview
    </p>
    {remainingTokens !== null && (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30">
        <svg className="w-3 h-3 text-purple-300" /* sparkle icon */ />
        <span className="text-xs font-bold text-purple-200">
          {remainingTokens} left
        </span>
      </div>
    )}
  </div>
</div>
```

### 2.3 Validation Checklist

**Standalone Testing:**
- [ ] Create temporary test page to render drawer in isolation
- [ ] Verify slide-up animation smooth (60fps)
- [ ] Confirm iOS scroll lock works (no body bounce)
- [ ] Test safe-area insets on iPhone notched devices
- [ ] Verify 2-column grid on 375px, 3-column on 428px
- [ ] Check reduced motion preference (no spring animation)
- [ ] Validate tap targets ≥44x44px

**Test Command:**
```bash
# Create temporary test route
# /create-test with just the drawer component
npm run dev
```

**Checkpoint:** Drawer component fully functional in isolation. Proceed to Phase 3.

---

## Phase 3: FAB Integration

**Goal:** Add floating action button that triggers the drawer.

**Time:** 1 hour
**Files Modified:** 1 (`StudioConfigurator.tsx`)
**Risk Level:** Low (pure UI addition)

### 3.1 Changes to StudioConfigurator.tsx

**Step 3.1.1: Add imports (Line 14)**
```tsx
const MobileStyleDrawer = lazy(() => import('@/components/studio/MobileStyleDrawer'));
```

**Step 3.1.2: Add state (after Line 78)**
```tsx
const [mobileStyleDrawerOpen, setMobileStyleDrawerOpen] = useState(false);
```

**Step 3.1.3: Insert FAB (after Line 284, before 3-column layout)**
```tsx
{/* Mobile Style FAB - Only visible after photo upload on <1024px */}
{croppedImage && (
  <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
    <button
      type="button"
      onClick={() => setMobileStyleDrawerOpen(true)}
      className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-3.5 rounded-full shadow-glow-purple active:scale-95 transition-transform"
      aria-label="Open style picker"
      style={{
        paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom, 0px))'
      }}
    >
      {/* Current style thumbnail */}
      {currentStyle?.thumbnail && (
        <div className="w-11 h-11 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0">
          <img
            src={currentStyle.thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Label */}
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">
          Style
        </span>
        <span className="text-sm font-bold leading-tight">
          {currentStyle?.name ?? 'Select Style'}
        </span>
      </div>

      {/* Chevron indicator */}
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
)}
```

**Step 3.1.4: Render drawer (after Line 602, with other modals)**
```tsx
{/* Mobile Style Drawer */}
<Suspense fallback={null}>
  <MobileStyleDrawer
    isOpen={mobileStyleDrawerOpen}
    onClose={() => setMobileStyleDrawerOpen(false)}
    styles={styles}
    selectedStyleId={selectedStyleId}
    onStyleSelect={handleStyleClick}
    previews={previews}
    canGenerateMore={canGenerateMore()}
    pendingStyleId={pendingStyleId}
    remainingTokens={entitlements.remainingTokens}
    userTier={entitlements.tier}
  />
</Suspense>
```

### 3.2 Validation Checklist

**Mobile Flow (375px):**
- [ ] Upload photo → FAB appears at bottom-center
- [ ] FAB shows "Select Style" initially
- [ ] Tap FAB → drawer slides up smoothly
- [ ] Select style → drawer closes, FAB updates with style name + thumbnail
- [ ] FAB doesn't overlap canvas preview or order summary
- [ ] FAB safe-area padding works on iPhone 14 Pro (bottom notch)

**Desktop (1440px):**
- [ ] FAB completely hidden
- [ ] No layout shifts
- [ ] No console errors

**Test Command:**
```bash
npm run dev
# Test on real iOS device via network (http://YOUR_IP:4175/create)
# Or use Chrome DevTools device mode
```

**Checkpoint:** FAB triggers drawer, selection flow works end-to-end. Proceed to Phase 4.

---

## Phase 4: iOS/Android Polish

**Goal:** Fix platform-specific quirks and edge cases.

**Time:** 1.5 hours
**Files Modified:** 2 (`MobileStyleDrawer.tsx`, global CSS)
**Risk Level:** Medium (OS-specific bugs)

### 4.1 iOS Safari Fixes

**Issue 1: 100vh includes URL bar**
```tsx
// In MobileStyleDrawer.tsx
const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

useEffect(() => {
  const handleResize = () => setViewportHeight(window.innerHeight);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Use in style:
style={{
  maxHeight: `min(85vh, ${viewportHeight * 0.85}px)`,
  paddingBottom: 'env(safe-area-inset-bottom, 0px)'
}}
```

**Issue 2: Elastic scroll bounce**
```tsx
// Already handled by body scroll lock, but add CSS fallback:
<motion.div
  className="..."
  style={{
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch'
  }}
>
```

**Issue 3: Double-tap zoom on buttons**
```css
/* Add to index.css or MobileStyleDrawer.tsx */
button[data-mobile-style-card] {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

### 4.2 Android Chrome Fixes

**Issue 1: Back button should close drawer**
```tsx
// In MobileStyleDrawer.tsx
useEffect(() => {
  if (!isOpen) return;

  const handlePopState = () => {
    onClose();
  };

  // Add a fake history state when drawer opens
  window.history.pushState({ drawer: 'open' }, '');
  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
    // Clean up history state if drawer is programmatically closed
    if (window.history.state?.drawer === 'open') {
      window.history.back();
    }
  };
}, [isOpen, onClose]);
```

**Issue 2: TalkBack gesture navigation**
```tsx
// Ensure drawer has proper ARIA
<motion.div
  role="dialog"
  aria-modal="true"
  aria-labelledby="mobile-drawer-title"
  aria-describedby="mobile-drawer-desc"
>
  <h2 id="mobile-drawer-title" className="sr-only">
    Style Selection
  </h2>
  <p id="mobile-drawer-desc" className="sr-only">
    Choose an AI art style for your photo. {styles.length} styles available.
  </p>
  {/* ... */}
</motion.div>
```

### 4.3 Orientation Change Handling

```tsx
// Close drawer on orientation change to prevent layout bugs
useEffect(() => {
  const handleOrientationChange = () => {
    if (isOpen) {
      onClose();
    }
  };

  window.addEventListener('orientationchange', handleOrientationChange);
  return () => window.removeEventListener('orientationchange', handleOrientationChange);
}, [isOpen, onClose]);
```

### 4.4 Validation Checklist

**iOS Safari (iPhone 14 Pro):**
- [ ] Drawer max-height respects viewport height (not 100vh)
- [ ] No elastic bounce when scrolling grid
- [ ] Safe-area insets correct at bottom
- [ ] Double-tap doesn't zoom
- [ ] VoiceOver announces "Dialog, Style Selection"

**Android Chrome (Pixel 7):**
- [ ] Back button closes drawer (doesn't navigate away)
- [ ] TalkBack announces drawer and styles correctly
- [ ] Scroll performance smooth (no jank)

**Edge Cases:**
- [ ] Portrait → Landscape → drawer closes gracefully
- [ ] Rapid open/close doesn't cause state bugs
- [ ] Drawer open + route change → drawer closes

**Test Command:**
```bash
# Test on real devices via network
npm run dev -- --host
# Access via phone: http://YOUR_LOCAL_IP:4175/create
```

**Checkpoint:** Platform-specific issues resolved. Proceed to Phase 5.

---

## Phase 5: Testing & QA

**Goal:** Comprehensive cross-device testing and bug fixes.

**Time:** 2 hours
**Risk Level:** Critical (this validates everything)

### 5.1 Device Test Matrix

| Device | Viewport | Browser | Priority | Tester |
|--------|----------|---------|----------|--------|
| iPhone SE (2022) | 375x667 | Safari 17 | P0 | 🟢 Required |
| iPhone 14 Pro | 393x852 | Safari 17 | P0 | 🟢 Required |
| Galaxy S21 | 360x800 | Chrome 120 | P0 | 🟢 Required |
| Pixel 7 | 412x915 | Chrome 120 | P1 | 🟡 Nice-to-have |
| iPad Mini | 768x1024 | Safari 17 | P1 | 🟡 Nice-to-have |
| Desktop | 1440x900 | Chrome/Safari | P0 | 🟢 Required |

### 5.2 Test Scenarios (67 Total)

**A. Layout & Visibility (8 tests)**
1. Desktop (1440px): Left sidebar visible, FAB hidden ✅
2. Desktop (1024px): Breakpoint boundary, layout stable ✅
3. Tablet (768px): Clarify behavior (mobile or desktop layout) ✅
4. Mobile (430px): FAB visible, sidebar hidden ✅
5. Mobile (375px): No horizontal overflow ✅
6. Mobile (320px): Minimum viewport, readable ✅
7. Portrait orientation: Layout vertical ✅
8. Landscape orientation: Drawer closes on rotate ✅

**B. FAB Interaction (7 tests)**
9. Initial state: Shows "Select Style" ✅
10. After selection: Shows style name + thumbnail ✅
11. Tap FAB: Drawer opens with animation ✅
12. FAB positioning: Doesn't overlap canvas or order rail ✅
13. Safe-area: FAB padding on notched devices ✅
14. Active state: Scale-down feedback on tap ✅
15. Hidden state: Not visible after croppedImage cleared ✅

**C. Drawer Behavior (12 tests)**
16. Open drawer: Slide-up animation smooth ✅
17. Backdrop: Fades in, tappable ✅
18. Tap backdrop: Drawer closes ✅
19. Tap X button: Drawer closes ✅
20. Select style: Calls handleStyleClick, closes drawer ✅
21. iOS scroll lock: Body doesn't scroll ✅
22. Android back: Closes drawer ✅
23. Drag handle: Visual affordance present ✅
24. Header: Title + close button visible ✅
25. Footer: Token counter visible ✅
26. Reduced motion: Spring animation disabled ✅
27. Focus trap: Tab doesn't escape drawer ✅

**D. Style Grid (10 tests)**
28. 2-column layout: On 375px viewport ✅
29. 3-column layout: On 428px viewport ✅
30. Selected state: Purple border + checkmark ✅
31. Cached state: Green "Ready" badge ✅
32. Disabled state: Grayed out when quota exhausted ✅
33. Tap target: Each card ≥44x44px ✅
34. Scroll: Smooth vertical, no horizontal ✅
35. Thumbnail: Loads correctly ✅
36. Text truncation: Long names/descriptions clipped ✅
37. Active state: Visual feedback on tap ✅

**E. Preview Generation (8 tests)**
38. Select new style: StyleForgeOverlay appears ✅
39. Generation completes: Canvas updates ✅
40. FAB updates: Thumbnail + name change ✅
41. Generation fails: Error overlay shown ✅
42. Quota exhausted: Styles disabled in grid ✅
43. Cached preview: Instant load ✅
44. Orientation change: Preview regenerates ✅
45. Multiple rapid selections: Only latest processes ✅

**F. Accessibility (10 tests)**
46. VoiceOver: FAB announced as "Open style picker, button" ✅
47. VoiceOver: Drawer announced as "Dialog, Style Selection" ✅
48. VoiceOver: Style cards announce name + description ✅
49. VoiceOver: Close button announced ✅
50. TalkBack: Same as VoiceOver tests (Android) ✅
51. Keyboard: Tab to FAB, Enter opens drawer ✅
52. Keyboard: Tab through styles ✅
53. Keyboard: Escape closes drawer ✅
54. Color contrast: All text ≥4.5:1 ✅
55. Focus indicators: Visible on keyboard navigation ✅

**G. Edge Cases (12 tests)**
56. No photo uploaded: FAB hidden ✅
57. Network offline: Error handling graceful ✅
58. Rapid FAB taps: No double-open ✅
59. Very long style name: Truncated ✅
60. Very long description: Truncated ✅
61. Slow 3G: Layout doesn't shift ✅
62. Orientation during generation: No crash ✅
63. Route change with drawer open: Drawer closes ✅
64. Browser resize: Responsive breakpoints work ✅
65. Empty styles array: Graceful empty state ✅
66. Token counter null: Hides gracefully ✅
67. Premium user (no limit): Token counter shows ∞ ✅

### 5.3 Performance Validation

**Lighthouse Mobile Audit:**
```bash
npm run build
npm run preview
# Run Lighthouse on /create in mobile mode
# Target scores:
# Performance: ≥90
# Accessibility: ≥95
# Best Practices: ≥95
# SEO: ≥90
```

**Bundle Size Check:**
```bash
npm run build:analyze
# Verify no significant bundle increase
# MobileStyleDrawer should be lazy-loaded chunk
# Check dist/stats.html for bundle composition
```

**Interaction Metrics:**
- First Contentful Paint (FCP): <2s on slow 3G
- Time to Interactive (TTI): <3.5s on slow 3G
- Interaction to Next Paint (INP): <200ms (FAB tap → drawer open)
- Cumulative Layout Shift (CLS): <0.1

### 5.4 Validation Checklist

- [ ] All 67 test scenarios pass
- [ ] Lighthouse mobile score ≥90 (all categories)
- [ ] No console errors/warnings
- [ ] No accessibility violations (axe DevTools)
- [ ] Bundle size delta ≤5KB (gzipped)
- [ ] No visual regression on desktop (1024px+)
- [ ] Real device testing complete (iPhone + Android)

**Test Command:**
```bash
# Run all quality checks
npm run lint
npm run build
npm run build:analyze
```

**Checkpoint:** All tests pass, ready for merge. Proceed to Phase 6.

---

## Phase 6: Merge & Deploy

**Goal:** Merge to main and deploy to production.

**Time:** 30 minutes
**Risk Level:** Low (all testing complete)

### 6.1 Pre-Merge Checklist

- [ ] All phases 1-5 complete
- [ ] All 67 test scenarios passing
- [ ] No linter errors (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Git branch up-to-date with main

### 6.2 Commit Strategy

**Commit Messages:**
```bash
# Phase 1
git add src/sections/StudioConfigurator.tsx
git commit -m "feat(studio): make layout responsive for mobile

- Change root container to block lg:flex
- Hide desktop sidebar on <1024px with lg:block
- Make canvas and config rail full-width on mobile
- No visual changes on desktop (≥1024px)

BREAKING: None
Refs: mobile-studio-implementation-plan.md"

# Phase 2
git add src/components/studio/MobileStyleDrawer.tsx
git commit -m "feat(studio): add mobile style drawer component

- Bottom sheet with slide-up animation (Framer Motion)
- 2-column grid (3-col on wider phones)
- iOS scroll lock + safe-area insets
- Token counter in footer
- Reduced motion support
- Full accessibility (VoiceOver/TalkBack)

BREAKING: None"

# Phase 3
git add src/sections/StudioConfigurator.tsx
git commit -m "feat(studio): integrate mobile FAB and drawer

- Add floating action button at bottom-center
- Show current style thumbnail + name
- Connect FAB to MobileStyleDrawer
- Lazy load drawer component
- Safe-area padding for notched devices

BREAKING: None"

# Phase 4
git add src/components/studio/MobileStyleDrawer.tsx src/index.css
git commit -m "fix(studio): polish iOS/Android mobile experience

- Fix iOS 100vh viewport bug
- Prevent elastic scroll bounce
- Add Android back button support
- Disable double-tap zoom on buttons
- Close drawer on orientation change

BREAKING: None"

# Phase 5 (if any bug fixes)
git commit -m "test(studio): comprehensive cross-device QA

- Tested on iPhone SE, 14 Pro, Galaxy S21
- Fixed [specific bugs found during testing]
- Lighthouse mobile score: 94 (Performance)
- All 67 test scenarios passing"
```

### 6.3 Merge Process

```bash
# 1. Ensure branch is clean
git status

# 2. Update from main
git fetch origin main
git rebase origin/main

# 3. Run final checks
npm run lint && npm run build

# 4. Push feature branch
git push origin feature/mobile-studio-style-picker

# 5. Create pull request on GitHub
# Title: "Mobile Studio Style Picker - Bottom Sheet Implementation"
# Description: Link to mobile-studio-implementation-plan.md
#              Include before/after screenshots
#              List all 67 test scenarios passed

# 6. Request review from team

# 7. After approval, merge via GitHub UI (squash merge recommended)

# 8. Delete feature branch
git checkout main
git pull origin main
git branch -d feature/mobile-studio-style-picker
```

### 6.4 Deployment Strategy

**Option A: Direct Deploy (if confident)**
- Merge to main → Vercel auto-deploys
- Monitor Sentry for errors first 24h
- Track conversion funnel metrics

**Option B: Feature Flag (safer)**
```tsx
// .env
VITE_MOBILE_DRAWER_ENABLED=true

// StudioConfigurator.tsx
const mobileDrawerEnabled = import.meta.env.VITE_MOBILE_DRAWER_ENABLED === 'true';

{mobileDrawerEnabled && (
  <>
    {/* FAB + Drawer */}
  </>
)}
```

**Rollout:**
1. Deploy with flag OFF (10% traffic)
2. Enable for 10% of users, monitor 48h
3. Ramp to 50%, monitor 48h
4. Ramp to 100%, remove flag

### 6.5 Post-Deploy Monitoring

**Week 1 Metrics:**
- Mobile style selection completion rate (target >90%)
- Mobile preview generation rate (target >5/session)
- Error rate (Sentry: target <0.1%)
- Conversion funnel: upload → style → preview → order

**Analytics Events to Track:**
```typescript
// Add to telemetry.ts
export const trackMobileStyleDrawerOpen = () => {
  // Amplitude/GA4 event
};

export const trackMobileStyleSelected = (styleId: string, source: 'fab' | 'drawer') => {
  // Track where user selected style from
};
```

**Success Criteria:**
- ✅ Mobile style selection rate >90% (up from 0%)
- ✅ No increase in error rate
- ✅ No decrease in desktop conversion
- ✅ Lighthouse mobile score maintained (≥90)
- ✅ No critical support tickets

### 6.6 Rollback Plan (if needed)

**If critical issues found:**
```bash
# 1. Revert merge commit
git revert <merge-commit-hash>
git push origin main

# 2. Vercel auto-deploys the revert

# 3. Investigate issue on feature branch

# 4. Fix and re-test

# 5. Re-deploy when ready
```

**Checkpoint:** Feature live in production, metrics tracked. Mission complete! 🚀

---

## Appendix A: Quick Reference Commands

```bash
# Development
npm run dev                # Start dev server
npm run dev -- --host      # Expose to network (for phone testing)

# Quality Checks
npm run lint               # ESLint
npm run build              # Production build
npm run build:analyze      # Bundle analysis
npm run dead-code:check    # Find unused code

# Testing
npm run preview            # Preview production build
# Use Chrome DevTools device emulation
# Or access from phone: http://YOUR_IP:4173/create

# Git Workflow
git status                 # Check branch status
git add <files>            # Stage changes
git commit -m "..."        # Commit with message
git push origin feature/mobile-studio-style-picker

# Branch Management
git checkout main          # Switch to main
git pull origin main       # Update main
git checkout feature/mobile-studio-style-picker
git rebase main            # Rebase feature on latest main
```

---

## Appendix B: Emergency Contacts

**If stuck on any phase:**
1. Check mobile-studio-implementation-plan.md (detailed spec)
2. Review Codex's plan for alternative approaches
3. Test on real device (not just emulator)
4. Check Framer Motion docs for animation issues
5. Review iOS Safari quirks: webkit.org/blog

**Common Pitfalls:**
- Forgetting `lg:` prefix on desktop-only styles
- iOS 100vh including URL bar (use JS viewport height)
- Forgetting safe-area insets on FAB/drawer
- Not testing on real Android device (back button)
- Missing `touch-action: manipulation` (double-tap zoom)

---

**END OF PHASED EXECUTION PLAN**

Ready to proceed with Phase 1? 🚀
