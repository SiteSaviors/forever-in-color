# Gallery Quickview V1 — Complete Implementation Specification

> **Status**: Ready for Implementation
> **Owner**: Development Team
> **Target**: V1 Launch (Gallery-only, no recents tab)
> **V2 Scope**: Hybrid view with recents tab, hover actions (Create Canvas, Download, Save), Shift-click A/B comparison

---

## Table of Contents
1. [Product Requirements](#product-requirements)
2. [Technical Architecture](#technical-architecture)
3. [Backend Changes](#backend-changes)
4. [Frontend Implementation](#frontend-implementation)
5. [UI/UX Specification](#uiux-specification)
6. [Animation & Motion Design](#animation--motion-design)
7. [Data Flow & State Management](#data-flow--state-management)
8. [Telemetry & Analytics](#telemetry--analytics)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Timeline](#implementation-timeline)

---

## Product Requirements

### Core Behavior

**What it is**: A horizontal scrollable strip of the user's last 15 saved gallery items, positioned between the ActionGrid and "See It In Your Space" section in the Studio center rail.

**Key Constraints**:
- **Content Scope**: Last 15 gallery items, ordered newest → oldest
- **Viewport**: Show 5 thumbnails without scrolling; horizontal scroll reveals remaining 10
- **Thumbnail Content**: Rounded image + style name label below
- **Click Behavior**: Instantly swap main preview + recall original uploaded photo from Supabase
- **Save Animation**: Image "drops" from preview window into gallery strip on successful save
- **Empty State**: "Gallery Quickview" headline + "Save your favorite styles to see them here" subtext
- **Error Handling**: Silently hide strip if fetch fails (no error toast)
- **Scope**: Saved items ONLY (no active unsaved previews)

### User Expectations

#### When User Saves to Gallery
1. User clicks "Save to Gallery" in ActionGrid
2. Success toast appears: "Saved to gallery"
3. **New thumbnail animates into the gallery strip** with a "drop" motion from above
4. Strip scrolls to show the new item at position 0 (leftmost)
5. Animation completes in ~1.2 seconds

#### When User Clicks a Thumbnail
1. Thumbnail receives instant visual feedback (border color change)
2. Main preview swaps to the saved styled image
3. **Original uploaded photo is recalled** from Supabase storage
4. Store state restores:
   - `uploadedImage`, `croppedImage`, `originalImage` (original photo)
   - `orientation` (matches saved item)
   - `selectedStyleId` (matches saved style)
   - `smartCrops[orientation]` (exact crop used when saved)
   - Preview cache (uses saved preview URL, skips regeneration)
5. Canvas-in-room preview updates to show the new style
6. User can now generate NEW styles from that original photo

#### When User Has Zero Saved Items
1. Strip shows empty state:
   - Headline: **"Gallery Quickview"**
   - Subtext: **"Save your favorite styles to see them here"**
2. No thumbnails, no scroll container
3. Takes up minimal vertical space

#### When Gallery Fetch Fails
1. Strip does not render at all (returns `null`)
2. No error message shown to user
3. No layout shift in center rail

### Cross-Device Behavior

**Desktop (≥1024px)**:
- Thumbnails: 120px × 120px
- Gap between items: 12px
- Show 5 items in viewport
- Horizontal scroll with fade gradient on right edge

**Tablet (768px - 1023px)**:
- Thumbnails: 100px × 100px
- Gap: 10px
- Show 4 items in viewport

**Mobile (<768px)**:
- Thumbnails: 80px × 80px
- Gap: 8px
- Show 3-4 items in viewport (depends on screen width)

**All Devices**:
- Horizontal scroll enabled
- CSS `scroll-snap-type: x mandatory` for smooth snap behavior
- Hide scrollbar (`scrollbar-hide` utility)
- Fade gradient indicator on right edge (signals more content)

---

## Technical Architecture

### Data Storage Strategy

#### Preview Logs Extension
Every style preview generation creates a `preview_log` entry. We extend this table to store the **source photo** and **crop metadata**:

```sql
-- New columns in preview_logs table
ALTER TABLE preview_logs
  ADD COLUMN source_storage_path TEXT,
  ADD COLUMN crop_config JSONB;
```

**Example `crop_config` structure**:
```json
{
  "x": 150,
  "y": 200,
  "width": 1200,
  "height": 1600,
  "orientation": "vertical"
}
```

**Why this works**:
- Every gallery item links to a `preview_log_id`
- Preview log contains the original photo path (`source_storage_path`)
- Preview log contains exact crop coordinates (`crop_config`)
- On thumbnail click, we follow the chain: `gallery_item` → `preview_log` → `user_uploads/<path>`

#### Thumbnail Generation
When user saves to gallery, backend generates a 200px optimized thumbnail:

**Storage Path**: `thumbnails/<galleryItemId>.jpg`

**Why pre-generate**:
- Supabase storage doesn't support on-the-fly transforms
- Loading 15 full 4K previews = 15-30 MB (unacceptable)
- 200px thumbnails = ~10 KB each = ~150 KB total (acceptable)
- Instant load time, no runtime processing

**Implementation**: Use `sharp` (Node.js) or `jimp` in the edge function to resize.

### Updated Gallery Item Schema

```typescript
export interface GalleryItem {
  // Existing fields
  id: string;
  userId: string | null;
  previewLogId: string | null;
  styleId: string;
  styleName: string;
  orientation: 'horizontal' | 'vertical' | 'square';
  imageUrl: string;              // Full styled preview (4K)
  displayUrl: string;            // Watermarked variant for free users
  storagePath: string;           // Path to styled preview in storage
  isFavorited: boolean;
  isDeleted: boolean;
  downloadCount: number;
  lastDownloadedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // NEW FIELDS for Gallery Quickview
  thumbnailUrl: string;          // 200px optimized thumbnail
  sourceStoragePath: string;     // Original photo path (from preview_logs)
  cropConfig: {                  // Crop metadata (from preview_logs)
    x: number;
    y: number;
    width: number;
    height: number;
    orientation: string;
  } | null;
}
```

---

## Backend Changes

### 1. Database Migration

**File**: `supabase/migrations/YYYYMMDDHHMMSS_extend_preview_logs_for_gallery.sql`

```sql
-- Add source photo tracking and crop metadata to preview_logs
ALTER TABLE preview_logs
  ADD COLUMN IF NOT EXISTS source_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS crop_config JSONB;

-- Add comment for documentation
COMMENT ON COLUMN preview_logs.source_storage_path IS
  'Path to original uploaded photo in user_uploads bucket (e.g., user_uploads/<userId>/<photoId>.jpg)';

COMMENT ON COLUMN preview_logs.crop_config IS
  'JSON object containing crop coordinates: { x, y, width, height, orientation }';
```

### 2. Update Preview Generation Flow

**File**: `supabase/functions/generate-style-preview/index.ts`

**Changes**:
1. Accept `sourceStoragePath` in request body (from frontend)
2. Accept `cropConfig` in request body (from frontend's smart crop result)
3. When creating preview log entry, store both fields:

```typescript
// Inside generate-style-preview handler
const { imageUrl, style, photoId, aspectRatio, options, sourceStoragePath, cropConfig } = requestBody;

// Create preview log entry
const { data: previewLog, error: logError } = await supabase
  .from('preview_logs')
  .insert({
    user_id: userId,
    style_id: style,
    photo_id: photoId,
    aspect_ratio: aspectRatio,
    preview_url: generatedPreviewUrl,
    source_storage_path: sourceStoragePath,  // NEW
    crop_config: cropConfig,                 // NEW
    status: 'completed',
    created_at: new Date().toISOString(),
  })
  .select()
  .single();
```

### 3. Update Gallery Save Flow

**File**: `supabase/functions/save-to-gallery/index.ts`

**Changes**:
1. After saving gallery item to DB, generate thumbnail
2. Store thumbnail in `thumbnails/` bucket
3. Return `thumbnailUrl` in response

```typescript
// Inside save-to-gallery handler (after DB insert)
import sharp from 'sharp';

// 1. Download the full preview from storage
const { data: previewBlob, error: downloadError } = await supabase
  .storage
  .from('preview-cache')
  .download(storagePath);

if (downloadError) throw downloadError;

// 2. Resize to 200px thumbnail
const thumbnailBuffer = await sharp(await previewBlob.arrayBuffer())
  .resize(200, 200, { fit: 'cover', position: 'center' })
  .jpeg({ quality: 80 })
  .toBuffer();

// 3. Upload thumbnail
const thumbnailPath = `thumbnails/${galleryItemId}.jpg`;
const { error: uploadError } = await supabase
  .storage
  .from('preview-cache') // Or dedicated 'thumbnails' bucket
  .upload(thumbnailPath, thumbnailBuffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });

if (uploadError) throw uploadError;

// 4. Get public URL
const { data: { publicUrl: thumbnailUrl } } = supabase
  .storage
  .from('preview-cache')
  .getPublicUrl(thumbnailPath);

// 5. Return in response
return new Response(JSON.stringify({
  success: true,
  galleryItemId,
  thumbnailUrl,         // NEW
  alreadyExists: false,
}), { status: 200 });
```

### 4. Update Gallery Fetch Flow

**File**: `supabase/functions/get-gallery/index.ts`

**Changes**:
1. JOIN with `preview_logs` table to fetch `source_storage_path` and `crop_config`
2. Include `thumbnail_url` from `gallery_items` table (store it during save)
3. Return extended schema

```typescript
// Inside get-gallery handler
const { data: items, error } = await supabase
  .from('gallery_items')
  .select(`
    id,
    user_id,
    preview_log_id,
    style_id,
    style_name,
    orientation,
    image_url,
    display_url,
    storage_path,
    thumbnail_url,
    is_favorited,
    is_deleted,
    download_count,
    last_downloaded_at,
    created_at,
    updated_at,
    preview_logs!inner(
      source_storage_path,
      crop_config
    )
  `)
  .eq('user_id', userId)
  .eq('is_deleted', false)
  .order('created_at', { ascending: false })
  .limit(limit);

// Flatten preview_logs data into response
const formattedItems = items.map(item => ({
  ...item,
  sourceStoragePath: item.preview_logs.source_storage_path,
  cropConfig: item.preview_logs.crop_config,
  preview_logs: undefined, // Remove nested object
}));

return new Response(JSON.stringify({
  items: formattedItems,
  total: items.length,
  limit,
  offset: 0,
}));
```

---

## Frontend Implementation

### 1. New Store Slice: Gallery

**File**: `src/store/founder/gallerySlice.ts`

```typescript
import type { StateCreator } from 'zustand';
import type { FounderStore } from '../useFounderStore';
import { supabase } from '@/utils/supabaseClient';

export interface GallerySliceState {
  lastSavedGalleryItemId: string | null;
}

export interface GallerySliceActions {
  loadGalleryItem: (item: GalleryItem) => Promise<void>;
  setLastSavedGalleryItemId: (id: string | null) => void;
}

export type GallerySlice = GallerySliceState & GallerySliceActions;

export const createGallerySlice: StateCreator<
  FounderStore,
  [],
  [],
  GallerySlice
> = (set, get) => ({
  // State
  lastSavedGalleryItemId: null,

  // Actions
  setLastSavedGalleryItemId: (id) => {
    set({ lastSavedGalleryItemId: id });
  },

  loadGalleryItem: async (item) => {
    try {
      // 1. Fetch original photo from user_uploads bucket
      const { data: photoBlob, error: downloadError } = await supabase
        .storage
        .from('user_uploads')
        .download(item.sourceStoragePath);

      if (downloadError) {
        console.error('[loadGalleryItem] Failed to fetch original photo:', downloadError);
        return;
      }

      // 2. Convert blob to data URL
      const photoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(photoBlob);
      });

      // 3. Apply crop using stored crop_config
      let croppedDataUrl = photoDataUrl;
      if (item.cropConfig) {
        const { x, y, width, height } = item.cropConfig;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        await new Promise<void>((resolve) => {
          img.onload = () => {
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, x, y, width, height, 0, 0, width, height);
            croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
            resolve();
          };
          img.src = photoDataUrl;
        });
      }

      // 4. Update store state
      set({
        uploadedImage: photoDataUrl,
        originalImage: photoDataUrl,
        croppedImage: croppedDataUrl,
        orientation: item.cropConfig?.orientation || item.orientation,
        selectedStyleId: item.styleId,
      });

      // 5. Restore smart crop metadata
      const { orientation } = item.cropConfig || { orientation: item.orientation };
      set((state) => ({
        smartCrops: {
          ...state.smartCrops,
          [orientation]: item.cropConfig || undefined,
        },
      }));

      // 6. Inject preview into cache (skip regeneration)
      set((state) => ({
        previews: {
          ...state.previews,
          [item.styleId]: {
            ...state.previews[item.styleId],
            [orientation]: {
              status: 'ready' as const,
              data: {
                previewUrl: item.imageUrl,
                storagePath: item.storagePath,
                storageUrl: item.imageUrl,
              },
              requestId: null,
              error: null,
            },
          },
        },
      }));
    } catch (error) {
      console.error('[loadGalleryItem] Error loading gallery item:', error);
    }
  },
});
```

### 2. Integrate Gallery Slice into Main Store

**File**: `src/store/useFounderStore.ts`

```typescript
import { createGallerySlice, type GallerySlice } from './founder/gallerySlice';

export type FounderStore = PreviewSlice &
  EntitlementSlice &
  SessionSlice &
  FavoritesSlice &
  GallerySlice; // ADD THIS

export const useFounderStore = create<FounderStore>()(
  devtools(
    (...args) => ({
      ...createPreviewSlice(...args),
      ...createEntitlementSlice(...args),
      ...createSessionSlice(...args),
      ...createFavoritesSlice(...args),
      ...createGallerySlice(...args), // ADD THIS
    }),
    { name: 'FounderStore' }
  )
);
```

### 3. React Query Hook for Gallery Items

**File**: `src/hooks/studio/useGalleryItems.ts`

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGalleryItems } from '@/utils/galleryApi';
import type { GalleryItem } from '@/utils/galleryApi';

export const GALLERY_ITEMS_QUERY_KEY = 'gallery-items';

export const useGalleryItems = (accessToken: string | null) => {
  return useQuery<GalleryItem[], Error>({
    queryKey: [GALLERY_ITEMS_QUERY_KEY, accessToken],
    queryFn: async () => {
      const result = await fetchGalleryItems(
        { limit: 15, sort: 'newest' },
        accessToken
      );

      if ('error' in result) {
        throw new Error(result.error);
      }

      return result.items;
    },
    enabled: !!accessToken,
    staleTime: 30_000, // 30 seconds
    retry: false, // Fail silently
  });
};

export const useInvalidateGalleryItems = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [GALLERY_ITEMS_QUERY_KEY] });
};
```

### 4. Gallery Quickview Component

**File**: `src/components/studio/GalleryQuickview.tsx`

```typescript
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGalleryItems } from '@/hooks/studio/useGalleryItems';
import { useStudioUserState } from '@/store/hooks/studio/useStudioUserState';
import { useFounderStore } from '@/store/useFounderStore';
import {
  trackGalleryQuickviewShown,
  trackGalleryQuickviewThumbnailClick,
  trackGalleryItemLoaded,
} from '@/utils/galleryQuickviewTelemetry';

export const GalleryQuickview = () => {
  const { sessionAccessToken } = useStudioUserState();
  const loadGalleryItem = useFounderStore((state) => state.loadGalleryItem);
  const lastSavedGalleryItemId = useFounderStore((state) => state.lastSavedGalleryItemId);

  const { data: items, isError, isLoading } = useGalleryItems(sessionAccessToken);
  const [hasTrackedShown, setHasTrackedShown] = useState(false);

  // Track when quickview becomes visible
  useEffect(() => {
    if (items && items.length > 0 && !hasTrackedShown) {
      trackGalleryQuickviewShown(items.length);
      setHasTrackedShown(true);
    }
  }, [items, hasTrackedShown]);

  // Handle thumbnail click
  const handleLoadGalleryItem = async (item: GalleryItem, index: number) => {
    const startTime = Date.now();

    trackGalleryQuickviewThumbnailClick({
      galleryItemId: item.id,
      styleId: item.styleId,
      styleName: item.styleName,
      position: index,
    });

    await loadGalleryItem(item);

    const loadTimeMs = Date.now() - startTime;
    trackGalleryItemLoaded({
      galleryItemId: item.id,
      styleId: item.styleId,
      loadTimeMs,
    });
  };

  // Hide on error
  if (isError) {
    return null;
  }

  // Hide while loading
  if (isLoading) {
    return null;
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="w-full max-w-2xl mt-6">
        <div className="text-center space-y-2 py-8 px-4 rounded-2xl border border-white/10 bg-slate-950/30">
          <h3 className="text-lg font-semibold text-white">Gallery Quickview</h3>
          <p className="text-sm text-white/60">
            Save your favorite styles to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mt-6">
      {/* Header */}
      <div className="mb-4 space-y-1">
        <h3 className="text-lg font-semibold text-white">Gallery Quickview</h3>
        <p className="text-sm text-white/60">
          Your recently saved artworks
        </p>
      </div>

      {/* Thumbnail Strip */}
      <div className="relative">
        {/* Fade gradient on right edge to indicate scroll */}
        <div className="absolute right-0 top-0 bottom-8 w-16 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />

        {/* Scrollable container */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const isNewSave = item.id === lastSavedGalleryItemId && index === 0;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={isNewSave ? {
                    y: -200,
                    opacity: 0,
                    scale: 0.5,
                  } : false}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                  className="flex-shrink-0 snap-start"
                >
                  <button
                    onClick={() => handleLoadGalleryItem(item, index)}
                    className="group relative block"
                    type="button"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={`${item.styleName} preview`}
                      className="w-[120px] h-[120px] sm:w-[120px] sm:h-[120px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] rounded-2xl object-cover border-2 border-white/20 group-hover:border-purple-400 transition-colors duration-200"
                      loading="lazy"
                    />
                  </button>
                  <p className="text-xs text-white/70 text-center mt-2 truncate w-[120px] sm:w-[120px] md:w-[100px] lg:w-[120px]">
                    {item.styleName}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GalleryQuickview;
```

### 5. Update Gallery Handlers to Trigger Animation

**File**: `src/hooks/studio/useGalleryHandlers.ts`

**Add after successful save**:

```typescript
import { useInvalidateGalleryItems } from '@/hooks/studio/useGalleryItems';
import { useFounderStore } from '@/store/useFounderStore';

export const useGalleryHandlers = () => {
  const invalidateGalleryItems = useInvalidateGalleryItems();
  const setLastSavedGalleryItemId = useFounderStore((state) => state.setLastSavedGalleryItemId);

  // ... existing code ...

  const handleSaveToGallery = useCallback(async () => {
    // ... existing save logic ...

    if (result.success) {
      setSavedToGallery(true);

      // NEW: Trigger gallery quickview animation
      if (result.galleryItemId) {
        setLastSavedGalleryItemId(result.galleryItemId);
        invalidateGalleryItems(); // Refetch gallery items

        // Clear animation flag after 2 seconds
        setTimeout(() => {
          setLastSavedGalleryItemId(null);
        }, 2000);
      }

      // ... existing toast logic ...
    }
  }, [/* dependencies */]);
};
```

### 6. Integrate into CanvasPreviewPanel

**File**: `src/sections/studio/components/CanvasPreviewPanel.tsx`

**Add import**:
```typescript
import { GalleryQuickview } from '@/components/studio/GalleryQuickview';
import { useStudioUserState } from '@/store/hooks/studio/useStudioUserState';
```

**Add after ActionGrid (around line 228)**:
```typescript
{previewStateStatus === 'ready' && currentStyle && (
  <div className="mt-6 w-full max-w-2xl">
    <ActionGrid
      onDownload={onDownloadClick}
      onCreateCanvas={onCreateCanvas}
      onChangeOrientation={onChangeOrientation}
      onSaveToGallery={onSaveToGallery}
      downloading={downloadingHD}
      downloadDisabled={downloadDisabled}
      createCanvasDisabled={canvasLocked}
      orientationDisabled={!hasCroppedImage || orientationPreviewPending || orientationChanging}
      savingToGallery={savingToGallery}
      savedToGallery={savedToGallery}
      isPremiumUser={isPremiumUser}
      orientationLabel={orientationMeta.label}
    />
  </div>
)}

{/* NEW: Gallery Quickview */}
{previewStateStatus === 'ready' && currentStyle && <GalleryQuickview />}

<div className="hidden lg:block w-full max-w-2xl mt-8">
  <div className="mb-6 text-center space-y-2">
    <h3 className="text-2xl font-bold text-white">See It In Your Space</h3>
    ...
```

### 7. Update GalleryItem TypeScript Interface

**File**: `src/utils/galleryApi.ts`

```typescript
export interface GalleryItem {
  id: string;
  userId: string | null;
  previewLogId: string | null;
  styleId: string;
  styleName: string;
  orientation: 'horizontal' | 'vertical' | 'square';
  imageUrl: string;
  displayUrl: string;
  storagePath: string;
  isFavorited: boolean;
  isDeleted: boolean;
  downloadCount: number;
  lastDownloadedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // NEW FIELDS
  thumbnailUrl: string;
  sourceStoragePath: string;
  cropConfig: {
    x: number;
    y: number;
    width: number;
    height: number;
    orientation: string;
  } | null;
}
```

### 8. Telemetry Utilities

**File**: `src/utils/galleryQuickviewTelemetry.ts`

```typescript
export function trackGalleryQuickviewShown(itemCount: number) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'gallery_quickview_shown', {
    item_count: itemCount,
    location: 'studio_center_rail',
  });
}

export function trackGalleryQuickviewThumbnailClick(params: {
  galleryItemId: string;
  styleId: string;
  styleName: string;
  position: number;
}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'gallery_quickview_thumbnail_click', {
    gallery_item_id: params.galleryItemId,
    style_id: params.styleId,
    style_name: params.styleName,
    position: params.position,
    source: 'gallery_quickview',
  });
}

export function trackGalleryItemLoaded(params: {
  galleryItemId: string;
  styleId: string;
  loadTimeMs: number;
}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'gallery_item_loaded', {
    gallery_item_id: params.galleryItemId,
    style_id: params.styleId,
    load_time_ms: params.loadTimeMs,
    source: 'gallery_quickview',
  });
}

export function trackGalleryQuickviewSaveAnimation(params: {
  galleryItemId: string;
  totalItemsNow: number;
}) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'gallery_quickview_save_animation', {
    gallery_item_id: params.galleryItemId,
    total_items: params.totalItemsNow,
  });
}
```

---

## UI/UX Specification

### Visual Hierarchy

```
┌────────────────────────────────────────────────────────────────┐
│                      CANVAS PREVIEW PANEL                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│              [Large preview of selected style]                 │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                       ACTION GRID                              │
│  [Download Image]  [Create Canvas]                            │
│  [Change Orient.]  [Save to Gallery]                          │
├────────────────────────────────────────────────────────────────┤
│                   GALLERY QUICKVIEW ← NEW                      │
│  Recently saved artworks                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ───→           │
│  │ Img  │ │ Img  │ │ Img  │ │ Img  │ │ Img  │                │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘                │
│   Style    Style    Style    Style    Style                   │
├────────────────────────────────────────────────────────────────┤
│                  SEE IT IN YOUR SPACE                          │
│              [Canvas in room preview]                          │
└────────────────────────────────────────────────────────────────┘
```

### Spacing & Sizing

**Container**:
- Width: `max-w-2xl` (matches parent container)
- Margin top: `24px` (6 Tailwind units)
- Padding: None (full bleed within max-width)

**Header**:
- Headline: `text-lg font-semibold text-white` ("Gallery Quickview")
- Subtext: `text-sm text-white/60` ("Your recently saved artworks" or empty state text)
- Gap between headline/subtext: `4px` (1 Tailwind unit)
- Margin bottom: `16px` (4 Tailwind units)

**Thumbnail Strip**:
- Display: `flex` with `gap-3` (12px between items)
- Overflow: `overflow-x-auto` (horizontal scroll)
- Scrollbar: Hidden via `scrollbar-hide` utility
- Scroll behavior: `scroll-smooth` + `snap-x snap-mandatory`
- Padding bottom: `8px` (2 Tailwind units) for scroll shadow

**Individual Thumbnail**:
- Size:
  - Desktop: `120px × 120px`
  - Tablet: `100px × 100px`
  - Mobile: `80px × 80px`
- Border radius: `rounded-2xl` (16px)
- Border: `2px solid rgba(255, 255, 255, 0.2)`
- Hover border: `2px solid #a855f7` (purple-400)
- Object fit: `cover` (crop to square)
- Transition: `transition-colors duration-200`

**Style Name Label**:
- Font size: `text-xs` (12px)
- Color: `text-white/70` (70% opacity)
- Alignment: `text-center`
- Margin top: `8px` (2 Tailwind units)
- Width: Match thumbnail width
- Overflow: `truncate` (single line with ellipsis)

**Fade Gradient Indicator**:
- Position: Absolute, right edge
- Width: `64px` (16 Tailwind units)
- Height: Full height minus label area (`bottom-8`)
- Gradient: `bg-gradient-to-l from-slate-900 to-transparent`
- Pointer events: `none` (doesn't block clicks)
- Z-index: `10`

### Color Palette

- **Background**: Transparent (inherits from parent)
- **Header text**: `#ffffff` (white)
- **Subtext**: `rgba(255, 255, 255, 0.6)` (60% white)
- **Thumbnail border default**: `rgba(255, 255, 255, 0.2)` (20% white)
- **Thumbnail border hover**: `#a855f7` (purple-400)
- **Style name**: `rgba(255, 255, 255, 0.7)` (70% white)
- **Fade gradient**: `#0f172a` (slate-900) → transparent
- **Empty state box border**: `rgba(255, 255, 255, 0.1)` (10% white)
- **Empty state box bg**: `rgba(2, 6, 23, 0.3)` (slate-950/30)

### Interaction States

**Thumbnail States**:
1. **Default**:
   - Border: `2px solid rgba(255, 255, 255, 0.2)`
   - No shadow

2. **Hover**:
   - Border: `2px solid #a855f7` (purple-400)
   - Transition: `200ms ease`

3. **Active/Pressed**:
   - Scale: `0.98` (subtle press feedback)
   - Transition: `100ms ease`

4. **Loading** (during `loadGalleryItem`):
   - Opacity: `0.7`
   - Cursor: `wait`
   - Optional: Spinner overlay

**Scroll Indicators**:
- Fade gradient appears when content overflows
- No arrows or buttons (rely on drag/swipe)
- Snap points every thumbnail for smooth scrolling

---

## Animation & Motion Design

### Save Animation ("Drop from Above")

**Trigger**: When `lastSavedGalleryItemId` matches a gallery item at index 0

**Motion**:
```typescript
initial={{
  y: -200,      // Start 200px above
  opacity: 0,   // Fully transparent
  scale: 0.5    // Half size
}}
animate={{
  y: 0,         // Drop to final position
  opacity: 1,   // Fade in
  scale: 1      // Full size
}}
transition={{
  type: 'spring',
  damping: 15,       // Bouncy feel
  stiffness: 120,    // Responsive spring
  duration: 1.2      // ~1.2 seconds total
}}
```

**Visual Effect**:
1. New thumbnail appears from above the viewport
2. Drops down with spring physics (slight bounce)
3. Simultaneously fades in and scales up
4. Other thumbnails shift right using Framer Motion's `layout` animation

**Timing**:
- Duration: ~1.2 seconds
- Delay: None (starts immediately on save success)
- Cleanup: After 2 seconds, clear `lastSavedGalleryItemId` flag

### Layout Shift Animation

**Trigger**: When new item is added to array (React Query refetch)

**Motion**:
```typescript
<motion.div layout transition={{ type: 'spring' }}>
```

**Effect**:
- Existing thumbnails smoothly animate to new positions
- No jarring layout shift
- Shared layout animation via Framer Motion

### Thumbnail Click Feedback

**Trigger**: User clicks a thumbnail

**Motion**:
1. **Immediate**: Border color changes to purple-400 (`200ms transition`)
2. **Scale down**: `scale(0.98)` for 100ms (press feedback)
3. **Scale up**: `scale(1)` return to normal

**No loading spinner** (instant swap is the goal)

### Scroll Behavior

**CSS**:
```css
scroll-behavior: smooth;
scroll-snap-type: x mandatory;
scroll-snap-align: start;
```

**Effect**:
- Smooth scrolling when using scrollbar or drag
- Snaps to each thumbnail's start position
- Works on touch devices (swipe gesture)

---

## Data Flow & State Management

### State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                             │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   [Save to           [Click              [Page
    Gallery]           Thumbnail]          Load]
        │                  │                  │
        ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ API: Save   │    │ Store:      │    │ React Query:│
│ to Gallery  │    │ loadGallery │    │ Fetch Items │
│             │    │ Item()      │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       ▼                  │                  │
┌─────────────┐           │                  │
│ Set lastSaved│          │                  │
│ GalleryItemId│          │                  │
└──────┬──────┘           │                  │
       │                  │                  │
       ▼                  │                  │
┌─────────────┐           │                  │
│ Invalidate  │           │                  │
│ Query Cache │           │                  │
└──────┬──────┘           │                  │
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
                 ┌─────────────────┐
                 │ GalleryQuickview│
                 │   Re-renders    │
                 └─────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    [New item      [Preview       [Empty state
     animates]      swaps]         or error]
```

### Store State Shape

```typescript
{
  // Existing state
  uploadedImage: string | null;
  originalImage: string | null;
  croppedImage: string | null;
  orientation: 'horizontal' | 'vertical' | 'square';
  selectedStyleId: string | null;
  smartCrops: {
    horizontal?: CropConfig;
    vertical?: CropConfig;
    square?: CropConfig;
  };
  previews: {
    [styleId: string]: {
      [orientation: string]: PreviewEntry;
    };
  };

  // NEW: Gallery state
  lastSavedGalleryItemId: string | null;
}
```

### React Query Cache

**Query Key**: `['gallery-items', accessToken]`

**Refetch Triggers**:
1. On successful save (manual invalidation via `invalidateGalleryItems()`)
2. On window focus (default React Query behavior, can disable if needed)
3. Every 30 seconds (staleTime: 30_000)

**Cache Strategy**:
- **staleTime**: 30 seconds (data considered fresh)
- **cacheTime**: 5 minutes (data kept in memory)
- **retry**: false (fail silently, hide component)

---

## Telemetry & Analytics

### Event Tracking Matrix

| Event Name | Trigger | Properties |
|-----------|---------|-----------|
| `gallery_quickview_shown` | Component renders with items | `item_count`, `location` |
| `gallery_quickview_thumbnail_click` | User clicks thumbnail | `gallery_item_id`, `style_id`, `style_name`, `position`, `source` |
| `gallery_item_loaded` | Preview successfully swapped | `gallery_item_id`, `style_id`, `load_time_ms`, `source` |
| `gallery_quickview_save_animation` | Drop animation plays | `gallery_item_id`, `total_items` |

### Conversion Funnel Tags

**Funnel**: Gallery Quickview → Canvas Creation

1. `gallery_quickview_shown` (Entry)
2. `gallery_quickview_thumbnail_click` (Engagement)
3. `gallery_item_loaded` (Success)
4. `studio_v2_canvas_cta_click` (source: 'gallery_loaded_item') (Conversion)

**Why Track**:
- Measure engagement with saved artwork
- Identify which styles users revisit
- Measure load performance (load_time_ms)
- Quantify conversion lift from quickview feature

---

## Testing Strategy

### Unit Tests

#### 1. `tests/store/gallerySlice.spec.ts`
```typescript
describe('gallerySlice', () => {
  it('should set lastSavedGalleryItemId', () => {});
  it('should load gallery item and restore state', () => {});
  it('should handle missing sourceStoragePath gracefully', () => {});
  it('should apply crop config correctly', () => {});
  it('should inject preview into cache', () => {});
});
```

#### 2. `tests/hooks/useGalleryItems.spec.tsx`
```typescript
describe('useGalleryItems', () => {
  it('should fetch items when accessToken provided', () => {});
  it('should not fetch when accessToken is null', () => {});
  it('should handle fetch errors silently', () => {});
  it('should invalidate cache on demand', () => {});
});
```

#### 3. `tests/components/GalleryQuickview.spec.tsx`
```typescript
describe('GalleryQuickview', () => {
  it('should render empty state when no items', () => {});
  it('should render thumbnails when items exist', () => {});
  it('should hide component on fetch error', () => {});
  it('should trigger loadGalleryItem on click', () => {});
  it('should play save animation for new items', () => {});
  it('should track analytics events', () => {});
});
```

### Integration Tests

#### Full Save → Load Flow
```typescript
describe('Gallery Quickview Integration', () => {
  it('should save to gallery and show new thumbnail', async () => {
    // 1. Generate preview
    // 2. Click "Save to Gallery"
    // 3. Wait for save success
    // 4. Verify new thumbnail appears
    // 5. Verify animation plays
    // 6. Verify telemetry fires
  });

  it('should load gallery item and swap preview', async () => {
    // 1. Render GalleryQuickview with mock items
    // 2. Click first thumbnail
    // 3. Verify loadGalleryItem called
    // 4. Verify store state updated
    // 5. Verify preview swapped
    // 6. Verify telemetry fires
  });
});
```

### Manual QA Checklist

#### Visual & Layout
- [ ] Empty state displays correctly (centered, proper spacing)
- [ ] Header text is readable (proper contrast)
- [ ] Thumbnails are 120px square on desktop
- [ ] Thumbnails are 80px square on mobile
- [ ] 5 thumbnails visible in viewport (desktop)
- [ ] 3-4 thumbnails visible in viewport (mobile)
- [ ] Fade gradient appears on right edge when content overflows
- [ ] Scroll works smoothly (no janky performance)
- [ ] Snap-scroll aligns to thumbnail start positions

#### Interaction
- [ ] Hovering thumbnail changes border to purple
- [ ] Clicking thumbnail provides visual feedback (scale down)
- [ ] Preview swaps instantly (no visible loading delay)
- [ ] Original photo is recalled from Supabase
- [ ] Crop is exactly as saved (no drift)
- [ ] Orientation matches saved item
- [ ] Canvas-in-room updates to new style
- [ ] User can generate new styles from loaded photo

#### Save Animation
- [ ] Saving to gallery triggers animation
- [ ] New thumbnail drops from above
- [ ] Spring physics feel natural (slight bounce)
- [ ] Existing thumbnails shift smoothly
- [ ] Animation completes in ~1.2 seconds
- [ ] Strip scrolls to show new item at position 0

#### Error Handling
- [ ] Strip hides when fetch fails (no error toast)
- [ ] Strip hides when no session token
- [ ] Missing thumbnailUrl falls back gracefully
- [ ] Missing sourceStoragePath logs error but doesn't crash
- [ ] Missing cropConfig uses full image (no crop)

#### Cross-Device
- [ ] Desktop (1920×1080): 5 thumbnails visible, smooth scroll
- [ ] Tablet (768×1024): 4 thumbnails visible, touch scroll works
- [ ] Mobile (375×667): 3 thumbnails visible, swipe works
- [ ] Thumbnails resize correctly at breakpoints

#### Performance
- [ ] Thumbnails load lazy (not all at once)
- [ ] No layout shift when strip appears
- [ ] Smooth 60fps scroll on all devices
- [ ] Network tab shows ~150 KB total for 15 thumbnails
- [ ] No memory leaks on repeated save/load

#### Telemetry
- [ ] `gallery_quickview_shown` fires on first render with items
- [ ] `gallery_quickview_thumbnail_click` fires with correct position
- [ ] `gallery_item_loaded` fires with accurate load_time_ms
- [ ] `gallery_quickview_save_animation` fires on save success
- [ ] All events include correct property values

---

## Implementation Timeline

### Phase 1: Backend Foundation (3-4 hours)

**Tasks**:
- [ ] Write and test database migration for `preview_logs` columns
- [ ] Update `generate-style-preview` edge function to capture source path + crop
- [ ] Update `save-to-gallery` edge function to generate thumbnails
- [ ] Update `get-gallery` edge function to JOIN with preview_logs
- [ ] Test all edge functions with Postman/curl
- [ ] Verify thumbnail generation works (check storage bucket)

**Acceptance**:
- Migration runs without errors
- Preview generation stores `source_storage_path` and `crop_config`
- Gallery save returns `thumbnailUrl`
- Gallery fetch includes new fields

### Phase 2: Frontend Data Layer (2-3 hours)

**Tasks**:
- [ ] Create `gallerySlice.ts` with state + actions
- [ ] Implement `loadGalleryItem()` action (fetch original, apply crop, restore state)
- [ ] Integrate slice into `useFounderStore`
- [ ] Create `useGalleryItems` React Query hook
- [ ] Update `GalleryItem` TypeScript interface in `galleryApi.ts`
- [ ] Update `useGalleryHandlers` to trigger refetch + animation flag

**Acceptance**:
- `loadGalleryItem()` successfully fetches original photo
- Crop is applied correctly from `cropConfig`
- Store state updates (uploaded image, orientation, selected style)
- Preview cache is populated (skips regeneration)
- React Query hook returns items with new fields

### Phase 3: UI Component (3-4 hours)

**Tasks**:
- [ ] Create `GalleryQuickview.tsx` component
- [ ] Implement horizontal scroll container
- [ ] Style thumbnails (size, border, hover states)
- [ ] Implement empty state UI
- [ ] Add fade gradient indicator
- [ ] Integrate Framer Motion animations (drop, layout)
- [ ] Handle click → `loadGalleryItem`
- [ ] Handle error state (return null)

**Acceptance**:
- Component renders with mock data
- Thumbnails display correctly (120px, rounded, proper spacing)
- Scroll works smoothly
- Empty state shows when 0 items
- Component hides on error
- Hover states work

### Phase 4: Animation & Polish (2 hours)

**Tasks**:
- [ ] Implement save animation (drop from above)
- [ ] Test animation timing (adjust damping/stiffness if needed)
- [ ] Add layout shift animation for existing items
- [ ] Implement scroll snap behavior
- [ ] Add lazy loading to thumbnail images
- [ ] Mobile responsive styles (80px thumbnails)

**Acceptance**:
- Save animation feels natural (1.2s spring)
- Existing items shift smoothly
- Scroll snaps to thumbnail positions
- Mobile layout works (3-4 items visible)

### Phase 5: Integration & Telemetry (1-2 hours)

**Tasks**:
- [ ] Add `<GalleryQuickview />` to CanvasPreviewPanel
- [ ] Create `galleryQuickviewTelemetry.ts` utilities
- [ ] Integrate telemetry calls in component
- [ ] Test full save → refetch → animate flow
- [ ] Test full load → swap preview flow

**Acceptance**:
- Quickview appears in correct location
- Telemetry events fire correctly
- Save triggers animation
- Click triggers preview swap + original photo recall

### Phase 6: Testing (2-3 hours)

**Tasks**:
- [ ] Write unit tests for `gallerySlice`
- [ ] Write unit tests for `useGalleryItems`
- [ ] Write unit tests for `GalleryQuickview`
- [ ] Manual QA on desktop (Chrome, Firefox, Safari)
- [ ] Manual QA on mobile (iOS Safari, Android Chrome)
- [ ] Performance testing (network throttling, CPU slowdown)
- [ ] Accessibility check (keyboard nav, screen readers)

**Acceptance**:
- All unit tests pass
- Manual QA checklist 100% complete
- No performance regressions
- Works across all target browsers/devices

### Phase 7: Documentation & Deployment (1 hour)

**Tasks**:
- [ ] Update CLAUDE.md with Gallery Quickview section
- [ ] Add inline code comments for complex logic
- [ ] Update README if needed
- [ ] Create PR with detailed description
- [ ] Deploy to staging environment
- [ ] Final smoke test on staging

**Acceptance**:
- Code is well-documented
- PR is comprehensive
- Staging deployment successful
- Ready for production release

---

## Total Estimated Time: 14-18 hours

**Breakdown**:
- Backend: 3-4 hours
- Data Layer: 2-3 hours
- UI Component: 3-4 hours
- Animation: 2 hours
- Integration: 1-2 hours
- Testing: 2-3 hours
- Documentation: 1 hour

---

## V2 Future Enhancements (Out of Scope for V1)

The following features are explicitly **deferred to V2**:

1. **Hybrid View with Recents Tab**
   - Two tabs: "Saved" (current V1) and "Recents" (last 20 generations)
   - Tab switching persisted to localStorage
   - Recents tab shows all previews (saved or not)

2. **Hover Actions**
   - Hover over thumbnail reveals action buttons:
     - "Create Canvas" (instant canvas modal)
     - "Download" (HD download)
     - "Save" (quick save if not already saved)
   - Inspired by GPT-5's recommendation

3. **Shift-Click A/B Comparison**
   - Shift-click thumbnail → split-screen comparison mode
   - Side-by-side view of current preview vs. clicked item
   - Swipe/slider to compare

4. **Thumbnail Rename**
   - Click style name to rename
   - Inline edit with auto-save
   - Syncs to gallery backend

5. **Drag to Reorder**
   - Drag thumbnails to custom sort order
   - Persisted per user
   - Overrides chronological sort

6. **Infinite Scroll**
   - Load more than 15 items
   - Pagination or infinite scroll
   - Virtual scrolling for performance

---

## Success Metrics

**Engagement**:
- % of users who save at least 1 item (baseline for quickview visibility)
- % of users who click a quickview thumbnail (engagement rate)
- Average # of thumbnail clicks per session (re-engagement)

**Conversion**:
- % of quickview loads that lead to canvas creation (conversion lift)
- Time between thumbnail click and canvas CTA (intent signal)

**Performance**:
- Average load time for 15 thumbnails (target: <500ms)
- Average `load_time_ms` for `loadGalleryItem` (target: <1s)

**Retention**:
- % of users who return to saved items in subsequent sessions
- Average # of gallery items per user (save behavior)

---

## Appendix: File Change Summary

### New Files (8)

| File Path | Lines | Purpose |
|-----------|-------|---------|
| `supabase/migrations/YYYYMMDDHHMMSS_extend_preview_logs_for_gallery.sql` | ~20 | Add source_storage_path & crop_config columns |
| `src/store/founder/gallerySlice.ts` | ~120 | Gallery state + loadGalleryItem action |
| `src/hooks/studio/useGalleryItems.ts` | ~40 | React Query hook for gallery fetch |
| `src/components/studio/GalleryQuickview.tsx` | ~180 | Main UI component |
| `src/utils/galleryQuickviewTelemetry.ts` | ~60 | Analytics tracking functions |
| `tests/store/gallerySlice.spec.ts` | ~80 | Unit tests for slice |
| `tests/hooks/useGalleryItems.spec.tsx` | ~60 | Unit tests for query hook |
| `tests/components/GalleryQuickview.spec.tsx` | ~100 | Unit tests for component |

### Modified Files (7)

| File Path | Changes |
|-----------|---------|
| `supabase/functions/generate-style-preview/index.ts` | Capture & store source_storage_path + crop_config |
| `supabase/functions/save-to-gallery/index.ts` | Generate 200px thumbnail, return thumbnailUrl |
| `supabase/functions/get-gallery/index.ts` | JOIN preview_logs, include new fields |
| `src/store/useFounderStore.ts` | Integrate gallerySlice |
| `src/utils/galleryApi.ts` | Update GalleryItem interface |
| `src/hooks/studio/useGalleryHandlers.ts` | Set lastSavedGalleryItemId, invalidate query |
| `src/sections/studio/components/CanvasPreviewPanel.tsx` | Render GalleryQuickview component |

---

**End of Specification**

This document serves as the single source of truth for Gallery Quickview V1 implementation. All decisions, preferences, technical details, and edge cases are documented here to eliminate guesswork during development.
