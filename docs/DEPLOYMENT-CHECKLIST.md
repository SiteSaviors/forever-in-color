# Watermark Hardening - Deployment Checklist

## 📋 Pre-Deployment Verification

### Local Build
- [x] `npm run lint` - Passes (3 pre-existing warnings only)
- [x] `npm run build` - Successful (781.14 kB main bundle)
- [ ] Test on localhost:4177 with different user tiers

---

## 🗄️ Database Migration

### Step 1: Run Storage Bucket Migration

```bash
# Apply the migration to create dual buckets
supabase db push

# Or manually run the migration
supabase migration up
```

**Migration File**: `supabase/migrations/20251014130000_create_dual_storage_buckets.sql`

**What it creates**:
- `preview-cache-public` bucket (public, watermarked images)
- `preview-cache-premium` bucket (private, clean images)
- Storage policies for access control

### Step 2: Verify Buckets Created

```bash
# Check buckets exist
supabase storage list

# Expected output:
# preview-cache-public (public)
# preview-cache-premium (private)
```

Or verify in Supabase Dashboard:
1. Go to Storage
2. Check for both buckets
3. Verify `preview-cache-premium` shows "Private" badge

---

## ⚡ Edge Function Deployment

### Step 3: Deploy Updated Edge Function

```bash
# Deploy updated generate-style-preview (with dual-bucket support)
supabase functions deploy generate-style-preview

# Expected output:
# Deploying function generate-style-preview
# ✓ Function deployed successfully
```

### Step 4: Deploy New Signed URL Function

```bash
# Deploy new get-premium-preview function
supabase functions deploy get-premium-preview

# Expected output:
# Deploying function get-premium-preview
# ✓ Function deployed successfully
```

### Step 5: Verify Functions Deployed

```bash
# List all functions
supabase functions list

# Expected to see:
# - generate-style-preview (version updated)
# - get-premium-preview (new)
```

Or verify in Supabase Dashboard:
1. Go to Edge Functions
2. Check both functions are listed
3. Click each to verify recent deployment timestamp

---

## 🌐 Frontend Deployment

### Step 6: Commit Changes

```bash
git add .
git commit -m "feat: implement bulletproof watermark enforcement with dual-bucket system

- Add dual-bucket storage (public/premium)
- Remove client-side watermark control
- Add signed URL service for premium users
- Update gallery to respect tier-based access
- Server-side watermark enforcement only

Closes #watermark-hardening"

git push origin feature/harden-watermarks
```

### Step 7: Create Pull Request

1. Go to GitHub
2. Create PR from `feature/harden-watermarks` to `main`
3. Title: "Bulletproof Watermark Enforcement System"
4. Description: Link to `WATERMARK-IMPLEMENTATION-COMPLETE.md`
5. Request review (or self-merge if founder)

### Step 8: Deploy to Production

After PR merged to `main`:
- Vercel auto-deploys (if connected)
- Or manually trigger deployment

```bash
# If using Vercel CLI
vercel --prod
```

---

## 🧪 Post-Deployment Testing

### Test 1: Anonymous User (Watermarked)

1. Open app in incognito/private window
2. Upload photo + select style
3. **Verify**: Preview shows 5 watermarks (4 corners + 1 center)
4. **Inspect Network**: URL should point to `preview-cache-public`
5. **Try to save**: Should show account prompt
6. **Copy URL**: Paste in new tab → should be watermarked

✅ Pass Criteria: All watermarks visible, no clean image access

### Test 2: Free User (Watermarked)

1. Sign up new free account
2. Upload photo + select style
3. **Verify**: Preview shows 5 watermarks
4. **Save to gallery**: Should succeed
5. **Download from gallery**: Should be watermarked
6. **Inspect Network**: URL should point to `preview-cache-public`

✅ Pass Criteria: Authenticated but still watermarked

### Test 3: Premium User (Clean)

1. Sign in with Creator/Plus/Pro account
2. Upload photo + select style
3. **Verify**: Preview shows NO watermarks
4. **Save to gallery**: Should succeed
5. **Download from gallery**: Should trigger signed URL generation
6. **Check downloaded file**: Should be clean (no watermarks)
7. **Inspect Network**: URL should point to `preview-cache-premium`

✅ Pass Criteria: Clean preview, clean download, signed URLs

### Test 4: Upgrade Flow

1. Sign in as free user → generate watermarked preview
2. Upgrade to Creator tier
3. Generate new preview
4. **Verify**: New preview is clean
5. **Check gallery**: Old preview still watermarked, new one clean

✅ Pass Criteria: New previews respect new tier

### Test 5: Attack Vectors

1. **Free user tries to access premium bucket**:
   - Manually construct URL to `preview-cache-premium`
   - Should return 403 Forbidden

2. **Free user calls `/get-premium-preview` directly**:
   ```bash
   curl -X POST https://[project].supabase.co/functions/v1/get-premium-preview \
     -H "Authorization: Bearer [free-user-token]" \
     -d '{"storagePath":"test.jpg"}'
   ```
   - Should return 403: "Premium preview access requires Creator/Plus/Pro"

3. **Inspect clean preview URL**:
   - Premium user generates preview
   - Copy URL from network tab
   - Sign out
   - Paste URL → should not load (private bucket)

✅ Pass Criteria: All attack vectors blocked

---

## 📊 Monitoring

### Check Edge Function Logs

```bash
# View logs for generate-style-preview
supabase functions logs generate-style-preview --tail

# Look for:
# ✅ "Preview cached successfully: bucket=public, watermarked=true"
# ✅ "Preview cached successfully: bucket=premium, watermarked=false"
# ❌ "[watermark] Failed to apply server watermark"
```

### Check Storage Usage

Supabase Dashboard → Storage:
1. **preview-cache-public**: Should grow with free/anon generations
2. **preview-cache-premium**: Should grow with premium generations
3. Monitor size limits (50MB per bucket currently)

### Check for Errors

Supabase Dashboard → Logs:
1. Filter by "Error" level
2. Look for watermark-related errors
3. Check signed URL generation failures

---

## 🚨 Rollback Plan (If Needed)

### If Critical Issue Found:

1. **Revert Frontend**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Revert Edge Functions**:
   ```bash
   # Redeploy previous version
   git checkout <previous-commit>
   supabase functions deploy generate-style-preview
   supabase functions deploy get-premium-preview --delete
   ```

3. **Keep Buckets**: Don't delete buckets (no harm in keeping them)

---

## ✅ Deployment Complete Checklist

- [ ] Migration applied (buckets created)
- [ ] `generate-style-preview` deployed
- [ ] `get-premium-preview` deployed
- [ ] Frontend deployed to production
- [ ] Anonymous user test passed
- [ ] Free user test passed
- [ ] Premium user test passed
- [ ] Attack vector tests passed
- [ ] Monitoring dashboard checked
- [ ] No critical errors in logs

---

## 📞 Support

If issues arise:
1. Check Supabase Edge Function logs
2. Check browser console for errors
3. Verify buckets exist and have correct policies
4. Test with fresh incognito window
5. Check entitlements are loading correctly

---

**Prepared by**: Claude (Senior AI Developer)
**Date**: October 14, 2025
**Status**: Ready for Deployment
