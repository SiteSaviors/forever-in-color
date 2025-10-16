# Developer Premium Testing Guide

**How to test premium features without payment in Wondertone**

---

## Overview

Wondertone has a built-in developer bypass system that grants premium (Pro-tier) privileges to specific test accounts. This allows you to test premium features like:

- ✅ **Unlimited preview generations** (no token limits)
- ✅ **No watermarks** on generated previews
- ✅ **Pro priority queue** for faster generation
- ✅ **Full access to all styles** and features

---

## Setup Methods

### Method 1: Environment Variable (Recommended for Dev/Staging)

Add your test email(s) to the `WT_DEV_BYPASS_EMAILS` environment variable in your Supabase edge function secrets.

**Steps:**

1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Add or update the `WT_DEV_BYPASS_EMAILS` secret:

```json
["your-dev-email@example.com", "another-tester@example.com"]
```

3. Redeploy the `generate-style-preview` edge function:

```bash
supabase functions deploy generate-style-preview
```

4. Sign up or sign in with the email address you added
5. You now have unlimited premium access! 🎉

**How it works:**
- The edge function checks if your authenticated email is in the `WT_DEV_BYPASS_EMAILS` set
- If matched, you're granted `tierLabel: 'dev'` with all Pro benefits
- No database changes needed - purely runtime override

---

### Method 2: Database `dev_override` Flag (Per-User Control)

Set the `dev_override` flag directly in the database for specific user accounts.

**Steps:**

1. Find your user ID from Supabase Dashboard → Authentication → Users
2. Run this SQL in the Supabase SQL Editor:

```sql
-- Grant dev override to a specific user
UPDATE profiles
SET dev_override = true
WHERE id = 'your-user-uuid-here';
```

3. Sign in with that account - you now have premium access!

**To revoke:**

```sql
UPDATE profiles
SET dev_override = false
WHERE id = 'your-user-uuid-here';
```

**How it works:**
- The `profiles` table has a `dev_override` boolean column (default: `false`)
- When resolving entitlements, the edge function checks `profileRow?.dev_override`
- If `true`, grants `devBypass: true` → unlimited tokens, no watermarks, Pro priority

---

## How Dev Bypass Affects Entitlements

When dev bypass is active (either method), your entitlement context becomes:

```typescript
{
  actor: 'authenticated',
  tierLabel: 'dev',           // Special dev tier
  tierForDb: 'pro',           // Treated as Pro in database logs
  quota: null,                // ∞ unlimited generations
  remainingBefore: null,      // ∞ no token tracking
  requiresWatermark: false,   // No watermarks!
  priority: 'pro',            // Highest priority queue
  devBypass: true,            // Dev mode flag
  // ... other fields
}
```

**Key behaviors:**

| Feature | Free User | Dev Bypass User |
|---------|-----------|-----------------|
| Token quota | 10/month | ∞ Unlimited |
| Watermarks | Yes (80% opacity) | No watermarks |
| Priority | Normal queue | Pro queue (fastest) |
| Rate limits | Standard | Same as Pro |
| Gallery | Limited | Full access |

---

## Testing Checklist

Use this checklist to verify dev bypass is working:

### ✅ Entitlement Verification

1. **Generate a preview** (any style)
2. **Check edge function logs** (Supabase Dashboard → Edge Functions → Logs):
   ```
   [entitlements] Resolved: dev (unlimited tokens, no watermark)
   ```
3. **Verify no watermark** appears on the generated preview
4. **Generate 20+ previews** in rapid succession - no quota warnings

### ✅ Visual Verification

1. Open Studio, upload a photo
2. Generate previews for multiple styles
3. **Confirm no watermark grid** appears (should see clean image)
4. **Check CanvasInRoomPreview** - clean image, no watermark overlay

### ✅ Gallery Testing

1. Save watermarked previews to gallery (as non-dev user first)
2. Switch to dev bypass account
3. **Gallery should show clean URLs** for your previews
4. Download from gallery - clean image, no watermark

---

## Troubleshooting

### "Still seeing watermarks despite dev bypass"

**Check:**
1. Edge function logs confirm `devBypass: true`
2. You're signed in with the correct email
3. Edge function was redeployed after adding email to `WT_DEV_BYPASS_EMAILS`
4. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

**Debug:**
```bash
# Check edge function logs for your request
supabase functions logs generate-style-preview --tail

# Look for:
# [entitlements] Resolved: dev (unlimited tokens, no watermark)
# [on-the-fly] Watermark NOT applied (paid user)
```

### "Token quota still showing as 10/10"

**This is expected!** The database still shows your base tier (free), but the edge function runtime bypasses it. Check logs - you'll see `devBypass: true` even if UI shows quota.

**To hide quota UI for dev users:**
- Add `devBypass` flag to client-side entitlement context
- Conditionally hide `<TokenWarningBanner>` when `devBypass === true`

### "Database method not working"

**Verify:**
```sql
-- Check if dev_override is set
SELECT id, email, dev_override
FROM auth.users
JOIN profiles ON auth.users.id = profiles.id
WHERE email = 'your-email@example.com';
```

Should return `dev_override: true`. If `null`, run the UPDATE statement again.

---

## Best Practices

### Production Safety

**NEVER enable dev bypass in production** for real user accounts. Only use for:
- Local development (`.env.local`)
- Staging environment
- Internal test accounts with clearly marked emails (e.g., `dev-test@wondertone.com`)

**Recommended: Use email domain filter**

```json
["dev-test@wondertone.com", "staging-user@wondertone.com"]
```

Avoid personal emails in production `WT_DEV_BYPASS_EMAILS`.

### Security Considerations

1. **Dev bypass emails are runtime secrets** - never commit to Git
2. **Rotate test accounts** periodically (remove old testers)
3. **Monitor abuse** - log all dev bypass requests
4. **Use database method** for long-term QA accounts (easier to revoke)

---

## Implementation Details

### Code References

- **Entitlement Resolution**: [supabase/functions/generate-style-preview/entitlements.ts:85-161](../supabase/functions/generate-style-preview/entitlements.ts#L85-L161)
- **Email Parsing**: [supabase/functions/generate-style-preview/index.ts:47-61](../supabase/functions/generate-style-preview/index.ts#L47-L61)
- **Watermark Check**: [supabase/functions/generate-style-preview/entitlements.ts:46-49](../supabase/functions/generate-style-preview/entitlements.ts#L46-L49)
- **Database Schema**: [supabase/migrations/20251015090000_entitlements.sql:14](../supabase/migrations/20251015090000_entitlements.sql#L14)

### Logic Flow

```typescript
// 1. Parse dev bypass emails from env
const devBypassEmails = parseDevBypassEmails(); // Set<string>

// 2. During entitlement resolution
const { data: profileRow } = await supabase
  .from('profiles')
  .select('dev_override')
  .eq('id', userId)
  .maybeSingle();

const devOverride = Boolean(profileRow?.dev_override);
const devBypass = devOverride || (email && devBypassEmails.has(email));

// 3. Apply dev bypass
if (devBypass) {
  return {
    tierLabel: 'dev',
    quota: null,              // Unlimited
    requiresWatermark: false, // No watermarks
    priority: 'pro',          // Pro queue
    devBypass: true
  };
}
```

---

## Quick Setup Commands

### Add Your Email (Method 1)

```bash
# Set environment variable (replace with your email)
supabase secrets set WT_DEV_BYPASS_EMAILS='["your-email@example.com"]'

# Redeploy edge function
supabase functions deploy generate-style-preview
```

### Enable Database Override (Method 2)

```sql
-- Replace with your actual user ID
UPDATE profiles
SET dev_override = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

---

## Summary

✅ **Two methods available:**
1. **Environment variable** (`WT_DEV_BYPASS_EMAILS`) - runtime override, no DB changes
2. **Database flag** (`profiles.dev_override`) - per-user persistent override

✅ **Both grant:**
- Unlimited preview generations
- No watermarks
- Pro-tier priority
- Full feature access

✅ **Recommended:** Use Method 1 (env var) for temporary testing, Method 2 (database) for long-term QA accounts.

---

**Ready to test?** Pick a method, follow the steps, and enjoy premium features! 🚀
