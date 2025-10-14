# 🔍 Watermark System - Diagnostic Report

## ✅ Deployment Status

### Edge Functions
- ✅ **generate-style-preview**: Deployed (Version 207, Just Now)
- ✅ **get-premium-preview**: Deployed (Version 1)
- ✅ **save-to-gallery**: Deployed (Version 1)
- ✅ **get-gallery**: Deployed (Version 1)

### Database Migration
- ⚠️ **Storage buckets**: Need manual creation (see CREATE_BUCKETS.sql)

---

## ⚠️ Why Watermarks Aren't Showing Yet

### Root Cause
The edge function was previously deployed by Codex with **OLD code** that didn't have the dual-bucket system. Your test ran against the old deployment.

### Just Fixed
✅ Redeployed `generate-style-preview` with **NEW code** (just now)
✅ New deployment includes dual-bucket routing
✅ Script size: 225.9kB (includes all our changes)

---

## 📋 Critical Next Step: Create Storage Buckets

### Option 1: Manual SQL (Recommended - 2 minutes)

1. Go to: https://supabase.com/dashboard/project/fvjganetpyyrguuxjtqi/sql/new
2. Copy contents of `CREATE_BUCKETS.sql`
3. Click "Run"
4. Verify buckets appear in Storage tab

### Option 2: Check if Buckets Already Exist

1. Go to: https://supabase.com/dashboard/project/fvjganetpyyrguuxjtqi/storage/buckets
2. Look for:
   - `preview-cache-public` (public badge)
   - `preview-cache-premium` (private badge)
3. If they exist: ✅ You're done!
4. If not: Run the SQL from CREATE_BUCKETS.sql

---

## 🧪 Testing Instructions

### Test 1: Anonymous User (Should See Watermarks)

1. Open app in **incognito/private** window
2. Upload a photo
3. Select "Classic Oil Painting" style
4. Wait for generation
5. **Expected**: Preview shows 5 watermarks:
   - Top-left corner (42% opacity)
   - Top-right corner (42% opacity)
   - Bottom-left corner (42% opacity)
   - Bottom-right corner (42% opacity)
   - Center (24% opacity, large)

### Test 2: Check Network Tab

1. Open DevTools → Network tab
2. Generate a preview
3. Look for request to: `generate-style-preview`
4. Check response JSON:
   ```json
   {
     "preview_url": "https://..../preview-cache-public/...",
     "requires_watermark": true,
     "remainingTokens": 9
   }
   ```
5. **Key**: URL should contain `preview-cache-public`

### Test 3: Direct URL Access

1. Copy the `preview_url` from network response
2. Paste in new browser tab
3. **Expected**: Image has 5 watermarks visible

---

## 🐛 Troubleshooting

### If Still No Watermarks:

#### Issue 1: Buckets Don't Exist
**Symptom**: Console error about missing bucket
**Fix**: Run CREATE_BUCKETS.sql in Supabase dashboard

#### Issue 2: Old Cache
**Symptom**: Still showing old clean images
**Fix**:
```bash
# Clear browser cache (hard refresh)
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Or test in fresh incognito window
```

#### Issue 3: Function Needs Another Redeploy
**Symptom**: Network response shows old behavior
**Fix**:
```bash
supabase functions deploy generate-style-preview --project-ref fvjganetpyyrguuxjtqi --no-verify-jwt
```

#### Issue 4: Watermark Image Missing
**Symptom**: Logs show "Failed to fetch watermark asset"
**Fix**: Verify watermark logo exists at:
```
https://fvjganetpyyrguuxjtqi.supabase.co/lovable-uploads/781d4b89-6ecc-4101-aeaf-c5743efce1c1.png
```

---

## 📊 Current System State

### ✅ Completed
- [x] Dual-bucket storage client code
- [x] Server-side watermark enforcement
- [x] Frontend watermark control removed
- [x] Signed URL service created
- [x] Edge functions deployed
- [x] Build successful (781.14 kB)
- [x] Git merged to main

### ⚠️ Pending
- [ ] Create storage buckets (`preview-cache-public`, `preview-cache-premium`)
- [ ] Verify watermarks show for anonymous users
- [ ] Verify clean previews for premium users
- [ ] Test gallery download with tier validation

---

## 🎯 Expected Behavior After Bucket Creation

### Anonymous User Journey
```
1. Upload photo ✅
2. Select style ✅
3. Generate preview ✅
4. See 5 watermarks ✅ (NEW)
5. Try to save → Account prompt ✅
6. Network shows public bucket URL ✅ (NEW)
```

### Free User Journey
```
1. Sign up ✅
2. Upload photo ✅
3. Generate preview ✅
4. See 5 watermarks ✅ (NEW)
5. Save to gallery ✅
6. Download → Watermarked ✅ (NEW)
```

### Premium User Journey
```
1. Sign in (Creator/Plus/Pro) ✅
2. Upload photo ✅
3. Generate preview ✅
4. See NO watermarks ✅ (NEW)
5. Save to gallery ✅
6. Download → Clean via signed URL ✅ (NEW)
```

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/fvjganetpyyrguuxjtqi
- **SQL Editor**: https://supabase.com/dashboard/project/fvjganetpyyrguuxjtqi/sql/new
- **Storage Buckets**: https://supabase.com/dashboard/project/fvjganetpyyrguuxjtqi/storage/buckets
- **Edge Functions**: https://supabase.com/dashboard/project/fvjganetpyyrguuxjtqi/functions
- **Edge Function Logs**: https://supabase.com/dashboard/project/fvjganetpyyrguuxjtqi/logs/functions

---

## 🚀 Final Checklist

1. [ ] Run CREATE_BUCKETS.sql in Supabase SQL Editor
2. [ ] Verify buckets exist in Storage tab
3. [ ] Clear browser cache (Cmd+Shift+R)
4. [ ] Test in fresh incognito window
5. [ ] Upload photo + generate preview
6. [ ] Verify 5 watermarks visible
7. [ ] Check Network tab shows `preview-cache-public` URL
8. [ ] 🎉 Celebrate bulletproof watermarking!

---

**Status**: Edge functions deployed ✅ | Buckets need creation ⚠️
**Next**: Create buckets via CREATE_BUCKETS.sql (2 minutes)
**Then**: Test in incognito window to see watermarks

