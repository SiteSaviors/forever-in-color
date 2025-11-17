# Wondertone Stock Library - Final Implementation Plan

**Status:** 🔒 **LOCKED** - Do not deviate from this plan without explicit approval
**Document Owner:** Codex
**Last Updated:** 2025-11-14
**Implementation Start:** TBD

---

## Executive Summary

This document defines the complete, locked-in implementation plan for the Wondertone Stock Library feature. This is a two-screen modal experience that allows users to browse curated royalty-free stock images and apply them directly to the Wondertone preview pipeline.

**Key Goals:**
- Enable experimentation with 50+ art styles without requiring personal photo upload
- Premium, conversion-optimized UX that feels like a creative tool, not a database
- Seamless integration with existing preview generation pipeline
- Drive conversion to either: (1) apply stock image + generate preview, or (2) upload own photo

---

## 1. User Experience Flow (Two-Screen Layout)

### Screen 1: Category Selector (Hero Cards)

**Visual Design:**
- 9 large hero cards in a 3×3 grid (desktop) / 2-column grid (mobile)
- Each card: rounded corners, full-bleed background image, white text overlay with category name
- Card style: Similar to attached reference image (rounded image cards with serif text overlay)
- **First card: "Browse All"** - special card showing collage of mixed images
- Remaining 8 cards: Nature & Outdoors, Animals & Wildlife, People & Portraits, Food & Culture, Abstract & Texture, Sci-Fi & Fantasy, Classic & Vintage

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  [Search: "What will you create?"]  🎤        [X]│
├──────────────────────────────────────────────────┤
│                                                  │
│   [Browse All]    [Nature & Outdoors]  [Animals] │
│                                                  │
│   [People]        [Food & Culture]     [Abstract]│
│                                                  │
│   [Sci-Fi]        [Classic & Vintage]           │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Interactions:**
- Clicking any card → transition to Screen 2 (Grid Browser) with that category pre-selected
- Typing in search → immediately transition to Screen 2 with search results
- Search bar always visible (top center)
- Close button (X) always visible (top right)

**Transitions:**
- Premium slide/fade animation (exact animation: designer's choice)
- Smooth, GPU-accelerated

---

### Screen 2: Grid Browser (Infinite Scroll)

**Visual Design:**
- Stock images in CSS Grid layout:
  - Desktop: 4 columns
  - Tablet: 3 columns
  - Mobile: 2 columns
- Each image card: rounded corners, hover effects (scale 1.02, border glow)
- Applied state: checkmark badge + border highlight

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  [Search: "What will you create?"]  🎤        [X]│
│  [← Back to categories]                          │
├──────────────────────────────────────────────────┤
│  [img] [img] [img] [img]                         │
│  [img] [img] [img] [img]                         │
│  [img] [img] [img] [img]                         │
│  ... infinite scroll ...                         │
├──────────────────────────────────────────────────┤
│  [Continue with this image] [Upload my own photo]│
└──────────────────────────────────────────────────┘
```

**Interactions:**
- Back button (← Back to categories) → returns to Screen 1 (category selector)
- Clicking image card → marks as "applied" (checkmark badge appears)
- Only ONE image can be applied at a time (selecting new image deselects previous)
- Infinite scroll via IntersectionObserver (load next batch when sentinel visible)
- Search updates grid in real-time (300ms debounce)

**Footer CTA:**
- **"Continue with this image"** button:
  - Disabled until image is selected
  - When clicked: closes modal, sets stock image in store, returns user to Studio
  - Preview generation does NOT start automatically
- **"Upload my own photo"** link:
  - Always enabled
  - When clicked: closes stock modal, opens Launchpad upload flow

---

## 2. Preview Generation Flow

### Stock Image Selection → Preview Generation

**Step-by-step:**
1. User selects stock image card (checkmark appears)
2. User clicks "Continue with this image"
3. Modal closes, user returns to Studio canvas view
4. Stock image is set in founder store (via `setUploadedImage`, `setCroppedImage`)
5. Orientation auto-sets based on stock image metadata
6. **Preview generation does NOT start yet**
7. User must select a style (if not already selected)
8. **Only when style is selected:** preview generation begins

### Special Case: Style Already Selected

If user had already selected a style before opening stock library:
- After clicking "Continue," preview generation starts **immediately**
- No additional user action required
- Modal closes, preview generates in background

### Special Case: "Try Sample" Button

- Launchpad currently has a "Try Sample" button
- This button will now trigger the stock library modal
- If user had pre-selected a style, applying stock image triggers immediate preview

---

## 3. Authentication & Anonymous Users

### Anonymous User Flow

**Allowed:**
- Browse stock library ✓
- Search/filter categories ✓
- Select stock image ✓
- Click "Continue with this image" ✓

**Gated (requires account creation):**
- Generate preview with stock image ✗
- When anonymous user selects a style (after applying stock image), auth modal opens
- Same auth gate pattern as uploading own photo

**Authenticated User Flow:**
- No restrictions
- Preview generation uses user's token quota
- Same entitlement rules as uploaded photos

**Checkout:**
- Stock images can be used for checkout/print WITHOUT auth requirement
- No licensing restrictions for commercial use

---

## 4. State Management

### Zustand Slice: `stockLibrarySlice.ts`

**State:**
```typescript
{
  // Modal state
  stockLibraryModalOpen: boolean;
  currentView: 'category-selector' | 'grid-browser';

  // Category/filter
  selectedCategory: StockCategory | 'all';
  searchQuery: string;

  // Pagination
  stockImages: StockImage[];
  hasNextPage: boolean;
  nextCursor: string | null;

  // Loading/error
  stockStatus: 'idle' | 'loading' | 'ready' | 'error';
  stockError: string | null;

  // Applied image
  appliedStockImageId: string | null;
  appliedStockImage: StockImage | null;
}
```

**Actions:**
```typescript
openStockLibrary()              // Opens modal to category selector
closeStockLibrary()             // Closes modal, resets state
setView(view)                   // Switch between category-selector / grid-browser
setCategory(category)           // Set category, reset images, fetch
setSearchQuery(query)           // Set search, reset images, fetch
appendStockImages(images)       // Add batch to existing images
applyStockImage(image)          // Mark image as applied
continueWithStockImage()        // Close modal, set in upload store
```

### Categories (9 total)

```typescript
type StockCategory =
  | 'all'                    // Browse All (special - shows mixed categories)
  | 'nature-outdoors'        // Nature & Outdoors
  | 'animals-wildlife'       // Animals & Wildlife
  | 'people-portraits'       // People & Portraits
  | 'food-culture'           // Food & Culture
  | 'abstract-texture'       // Abstract & Texture
  | 'scifi-fantasy'          // Sci-Fi & Fantasy
  | 'classic-vintage';       // Classic & Vintage
```

---

## 5. Database Schema

### Table: `stock_images`

**Already created (metadata seeded per roadmap)**

```sql
CREATE TABLE public.stock_images (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT NOT NULL,      -- 320px WebP thumbnail
  full_url TEXT NOT NULL,           -- Print-ready original
  aspect_ratio NUMERIC(5,2) NOT NULL,
  orientation TEXT NOT NULL,        -- 'horizontal' | 'vertical' | 'square'
  tone_hints TEXT[] DEFAULT '{}',
  color_palette TEXT[] DEFAULT '{}',
  curated_rank INTEGER NOT NULL DEFAULT 999,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stock_images_category ON stock_images(category);
CREATE INDEX idx_stock_images_curated_rank ON stock_images(curated_rank);
CREATE INDEX idx_stock_images_tags ON stock_images USING GIN(tags);

-- RLS: Public read access
CREATE POLICY "Stock images viewable by everyone"
  ON stock_images FOR SELECT USING (true);
```

**Placeholder Data:**
- Until assets are uploaded, show "Coming soon" message for empty categories
- All 8 categories will have images on launch day

---

## 6. API & Edge Function

### Edge Function: `get-stock-library`

**Request:**
```
GET /functions/v1/get-stock-library?category={cat}&search={q}&limit=24&cursor={c}

Headers:
- apikey: <supabase-anon-key>
- Authorization: Bearer <optional-user-token>
```

**Query Parameters:**
- `category` (optional): 'all' | StockCategory - defaults to 'all'
- `search` (optional): string - text search on title + tags
- `limit` (optional): number - defaults to 24
- `cursor` (optional): string - pagination cursor

**Response:**
```json
{
  "images": [
    {
      "id": "stock-nature-001",
      "category": "nature-outdoors",
      "title": "Mountain Sunset",
      "tags": ["mountain", "sunset", "landscape"],
      "thumbnailUrl": "https://storage.../thumb.webp",
      "fullUrl": "https://storage.../full.jpg",
      "aspectRatio": 1.5,
      "orientation": "horizontal",
      "toneHints": ["warm", "dramatic"],
      "colorPalette": ["#ff6b35", "#004e89"]
    }
  ],
  "nextCursor": "abc123" | null,
  "total": 47
}
```

**Authentication:**
- No auth required to fetch stock images
- Anonymous users can browse freely

---

## 7. Component Architecture

### File Structure

```
src/components/studio/stock-library/
├── StockLibraryModal.tsx           # Parent Radix Dialog
├── StockCategorySelector.tsx       # Screen 1 (9 hero cards)
├── StockGridBrowser.tsx            # Screen 2 (infinite scroll grid)
├── StockImageCard.tsx              # Individual grid item
├── StockImageAppliedState.tsx      # Checkmark badge overlay
├── StockSearchField.tsx            # Debounced search input
└── StockLibrarySkeleton.tsx        # Loading states
```

### Component Hierarchy

```
StockLibraryModal
├── Dialog.Root (Radix)
│   ├── Dialog.Overlay
│   └── Dialog.Content
│       ├── Header
│       │   ├── StockSearchField
│       │   └── Close Button [X]
│       ├── Body (conditional render)
│       │   ├── StockCategorySelector (when view === 'category-selector')
│       │   │   └── 9× CategoryHeroCard
│       │   └── StockGridBrowser (when view === 'grid-browser')
│       │       ├── Back Button
│       │       ├── Grid Container
│       │       │   └── StockImageCard[]
│       │       │       └── StockImageAppliedState (if applied)
│       │       └── IntersectionObserver Sentinel
│       └── Footer
│           ├── Button: "Continue with this image" (disabled until applied)
│           └── Link: "Upload my own photo"
```

---

## 8. Integration Points

### Files to Modify

1. **`src/store/useFounderStore.ts`** (line ~644)
   - Import `createStockLibrarySlice`
   - Spread slice into store

2. **`src/store/founder/storeTypes.ts`**
   - Add `StockCategory`, `StockImage`, `StockLibrarySlice` types

3. **`src/sections/studio/components/StudioEmptyState.tsx`**
   - Change "Browse styles first" → "Browse stock images"
   - Wire to `openStockLibrary` action

4. **`src/sections/LaunchpadLayout.tsx`**
   - Update "Try Sample" button to open stock library modal

5. **`src/sections/studio/experience/StudioOverlays.tsx`**
   - Add lazy import: `const StockLibraryModalLazy = lazy(() => import(...))`
   - Add Suspense wrapper with fallback

6. **`src/sections/studio/experience/context.ts`**
   - Add `openStockLibrary: () => void` to context type

7. **`src/config/featureFlags.ts`**
   - Add `VITE_ENABLE_STOCK_LIBRARY` (default: `true` for 100% rollout)

8. **`src/utils/founderPreviewGeneration.ts`**
   - Update idempotency key logic for stock images:
     ```typescript
     const key = imageUrl.includes('/stock/')
       ? `stock:${imageId}:${styleId}:${orientation}`
       : `${hashString(imageUrl)}:${styleId}:${orientation}`;
     ```

---

## 9. Telemetry Events

### Event Schema

**`stock_modal_opened`**
```typescript
{
  source: 'empty_state' | 'try_sample' | 'browse_cta',
  hasUpload: boolean,
  timestamp: number
}
```

**`stock_category_selected`**
```typescript
{
  category: StockCategory | 'all',
  source: 'category_card' | 'back_button',
  timestamp: number
}
```

**`stock_search_performed`**
```typescript
{
  query: string,
  resultCount: number,
  category: StockCategory | 'all',
  timestamp: number
}
```

**`stock_image_applied`**
```typescript
{
  imageId: string,
  category: StockCategory,
  position: number,        // Grid index
  searchActive: boolean,
  timeInModalMs: number,
  timestamp: number
}
```

**`stock_modal_closed`**
```typescript
{
  reason: 'continue' | 'upload_own' | 'dismiss' | 'esc_key',
  durationMs: number,
  imagesViewed: number,
  imageApplied: boolean,
  category: StockCategory | 'all' | null,
  timestamp: number
}
```

---

## 10. Asset Requirements

### Category Hero Images

**Location:** `public/stock-categories/`

**Files (9 total):**
```
all.{jpg,webp,avif}                 # Browse All collage
nature-outdoors.{jpg,webp,avif}
animals-wildlife.{jpg,webp,avif}
people-portraits.{jpg,webp,avif}
food-culture.{jpg,webp,avif}
abstract-texture.{jpg,webp,avif}
scifi-fantasy.{jpg,webp,avif}
classic-vintage.{jpg,webp,avif}
```

**Specifications:**
- Desktop: 600×450px (4:3 aspect ratio)
- Mobile: 400×300px (4:3 aspect ratio)
- Formats: AVIF (primary), WebP (fallback), JPG (final fallback)
- Use `<picture>` element with srcset for responsive delivery

**Stock Image Assets:**
- Minimum 18 images per category for V1 launch
- Thumbnails: 320px wide WebP, optimized for fast load
- Full-res: Print-ready originals stored in Supabase Storage
- CDN: Supabase Storage with 1-year TTL (`Cache-Control: public, max-age=31536000, immutable`)

---

## 11. Modal Sizing & Responsive

### Desktop
- Size: 90vw × 90vh
- Max-width: 1400px
- Centered in viewport
- Border radius: 32px
- Background: `bg-slate-950/95` with `backdrop-blur(20px)`
- Overlay: `bg-slate-950/85`

### Mobile
- Size: 100vw × 100vh (full-screen)
- Border radius: 0 (no rounded corners)
- Same background/overlay

---

## 12. Error Handling

### Network Failures
- **Mid-scroll error:** Show inline error in grid with retry button
- **Initial load error:** Replace entire grid with error state + retry button
- **Error message:** User-friendly text: "Unable to load images. Check your connection and try again."

### Empty States
- **No images in category:** Show "Coming soon - we're curating amazing images for this category"
- **No search results:** Show "No images found. Try different keywords or browse all categories."

### Image Load Failures
- **Thumbnail 404:** Show gray placeholder with icon + "Image unavailable"
- **Full-res URL expired:** Retry once, then show error to user

---

## 13. Accessibility

### Keyboard Navigation
- **Tab order:** Search → Back button (if visible) → Grid items → Footer buttons → Close [X]
- **Enter key:** Apply selected image (same as click)
- **ESC key:** Close modal (Radix Dialog handles automatically)

### Screen Readers
- Modal title: "Browse Stock Images"
- ARIA live region for result count: "{count} images in {category}"
- Applied state announcement: "Applied to canvas"
- Image alt text: "Stock image: {title}"

### Reduced Motion
- Respect `prefers-reduced-motion` media query
- Disable hover scale animations
- Use fade transitions instead of slide/scale

---

## 14. Performance Optimizations

### Image Loading
- All images: `loading="lazy" decoding="async"`
- Width/height attributes to prevent CLS
- IntersectionObserver for infinite scroll (rootMargin: '200px' to prefetch)

### Pagination
- Cursor-based (NOT offset-based) for better performance at scale
- Load 24 images per batch
- Trigger next load at 50% scroll (user never sees loading)

### Caching
- Stock image metadata cached in store (no refetch on category switch)
- Thumbnail images cached by browser (immutable URLs)
- Preview generation reuses `preview_cache_entries` table

---

## 15. Implementation Phases

### Phase 1: Backend Foundation (Week 1)
- ✅ Database migration (stock_images table already created per roadmap)
- ✅ Seed data (metadata already seeded per roadmap)
- [ ] Edge function: `get-stock-library`
- [ ] API client: `src/utils/stockLibraryApi.ts`
- [ ] Telemetry: `src/utils/stockLibraryTelemetry.ts`

### Phase 2: State Management (Week 1)
- [ ] Create `stockLibrarySlice.ts`
- [ ] Add types to `storeTypes.ts`
- [ ] Integrate slice into `useFounderStore`
- [ ] Create `useDebounce.ts` hook

### Phase 3: Core Components (Week 2)
- [ ] Create `StockLibraryModal.tsx` (Radix Dialog shell)
- [ ] Create `StockCategorySelector.tsx` (9 hero cards)
- [ ] Create `StockSearchField.tsx` (debounced input)
- [ ] Create `StockLibrarySkeleton.tsx` (loading states)

### Phase 4: Grid Browser (Week 2)
- [ ] Create `StockGridBrowser.tsx` (infinite scroll grid)
- [ ] Create `StockImageCard.tsx` (grid item with hover states)
- [ ] Create `StockImageAppliedState.tsx` (checkmark overlay)
- [ ] Implement IntersectionObserver pagination

### Phase 5: Integration (Week 3)
- [ ] Update `StudioEmptyState.tsx` ("Browse styles images" button --> Change to "Browse Our Library")
- [ ] Update `LaunchpadLayout.tsx` ("Try Sample First --> Browse Our Library")
- [ ] Add lazy import to `StudioOverlays.tsx`
- [ ] Wire preview generation pipeline
- [ ] Update idempotency key logic


---

## 16. Testing Checklist

### Functional Testing
- [ ] Modal opens from empty state "Browse stock images" button
- [ ] Modal opens from Launchpad "Try Sample" button
- [ ] 9 category cards display with hero images
- [ ] Clicking category card transitions to grid browser
- [ ] Back button returns to category selector
- [ ] Search field updates grid in real-time (300ms debounce)
- [ ] Infinite scroll loads next batch when scrolling near bottom
- [ ] Clicking image card applies it (checkmark appears)
- [ ] Only one image can be applied at a time
- [ ] "Continue" button disabled until image applied
- [ ] "Continue" closes modal and sets stock image in store
- [ ] "Upload my own photo" closes modal and opens Launchpad
- [ ] Close [X] button closes modal
- [ ] ESC key closes modal

### Preview Generation Flow
- [ ] Stock image sets `uploadedImage` and `croppedImage` in store
- [ ] Orientation auto-sets based on stock image metadata
- [ ] If no style selected, preview does not generate
- [ ] If style already selected, preview generates immediately on "Continue"
- [ ] Anonymous users can browse and apply stock images
- [ ] Anonymous users see auth modal when selecting style
- [ ] Authenticated users can generate previews with stock images

### Error Handling
- [ ] Network failure shows retry button
- [ ] Empty category shows "Coming soon" message
- [ ] No search results shows helpful message
- [ ] Image load failure shows placeholder
- [ ] Edge function error shows user-friendly message

### Accessibility
- [ ] Tab order is logical (search → grid → footer → close)
- [ ] Enter key applies image
- [ ] ESC key closes modal
- [ ] Screen reader announces result count
- [ ] Applied state announced to screen readers
- [ ] All images have alt text
- [ ] Reduced motion respected

### Performance
- [ ] Images lazy load
- [ ] No Cumulative Layout Shift (CLS)
- [ ] Infinite scroll smooth (no janky scrolling)
- [ ] Modal opens/closes smoothly
- [ ] Bundle size acceptable (< 50KB gzipped for new code)

### Mobile Responsive
- [ ] Full-screen modal on mobile
- [ ] 2-column grid on mobile
- [ ] Touch targets ≥48px
- [ ] Search field usable on mobile
- [ ] Back button easy to tap
- [ ] Footer buttons accessible

---

## 17. Success Metrics

### Primary KPIs
- **Stock modal open rate:** % of sessions where stock modal is opened
- **Stock image applied rate:** % of modal opens that result in image application
- **Stock → preview conversion:** % of applied images that generate previews
- **Stock → checkout conversion:** % of stock previews that convert to checkout

### Secondary Metrics
- **Average time to first apply:** Seconds from modal open to first image application
- **Images viewed per session:** Average number of images viewed before apply/close
- **Category distribution:** Which categories are most popular
- **Search usage rate:** % of sessions using search vs. browsing
- **Modal abandonment rate:** % of opens that close without action

### Comparison Metrics
- **Stock vs. upload conversion:** Compare checkout rates for stock vs. personal uploads
- **Stock vs. upload preview quality:** User satisfaction scores
- **Stock vs. upload time to checkout:** Average journey duration

---

## 18. Launch Strategy

### Feature Flag
- **Default value:** `VITE_ENABLE_STOCK_LIBRARY=true`
- **Rollout:** 100% immediately after V1 complete
- **No gradual rollout:** Ship to all users on launch day

### Launch Phases
1. **Internal testing:** Team tests all flows (Phase 6)
2. **Asset upload:** Upload all stock images to Supabase Storage
3. **Deploy edge function:** Deploy `get-stock-library` to production
4. **Deploy frontend:** Merge PR to main, deploy to production
5. **Monitor metrics:** Watch telemetry for issues in first 24 hours

### Rollback Plan
- If critical bug discovered: set `VITE_ENABLE_STOCK_LIBRARY=false` and redeploy
- Stock library feature will be hidden from UI
- No data loss (all stock images persist in database)

---

## 19. Non-Negotiables (DO NOT CHANGE)

1. **Two-screen layout:** Category selector → Grid browser (NOT one-screen)
2. **9 category cards:** "Browse All" + 8 categories (image-based cards, NOT text pills)
3. **Modal closes on "Continue":** User returns to Studio (modal does NOT stay open)
4. **Preview generates ONLY when style selected:** Not automatic on "Continue"
5. **Anonymous users gated at style selection:** Same as upload flow
6. **Feature flag default: true:** Launch to 100% immediately
7. **No localStorage skip:** Always show category selector first (all users)
8. **Search always visible:** Top center, never hidden
9. **Back button in grid:** Returns to category selector
10. **Only one applied image:** Selecting new image deselects previous

---

## 20. Open Questions (TO BE RESOLVED BEFORE PHASE 1)

### Assets
- [ ] Who is uploading the stock images to Supabase Storage?
- [ ] Do we have 18+ images per category ready for V1 launch?
- [ ] Who is creating the 9 category hero images?

### Design
- [ ] Exact transition animation between screens (slide left? fade? scale?)
- [ ] Exact color values for applied state border/badge
- [ ] Exact glassmorphism values for modal background

### Technical
- [ ] Do we need to set `sourceStoragePath` for stock images in preview generation?
- [ ] Should stock image previews have different cache TTL than user uploads?

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-14 | Initial locked plan | Codex |

---

**🔒 This plan is LOCKED. Any deviations require explicit approval and document update.**
