# Sonnet Watermark Research Brief
**Document Owner:** Claude Sonnet 4.5
**Created:** 2025-10-16
**Purpose:** Deep architectural research before watermark cleanup & reimplementation
**Status:** Phase 0 - Pre-Implementation Research

---

## Executive Summary

This document maps Wondertone's current image generation, storage, token, and watermark systems to guide the transition from **legacy dual-bucket watermarking** to **Opus's prescribed on-the-fly watermark approach** with device fingerprinting.

**Key Finding:** The current architecture stores **both watermarked and clean copies** of every preview. Opus's plan requires storing **only clean images** and applying watermarks dynamically based on `user.isPaid`. This is a **fundamental architectural shift** requiring careful cleanup before new implementation.

---

## Current Architecture Map

### 1. Image Generation Flow

```
User uploads photo
    ↓
[PhotoUploader.tsx] → HEIC conversion, drag-drop handling
    ↓
[CropperModal.tsx] → User manual crop OR smart crop suggestion
    ↓
[SmartCropPreview.tsx] → AI crop analysis (per orientation)
    ↓
Store: uploadedImage, croppedImage, smartCrops[orientation]
    ↓
User selects style + orientation
    ↓
[useFounderStore.ts::startStylePreview()] → Checks entitlements
    ↓
[founderPreviewGeneration.ts] → Orchestrates generation
    ↓
[previewClient.ts::fetchPreviewForStyle()] → Calls edge function
    ↓
EDGE: /generate-style-preview
    ↓
├── Check cache (memory → metadata → storage)
├── If miss: Generate via Replicate API (SeeDream 4.0)
├── Apply server-side watermark (WatermarkService) IF requiresWatermark
├── DUAL UPLOAD:
│   ├── Watermarked → preview-cache-public bucket
│   └── Clean → preview-cache-premium bucket
├── Cache metadata with watermark:boolean flag
└── Return URL based on requiresWatermark flag
    ↓
Client receives preview URL → Display in UI
    ↓
[CanvasInRoomPreview.tsx] → Shows preview in room mockup
[StyleCarousel.tsx] → Shows style thumbnails
```

---

### 2. Current Storage Architecture (Dual-Bucket System)

#### **Storage Buckets** (Created: Migration `20251014130000_create_dual_storage_buckets.sql`)

| Bucket | Public? | Purpose | Path Structure |
|--------|---------|---------|----------------|
| `preview-cache-public` | ✅ Yes | Watermarked previews for free/anon users | `{styleId}/{quality}/{aspect}/{imageDigest}.jpg` |
| `preview-cache-premium` | ❌ No | Clean previews for paid users | Same path structure |

#### **Database Schema**

**`preview_cache_entries`** (Migration: `20250730120000_preview_cache_entries.sql`)
```sql
cache_key          TEXT PRIMARY KEY  -- Includes watermark:boolean in hash
style_id           INTEGER
style_version      TEXT
image_digest       TEXT
aspect_ratio       TEXT
quality            TEXT
watermark          BOOLEAN          -- ⚠️ LEGACY FLAG - TO BE REMOVED
storage_path       TEXT
preview_url        TEXT             -- Points to public OR premium bucket
ttl_expires_at     TIMESTAMPTZ
hit_count          INTEGER
```

**`user_gallery`** (Migration: `20251014120000_create_user_gallery.sql`)
```sql
watermarked_url    TEXT NOT NULL   -- ⚠️ LEGACY - TO BE REMOVED
clean_url          TEXT            -- ⚠️ LEGACY - TO BE REMOVED (null for free users)
```

**`preview_logs`** (Migration: `20251015090000_entitlements.sql`)
```sql
watermark          BOOLEAN         -- ⚠️ REDUNDANT with requires_watermark
requires_watermark BOOLEAN         -- ✅ KEEP - Entitlement flag
```

---

### 3. Current Token & Entitlements System

#### **Database Tables**

**`anonymous_tokens`** (Migration: `20251015090000_entitlements.sql`)
```sql
token                   TEXT PRIMARY KEY
free_tokens_remaining   INTEGER DEFAULT 5      -- Soft limit (prompt at 0)
dismissed_prompt        BOOLEAN DEFAULT FALSE
ip_ua_hash              TEXT                   -- ⚠️ Currently unused
month_bucket            DATE                   -- Monthly reset tracking
```

**`subscriptions`** (Migration: `20251015090000_entitlements.sql`)
```sql
user_id             UUID PRIMARY KEY
tier                subscription_tier         -- 'free' | 'creator' | 'plus' | 'pro'
tokens_quota        INTEGER DEFAULT 10        -- Monthly quota
current_period_end  TIMESTAMPTZ              -- Renewal date
```

**`v_entitlements`** (View - computed from subscriptions + profile)
```sql
-- Calculated columns:
tier                    -- 'anonymous' | 'free' | 'creator' | 'plus' | 'pro' | 'dev'
tokens_quota            -- Total monthly allowance
remaining_tokens        -- Quota - usage this period
dev_override            -- Admin bypass flag
```

#### **Token Enforcement Logic**

**Client:** `src/store/useFounderStore.ts`
```typescript
requiresWatermarkFromTier(tier): boolean {
  return tier === 'anonymous' || tier === 'free';
}

canGenerateMore(): boolean {
  return entitlements.remainingTokens > 0;
}

// Soft prompt at 5 for anonymous, hard gate at 10
shouldShowAccountPrompt(): boolean {
  return entitlements.tier === 'anonymous'
    && entitlements.softRemaining <= 0;
}
```

**Server:** `supabase/functions/generate-style-preview/entitlements.ts`
```typescript
requiresWatermarkForTier(tier, devBypass): boolean {
  if (devBypass) return false;
  return tier === 'anonymous' || tier === 'free';
}

quotaForTier(tier): number | null {
  switch (tier) {
    case 'creator': return 50;
    case 'plus': return 250;
    case 'pro': return 500;
    case 'free': return 10;
    case 'anonymous': return 10; // Hard limit
  }
}
```

---

### 4. Current Watermark Implementation

#### **Server-Side Watermark Service**
**File:** `supabase/functions/generate-style-preview/watermarkService.ts`

**Pattern:** 5-point text watermark
- 4 corners: "WONDERTONE" @ 35% opacity
- 1 center: "WONDERTONE" diagonal @ 20% opacity
- Uses ImageScript (Deno environment)
- Loads Agbalumo font from Google Fonts

**Integration Point:** `generate-style-preview/index.ts` (lines 898-909, 918-974)
```typescript
if (effectiveWatermark) {
  // Apply watermark to buffer
  const watermarkedBuffer = await WatermarkService.createWatermarkedImage(buffer, requestId);

  // DUAL UPLOAD (⚠️ TO BE REMOVED):
  // 1. Watermarked → public bucket
  await storageClient.uploadFromUrl(watermarkedOutput, path, {}, true);

  // 2. Clean → premium bucket
  await storageClient.uploadFromUrl(rawOutput, path, {}, false);
}
```

#### **Client-Side Watermark Handling**
Currently **NONE** - all watermarking happens server-side before caching.

#### **Canvas Watermark Service (DEAD CODE)**
**File:** `supabase/functions/generate-style-preview/canvasWatermarkService.ts`
- Marked as "TEMPORARY FIX"
- Returns original URL without watermarking
- **Status:** Unused bypass service → DELETE

---

### 5. UI Watermark Stage Handling (Legacy)

**StyleForgeOverlay.tsx** (lines 4, 26-29, 40, 64)
```typescript
const STATUS_ORDER = ['animating', 'generating', 'polling', 'watermarking', 'ready', 'error'];
//                                                          ^^^^^^^^^^^^^ TO BE REMOVED

const STATUS_COPY = {
  watermarking: {
    label: 'Applying finishing varnish…',
    sublabel: 'Protecting your preview with a subtle Wondertone mark',
  },
  // ⚠️ This stage doesn't exist in new architecture
};
```

**useFounderStore.ts** (line 34)
```typescript
const STAGE_MESSAGES = {
  watermarking: 'Applying finishing varnish…', // ⚠️ TO BE REMOVED
};
```

**Impact:** UI waits for a phantom "watermarking" stage that will no longer exist when watermarks are applied on-the-fly.

---

### 6. Gallery & Download URLs (Dual-URL System)

**Current Flow:**
```typescript
// galleryApi.ts (lines 9-10, 305-310)
interface GalleryItem {
  watermarkedUrl: string;  // ⚠️ LEGACY
  cleanUrl: string | null; // ⚠️ LEGACY
}

function getGalleryDownloadUrl(item, requiresWatermark): string {
  if (!requiresWatermark && item.cleanUrl) {
    return item.cleanUrl;  // Paid users get clean
  }
  return item.watermarkedUrl; // Free users get watermarked
}
```

**Edge Function:** `supabase/functions/get-premium-preview/index.ts`
- Generates signed URLs for premium bucket access
- Checks tier: must be `creator` | `plus` | `pro`
- Returns time-limited URL (default: 24 hours)

---

## Opus Plan vs. Current Architecture

### Critical Differences

| Aspect | Current (Dual-Bucket) | Opus Plan (On-The-Fly) |
|--------|----------------------|------------------------|
| **Storage** | 2 copies (watermarked + clean) | 1 copy (clean only) |
| **Watermark Application** | Server-side before caching | On-the-fly during serving |
| **Cache Keys** | Include `watermark:boolean` | Single key per image |
| **Gallery Schema** | `watermarkedUrl` + `cleanUrl` | Single `imageUrl` |
| **Edge Logic** | Route to correct bucket | Apply watermark if `!isPaid` |
| **Client Rendering** | Passive display | Potential overlay rendering |

---

## Legacy Components Requiring Cleanup

### ❌ **TO DELETE**

1. **`supabase/functions/generate-style-preview/canvasWatermarkService.ts`**
   - Dead code with "TEMPORARY FIX" comment
   - No active references

### ⚠️ **TO REWRITE**

2. **`supabase/functions/generate-style-preview/watermarkService.ts`**
   - Replace 5-point text watermark → Canva-style diagonal grid
   - Keep API signature for compatibility
   - Update to support opacity override (preview vs canvas)

### 🔧 **TO MODIFY**

3. **Dual-Bucket Upload Logic** (`generate-style-preview/index.ts` lines 918-974)
   - **DECISION POINT:** Keep or remove dual-upload?
   - **Opus says:** Store only clean, watermark on-the-fly
   - **Current advantage:** Faster serving (pre-watermarked cached)
   - **Recommendation:** See "Open Questions" below

4. **Cache Metadata Schema** (`preview_cache_entries` table)
   - Remove `watermark:boolean` column
   - Update cache key generation to exclude watermark flag
   - Migrate existing entries to single clean URL

5. **Gallery Schema** (`user_gallery` table)
   - Collapse `watermarkedUrl` + `cleanUrl` → single `image_url`
   - Migration: Set `image_url = cleanUrl ?? watermarkedUrl`
   - Update `galleryApi.ts` to remove dual-URL logic

6. **Preview Logs Schema** (`preview_logs` table)
   - Remove `watermark:boolean` column (redundant)
   - Keep `requires_watermark:boolean` (entitlement flag)

7. **UI Stage References**
   - Remove "watermarking" from `StyleForgeOverlay.tsx` progress stages
   - Remove from `STAGE_MESSAGES` in `useFounderStore.ts`
   - Update `previewAnalytics.ts` to remove watermarking stage logging

---

## Open Questions & Decision Points

### 🤔 **Question 1: Dual-Upload Strategy**

**Opus Plan:** "Store ONLY clean images, apply watermarks on-the-fly"

**Current Reality:** Dual-upload provides performance benefit
- Watermarked versions already cached in CDN
- No on-the-fly processing delay
- Storage cost is minimal (~2x, but images compress well)

**Options:**
A. **Full On-The-Fly** (Opus ideal)
   - ✅ Single source of truth
   - ✅ Instant watermark updates (change grid pattern globally)
   - ❌ Processing overhead on every free user request
   - ❌ Requires robust caching strategy

B. **Hybrid: On-The-Fly with CDN Caching**
   - ✅ Best of both worlds
   - ✅ First request generates, CDN caches with `Vary: Authorization` header
   - ✅ Clean storage (1 copy), but fast serving (CDN layer)
   - ⚠️ Complex cache invalidation

C. **Keep Dual-Upload, Serve Conditionally**
   - ✅ Zero performance regression
   - ✅ Fast implementation
   - ❌ Still 2 copies in storage
   - ❌ Harder to update watermark globally

**Recommendation Needed:** Which approach for Phase 2 implementation?

---

### 🤔 **Question 2: Device Fingerprinting Integration**

**Opus Plan:** Add `anonymous_usage` table with fingerprint tracking

**Current System:** Uses `anonymous_tokens` with `ip_ua_hash` (currently unused)

**Options:**
A. **Extend `anonymous_tokens` table**
   - Add `fingerprint_hash` column
   - Utilize existing `ip_ua_hash` field
   - Keep monthly reset logic (`month_bucket`)

B. **Create new `anonymous_usage` table**
   - As prescribed in Opus plan
   - Cleaner separation of concerns
   - Easier to add fingerprint-specific columns

**Recommendation:** Option A (extend existing) is faster, but Option B (new table) is cleaner architecture.

---

### 🤔 **Question 3: Watermark Opacity Context**

**Opus Plan:**
- Preview/Download: 35-40% opacity
- Canvas Room Preview: 20-25% opacity

**Implementation:**
- **Server-side:** Can't detect context (preview vs canvas) without query param
- **Client-side:** Could apply lighter overlay for canvas component

**Proposed Solution:**
```
/api/images/{id}?context=canvas_preview  → 25% opacity watermark
/api/images/{id}?context=download        → 40% opacity watermark
```

**Alternative:** Client-side canvas overlay (lighter) on top of server watermark (standard)

---

## Phase 1 & 2 Cleanup Checklist

### Phase 1: Code Removal

- [ ] **DELETE** `canvasWatermarkService.ts`
- [ ] **REMOVE** watermarking stage from `StyleForgeOverlay.tsx`:
  - Remove from `STATUS_ORDER`
  - Remove from `ACTIVE_STATUS_SEQUENCE`
  - Remove from `STATUS_COPY`
  - Remove from `STAGE_PROGRESS_FLOOR`
- [ ] **REMOVE** watermarking stage from `useFounderStore.ts`:
  - Remove from `STAGE_MESSAGES`
- [ ] **REMOVE** watermarking stage from `founderPreviewGeneration.ts`:
  - Remove `onStage?.('watermarking')` calls
- [ ] **REMOVE** watermarking stage from `previewAnalytics.ts`:
  - Remove stage logging for 'watermarking'

### Phase 2: Schema Cleanup

- [ ] **MIGRATION:** Remove `watermark:boolean` from `preview_cache_entries`
- [ ] **MIGRATION:** Collapse `user_gallery` dual URLs:
  ```sql
  ALTER TABLE user_gallery
    ADD COLUMN image_url TEXT,
    -- Migrate: cleanUrl ?? watermarkedUrl
    DROP COLUMN watermarked_url,
    DROP COLUMN clean_url;
  ```
- [ ] **MIGRATION:** Remove `watermark:boolean` from `preview_logs` (keep `requires_watermark`)
- [ ] **UPDATE** `galleryApi.ts`:
  - Remove `getGalleryDownloadUrl()` dual-URL logic
  - Update `GalleryItem` interface
- [ ] **UPDATE** `cacheMetadataService.ts`:
  - Remove `watermark:boolean` from schema interfaces
- [ ] **UPDATE** cache key generation in `cache/cacheKey.ts`:
  - Remove watermark flag from key hash

### Phase 3: Storage Bucket Strategy Decision

⏸️ **PAUSE HERE** - Need decision on dual-bucket approach before proceeding

**If keeping dual-bucket:**
- Keep `preview-cache-public` and `preview-cache-premium`
- Update watermark service only

**If moving to on-the-fly:**
- Create migration plan to:
  1. Copy all `preview-cache-premium` → single `preview-cache` bucket
  2. Delete `preview-cache-public` watermarked copies
  3. Update edge function to watermark on-demand

---

## Post-Cleanup Implementation Roadmap

### Phase 3: New Watermark Implementation

1. **Rewrite `watermarkService.ts`**
   - Canva-style diagonal grid pattern
   - "WONDERTONE" text repeating every 150-200px
   - Center Wondertone logo (provided by founder)
   - Opacity: 35-40% (preview/download) vs 20-25% (canvas)

2. **Client-Side Watermark Utility** (Optional)
   - `src/utils/watermarkOverlay.ts`
   - On-the-fly overlay for real-time previews
   - Memoized rendering for performance

3. **Edge Function Integration**
   - Update serving logic based on `requiresWatermark` flag
   - Support `?context=canvas_preview` query param for opacity control

### Phase 4: Device Fingerprinting

1. **Frontend Fingerprint Collection**
   - `src/utils/deviceFingerprint.ts`
   - SHA-256 hash of stable browser attributes
   - Send to server on session init

2. **Backend Token Persistence**
   - Extend `anonymous_tokens` with `fingerprint_hash`
   - Track usage across sessions
   - Monthly reset via `month_bucket`

3. **Integration with Preview Generation**
   - Check fingerprint hash before allowing generation
   - Return 429 if quota exhausted
   - Silent persistence (no user notification)

---

## Performance & Security Considerations

### Caching Strategy

**Current:**
- LRU memory cache (256 entries, ~30 days TTL)
- Metadata table cache (SQL lookups)
- Storage bucket cache (Supabase CDN)

**Post-Cleanup:**
- Same layers, but single cache key per image
- On-the-fly watermarking needs CDN support:
  - `Vary: Authorization` header to cache per-user-tier
  - Or: Serve from edge function with aggressive caching

### Security Notes

**Fingerprinting:**
- For friction, not security
- Determined users can bypass (VPN + browser changes)
- Goal: Make paying easier than bypassing

**Watermark:**
- Grid pattern harder to remove than simple text
- But still removable by determined users
- Acceptable trade-off for conversion optimization

---

## Final Recommendations

### Before Implementation

1. **Founder Decision Required:** Dual-bucket vs on-the-fly watermarking
2. **Wondertone Logo Asset:** SVG or high-res PNG for center mark
3. **Opacity Testing:** Confirm 25% is light enough for canvas visualization

### Implementation Order

1. ✅ Phase 1 Cleanup (delete dead code)
2. ✅ Phase 2 Schema Cleanup (remove dual URLs)
3. ⏸️ **CHECKPOINT** - Verify cleanup, test with existing flow
4. 🚀 Phase 3 New Watermark (Canva-style grid)
5. 🚀 Phase 4 Fingerprinting (device persistence)

---

## Conclusion

The current architecture uses a **dual-bucket, pre-watermarked caching system** that conflicts with Opus's prescribed **single-source, on-the-fly watermarking** approach.

**Critical Path:**
1. Clean up legacy watermarking stages and dual-URL schema
2. Decide on storage strategy (keep dual-bucket or move to on-the-fly)
3. Only then implement new Canva-style watermark

**Success Criteria:**
- Zero watermarks for paid users (anywhere, ever)
- Canva-style grid for free/anonymous users (everywhere, always)
- Token persistence across browser refresh (fingerprinting)
- Performance: No user-visible latency increase

---

**Document Status:** Research Complete - Ready for Phase 1 Cleanup
**Next Step:** Await founder approval on dual-bucket decision, then begin code deletion.
