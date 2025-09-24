0. Purpose & Scope
- Anchor every change to Wondertone's premium AI canvas experience; maintain performance, UX, and maintainability expectations set by product docs (README.md:1-9).
```md
# README.md:1-9
# Wondertone - AI-Generated Canvas Artwork

Wondertone is a premium e-commerce service that transforms personal photos into stunning, AI-generated canvas artwork. This project is the complete web application for the Wondertone service, built with a focus on performance, user experience, and long-term maintainability.

## Core Features

* **AI Art Generation:** Users can upload their personal photos and choose from a variety of unique AI-powered art styles.
```
- Follow the established VS Code-first workflow so reviews map to the founder playbook before touching code (FOUNDER_WORKFLOW.md:14-33).
```md
# FOUNDER_WORKFLOW.md:14-33
## Daily quick-start checklist
1) Open the repo in VS Code
- File → Open Folder… → select the project folder.

2) Create a safe workspace (new branch)
- Bottom-left status bar: click the branch name → “Create new branch…”
- Name it (example: feat/bundle-trim) → confirm “Switch to new branch”.

3) Make changes and preview differences
- Before saving: press Cmd+Shift+P → “File: Compare Active File with Saved” for side-by-side before/after.
```
- Every session begins with an Agents Summary handshake: acknowledge you have reread this document and surface the relevant guardrails before discussing plans or code (see Section 3).

1. Derived Goals (ranked)
- Preserve the four-step configurator flow and its gating logic so customers can progress without regressions (src/pages/Product.tsx:45-68).
```tsx
// src/pages/Product.tsx:45-68
      <ProgressOrchestrator>
        <div className="pt-16">
          <ProductHeader 
            completedSteps={completedSteps}
            totalSteps={4}
            currentStep={currentStep}
            onUploadClick={handleUploadClick}
          />
          
          <ProductContent
            currentStep={currentStep}
            completedSteps={completedSteps}
```
- Style landing pages are copy-varied clones; maintain pixel parity unless a dedupe effort is planned (src/pages/ClassicOilPainting.tsx:33-48).
```tsx
// src/pages/ClassicOilPainting.tsx:33-48
    <div className="min-h-screen bg-white">
      <Header />
      
      <ClassicOilHero onStartCreating={handleStartCreating} />

      {/* Emotional Description */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-gray-700 leading-relaxed">
```
- Edge functions must keep AI preview throughput while safeguarding configuration fallbacks (supabase/functions/generate-style-preview/index.ts:74-120).
```ts
// supabase/functions/generate-style-preview/index.ts:74-120
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stylePromptService = new StylePromptService(supabase);

    // Get the tested, specific prompt for this style
    let stylePrompt: string;
    try {
      const fetchedPrompt = await stylePromptService.getStylePrompt(style);
      if (fetchedPrompt) {
        stylePrompt = fetchedPrompt;
      } else {
```

2. Guardrails (derived, not prescriptive)
- Progress context carries wide state (behavior, social proof, AI analysis); avoid unnecessary provider churn and confine updates (src/components/product/progress/progressReducer.ts:4-34).
```ts
// src/components/product/progress/progressReducer.ts:4-34
export const initialState: ProgressState = {
  currentStep: 1,
  currentSubStep: 'upload',
  completedSteps: [],
  userBehavior: {
    hesitationCount: 0,
    timeOnStep: 0,
    lastInteraction: Date.now(),
    hoverDuration: 0,
```
- `usePreviewGeneration` is instantiated both in the product state hook and inside `ProductContent`; coordinate changes so preview caches stay in sync (useProductFlow.ts:27-33, ProductContent.tsx:43-46).
```ts
// useProductFlow.ts:27-33
  const {
    previewUrls,
    autoGenerationComplete,
    setPreviewUrls,
    setAutoGenerationComplete
  } = usePreviewGeneration(uploadedImage, selectedOrientation);
```
```tsx
// ProductContent.tsx:43-46
  // Get the actual preview URLs from the state management system
  const { previewUrls, autoGenerationComplete: previewGenerationComplete } = usePreviewGeneration(uploadedImage, selectedOrientation);
```
- Global animation utilities rely on `filter` and large shadows; prefer GPU-friendly transforms when adding effects (src/index.css:121-129 & 420-424).
```css
/* src/index.css:121-129 */
@keyframes premium-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(236, 72, 153, 0.3));
  }
```
- Exit-intent logic attaches document/window listeners; ensure cleanup and debounce any new triggers (src/components/ExitIntentPopup.tsx:9-24).
```tsx
// src/components/ExitIntentPopup.tsx:9-24
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    };

    const handleBeforeUnload = () => {
```

3. Required Workflow (non-negotiable)
- Phase 0 happens before *any* planning, analysis, or code change: re-read this document, respond with ≤10 bullets summarizing the applicable rules (cite file:line), and list the checklist you will follow. Do not propose a plan, solution outline, or edits until this summary is delivered and acknowledged (progressReducer guidance above).
- Use the founder’s VS Code workflow for branching, diffing, and running scripts before any git operations (FOUNDER_WORKFLOW.md:14-33).
```md
# FOUNDER_WORKFLOW.md:14-33
2) Create a safe workspace (new branch)
- Bottom-left status bar: click the branch name → “Create new branch…”
...
4) Run the app (without terminal)
- Explorer panel → “NPM Scripts” → expand:
  - dev → click the play icon to start the dev server ...
```
- Run repo checks (`npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check`) after edits to keep consistency (package.json:12-24).
```json
// package.json:12-24
    "lint": "eslint .",
    "lint:unused": "eslint . --ext .ts,.tsx --fix",
    "preview": "vite preview",
    "dead-code:check": "npm run dead-code:exports && npm run dead-code:files && npm run dead-code:deps",
    "deps:analyze": "madge --circular --extensions ts,tsx src/",
    "deps:check": "depcheck",
```

4. Commit/Branching
- Keep main stable with short-lived feature branches and small commits (FOUNDER_WORKFLOW.md:60-64).
```md
# FOUNDER_WORKFLOW.md:60-64
## Branching strategy (keep main stable)
- Create a branch per task:
  - feat/<thing>, fix/<issue>, chore/<maintenance>, docs/<docs-change>.
- Commit small, meaningful changes frequently.
- Merge to main via Pull Requests.
```

5. Checks & Budgets (derived)
- Default checks: `npm run lint`, `npm run build`, `npm run build:analyze`, `npm run deps:check` (package.json:12-24).
```json
// package.json:12-24
    "lint": "eslint .",
    "build": "vite build",
  "build:analyze": "ANALYZE=1 vite build",
    "dead-code:check": "npm run dead-code:exports && npm run dead-code:files && npm run dead-code:deps",
```
- Current bundle baseline is a 786 KB main chunk; treat that as the ceiling until reduced (dist/assets listing).
```bash
$ ls -lh dist/assets
-rw-r--r--  1 admin  staff   786K ... index-jYUdWBbO.js
-rw-r--r--  1 admin  staff   185K ... index-FKNySJV-.css
```

6. Front-end Practices (derived)
- Style landers share the same scroll/watch pattern; batch refactors or fixes across them (ClassicOilPainting.tsx:16-30 & WatercolorDreams.tsx:14-27).
```tsx
// ClassicOilPainting.tsx:16-30
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
```
```tsx
// WatercolorDreams.tsx:14-27
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
```
- Consolidate payment logic via the shared hook to avoid duplication and divergent behavior (src/hooks/useStripePayment.ts:23-78 vs src/components/product/hooks/useStripePayment.ts:17-43).
```ts
// src/hooks/useStripePayment.ts:23-45
export const useStripePayment = ({ customerEmail }: UseStripePaymentProps = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
...
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: items.reduce((total, item) => total + (item.amount * (item.quantity || 1)), 0),
```
```ts
// src/components/product/hooks/useStripePayment.ts:17-35
export const useStripePayment = ({ customerEmail }: UseStripePaymentProps = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
...
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: items.reduce((total, item) => total + (item.amount * (item.quantity || 1)), 0),
```
- Carousel autoplay sets timers; debounce further interactions to avoid jank (src/hooks/useCarouselAutoplay.tsx:22-30).
```tsx
// src/hooks/useCarouselAutoplay.tsx:22-30
  useEffect(() => {
    if (!isAutoPlaying || !hasInitialRotated) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artStyles.length);
    }, 3000);
```
- StyleCard layers multiple hooks and lightbox state; review interactions holistically when changing card UX (src/components/product/StyleCard.tsx:20-56).
```tsx
// src/components/product/StyleCard.tsx:20-56
const StyleCard = memo((props: StyleCardProps) => {
  const {
    style,
    croppedImage,
    isPopular = false,
    cropAspectRatio,
    shouldBlur = false
  } = props;

  // Consolidated hooks
  const {
```

7. Edge Function Practices (derived)
- Style prompts are retrieved per request; ensure DB access remains fast and errors fall back cleanly (stylePromptService.ts:5-20).
```ts
// stylePromptService.ts:5-20
      const { data, error } = await this.supabase
        .from('style_prompts')
        .select('prompt')
        .eq('style_id', styleId)
        .single();
```
- Polling retries stack quickly (30 attempts × executeWithRetry); budget work to trim intervals or add webhooks (pollingService.ts:10-24, errorHandling.ts:145-166).
```ts
// pollingService.ts:10-24
    const maxAttempts = 30;
    const pollInterval = 2000;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await executeWithRetry(async () => {
        const response = await fetch(getUrl, {
```
```ts
// errorHandling.ts:145-166
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const parsedError = EnhancedErrorHandler.parseError(error);
```
- Token spend flows re-invoke preview generation; guard against double charges on failure paths (remove-watermark/index.ts:57-90).
```ts
// remove-watermark/index.ts:57-90
    const { data: tokenResult } = await supabase.rpc('update_token_balance', {
      p_user_id: user.id,
      p_amount: -tokens,
      p_type: 'spend',
      p_description: `Watermark removal - ${styleName} (${resolution})`
    });
...
    const { data: cleanImageData, error: generateError } = await supabase.functions.invoke('generate-style-preview', {
      body: {
        imageUrl,
```

8. Deletion Policy
- Use the scripted dead-code sweep before removals and document findings (package.json:12-20).
```json
// package.json:12-20
    "dead-code:check": "npm run dead-code:exports && npm run dead-code:files && npm run dead-code:deps",
    "dead-code:exports": "ts-unused-exports tsconfig.json --excludePathsFromReport=src/main.tsx,src/App.tsx,src/pages",
    "dead-code:files": "unimported --flow --init --update",
```
- Confirm zero references (e.g., CanvasWatermarkService currently only defines unused helpers) before deletion (rg output).
```bash
$ rg "CanvasWatermarkService" -n
supabase/functions/generate-style-preview/canvasWatermarkService.ts:4:export class CanvasWatermarkService {
```

9. Acceptance Criteria Templates
- ✅ Pixel parity on configurator + style landers (see Product.tsx snippet above and landing page snippet).
- ✅ `npm run lint && npm run build` succeed (package.json:12-14).
- ✅ AI preview API contract unchanged (generate-style-preview/index.ts:62-120).
- ✅ No regressions in token flows (remove-watermark/index.ts:57-124).

10. Runbooks / Scripts (optional)
- Launch, analyze, and audit via the VS Code NPM Scripts panel per founder guide (FOUNDER_WORKFLOW.md:24-33).
```md
# FOUNDER_WORKFLOW.md:24-33
4) Run the app (without terminal)
- Explorer panel → “NPM Scripts” → expand:
  - dev → click the play icon to start the dev server (opens your app in the browser).
  - build → builds production files.
  - build:analyze → builds and opens a bundle size treemap (dist/stats.html).
```
