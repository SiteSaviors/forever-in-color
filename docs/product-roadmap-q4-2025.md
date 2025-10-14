# Wondertone Product Roadmap – Q4 2025
**Building the World's Smartest AI Art Company**

_Last Updated: October 14, 2025 (Sprint 1 Completed)_
_Prepared for: Founder & Claude Collaboration_

---

## 🎉 SPRINT 1 COMPLETED (October 14, 2025)

**Status**: ✅ ALL TASKS COMPLETE
**Build**: ✅ Successful (715.60 kB main bundle)
**Lint**: ✅ Passed (0 errors, 2 pre-existing warnings)

### What We Shipped

#### 1. **Token UX Consistency** ✅
- **Fixed**: Navigation badge now uses `entitlements.remainingTokens` (server truth) instead of client-side `generationCount`
- **Impact**: Eliminated token count drift between navigation and studio
- **Files Modified**: `src/components/navigation/FounderNavigation.tsx`

#### 2. **TokenDecrementToast Component** ✅
- **Created**: Animated toast notification that appears after each generation
- **Features**: Particle effects, smooth animations, 2-second auto-dismiss
- **Shows**: "−1 Token • X remaining"
- **Files**: `src/components/ui/TokenDecrementToast.tsx`, integrated in `AuthProvider.tsx`

#### 3. **TokenWarningBanner Component** ✅
- **Created**: Sticky banner that appears when ≤20% tokens remain
- **Features**: Amber gradient design, tier-specific upgrade recommendations, dismissible
- **Placement**: Top of studio below header
- **Files**: `src/components/studio/TokenWarningBanner.tsx`, added to `StudioConfigurator.tsx`

#### 4. **QuotaExhaustedModal Component** ✅
- **Created**: Beautiful modal with tier-specific messaging when quota exhausted
- **Features**:
  - Tier-specific upgrade recommendations
  - Token refresh countdown for time-gated tiers
  - Side-by-side current vs recommended tier comparison
  - Gradient designs matching brand
  - Direct CTAs to pricing page
- **Triggers**: Automatically when `canGenerateMore()` returns false
- **Files**: `src/components/modals/QuotaExhaustedModal.tsx`, integrated in `AuthProvider.tsx`

#### 5. **UsagePage with Token History** ✅
- **Created**: Complete usage dashboard at `/studio/usage`
- **Features**:
  - **History Tab**: Sortable/filterable table of all preview generations
  - **Analytics Tab**: Usage overview with progress bars, token stats, 30-day trend chart
  - **Smart Recommendations**: Tier upgrade suggestions based on usage patterns
  - Export CSV functionality (placeholder)
- **Navigation**: Added links in nav dropdown (authenticated users) and studio sidebar
- **Files**:
  - `src/pages/UsagePage.tsx`
  - `src/components/usage/TokenHistoryTable.tsx`
  - `src/components/usage/UsageAnalyticsCard.tsx`
  - `src/components/usage/TierRecommendation.tsx`
  - Route added to `src/main.tsx`

### Technical Notes

**Bundle Size Impact**: +147 KB (+25.8% from 567.66 KB → 715.60 KB)
- Primarily from new components and Framer Motion animations
- Within acceptable range for feature set delivered
- Future optimization: Code-split UsagePage (not on critical path)

**State Management**:
- Added `showTokenToast` and `showQuotaModal` to `useFounderStore`
- Both modals managed globally via `AuthProvider`
- Toast triggers on successful generation (line 818 in useFounderStore.ts)
- Modal triggers when quota check fails (line 706 in useFounderStore.ts)

**Mock Data Note**:
- `TokenHistoryTable` currently uses mock preview data
- **Next Step**: Create Supabase edge function to query `preview_logs` table
- Schema already exists, just needs API endpoint

### Files Created (10 new files)
1. `src/components/ui/TokenDecrementToast.tsx`
2. `src/components/studio/TokenWarningBanner.tsx`
3. `src/components/modals/QuotaExhaustedModal.tsx`
4. `src/pages/UsagePage.tsx`
5. `src/components/usage/TokenHistoryTable.tsx`
6. `src/components/usage/UsageAnalyticsCard.tsx`
7. `src/components/usage/TierRecommendation.tsx`

### Files Modified (6 files)
1. `src/components/navigation/FounderNavigation.tsx` - Fixed token badge, added usage link
2. `src/providers/AuthProvider.tsx` - Added toast and modal
3. `src/store/useFounderStore.ts` - Added modal/toast state, trigger logic
4. `src/sections/StudioConfigurator.tsx` - Added warning banner, usage link
5. `src/main.tsx` - Added `/studio/usage` route
6. `docs/product-roadmap-q4-2025.md` - This update

### Next Steps (Sprint 2 - Recommended)

**Priority**: Token History Backend Integration
1. Create `supabase/functions/get-usage-history/index.ts`
2. Query `preview_logs` table with user_id/anon_token filter
3. Return paginated results with style metadata
4. Replace mock data in `TokenHistoryTable`
5. Add CSV export functionality

**Alternative**: Move to Sprint 3 (Persistent Gallery) for maximum retention impact

---

## 📋 Executive Summary

This roadmap outlines the strategic technical initiatives required to transform Wondertone from a functional AI art platform into the world's smartest AI art company. After comprehensive codebase analysis and user flow mapping, we've identified 15 high-impact opportunities organized into 4 implementation tiers.

**Current State Snapshot** (Updated after Sprint 1):
- ✅ Authentication & magic-link auth fully functional
- ✅ Stripe checkout & subscription management working
- ✅ Token tracking infrastructure in place (DB + API)
- ✅ Preview generation with watermark enforcement operational
- ✅ Entitlements system computing quotas correctly
- ✅ **NEW: Token badge calculation fixed (navigation + studio now consistent)**
- ✅ **NEW: Token decrement toast with animations**
- ✅ **NEW: Token warning banner at 80% usage threshold**
- ✅ **NEW: QuotaExhaustedModal with tier-specific upgrade flows**
- ✅ **NEW: UsagePage with token history table & analytics dashboard**
- ✅ **NEW: Smart tier recommendations based on usage**
- ✅ **NEW: Navigation links to token history in nav dropdown & studio sidebar**
- ⚠️ No persistent gallery (Sprint 3 priority)
- ⚠️ Usage page uses mock data (needs backend integration)

---

## 🔍 Token System Deep Dive (Current Implementation)

### How Tokens Work Today

#### **Token Display Locations:**
1. **Studio Sidebar** ([StudioConfigurator.tsx:121-123](src/sections/StudioConfigurator.tsx#L121-L123))
   - Shows: "Generations Remaining: X left"
   - Shows: Tier and quota
   - Source: `entitlements.remainingTokens`

2. **Navigation Bar** ([FounderNavigation.tsx:155-173](src/components/navigation/FounderNavigation.tsx#L155-L173))
   - Purple gradient badge: "Tokens X"
   - Calculated from: `generationLimit - generationCount` (legacy)
   - Also displays in account dropdown

#### **Token Deduction Flow:**
```
User clicks style
  ↓
startStylePreview() called [useFounderStore.ts:623]
  ↓
Check canGenerateMore() [line 693]
  ↓
generateStylePreview() → Edge Function [stylePreviewApi.ts:55]
  ↓
Edge function:
  - Validates entitlements
  - Deducts token in preview_logs table
  - Returns remainingTokens in response
  ↓
updateEntitlementsFromResponse() [useFounderStore.ts:806-811]
  ↓
Updates entitlements.remainingTokens in state
  ↓
UI updates automatically (reactive)
```

#### **What's Working:**
- ✅ Token deduction happens server-side (secure)
- ✅ Response includes updated `remainingTokens`
- ✅ Store updates immediately after generation
- ✅ Studio sidebar reflects real-time balance
- ✅ Navigation badge updates (but uses different calculation)

#### **What Needs Improvement:**
- ❌ **Navigation badge calculation mismatch**: Uses `generationLimit - generationCount` instead of `entitlements.remainingTokens`
- ❌ **No visual feedback** when tokens decrease
- ❌ **No warning** when approaching limit (80% threshold)
- ❌ **No history** of where tokens were spent
- ❌ **Hard gate** shows generic error, not branded modal
- ❌ **No celebration** when tokens refresh monthly

---

## 🎯 Implementation Roadmap

### **TIER 1: Critical UX & Revenue Gaps (Weeks 1-3)**

#### **1.1 Token UX Consistency & Visual Feedback** ⭐️⭐️⭐️⭐️⭐️
**Priority**: CRITICAL
**Effort**: 2 days
**Impact**: Prevents user confusion, builds trust

**Problem**:
- Navigation badge uses `generationLimit - generationCount` (client-side counter)
- Studio sidebar uses `entitlements.remainingTokens` (server-side truth)
- These can drift out of sync, confusing users

**Solution**:
- **Standardize on `entitlements.remainingTokens`** everywhere
- Remove `generationCount` increment (it's redundant)
- Add animated token decrease effect (number rolls down with particles)
- Show toast notification: "−1 token • X remaining"

**Files to Modify**:
- `src/components/navigation/FounderNavigation.tsx` (lines 62-71: use `entitlements.remainingTokens`)
- `src/store/useFounderStore.ts` (line 812: add toast trigger)
- `src/components/ui/TokenDecrementToast.tsx` (new: animated notification)

**Acceptance Criteria**:
- [ ] Both navigation and studio show identical token counts
- [ ] Token decrease animates smoothly (-1 with particle effect)
- [ ] Toast appears for 2 seconds after each generation
- [ ] No drift between client counter and server truth

---

#### **1.2 Hard Gate Modal & Upgrade Flow** ⭐️⭐️⭐️⭐️⭐️
**Priority**: CRITICAL
**Effort**: 4 days
**Impact**: 3-5x conversion from blocked users

**Current State**:
- Soft gate at 5 generations (anonymous) shows `AccountPromptModal` ✅
- Hard gate shows generic error: "Preview limit reached. Upgrade to continue." ❌
- No modal, no CTA, no tier comparison

**Solution**:
Create **`QuotaExhaustedModal`** with:
- Beautiful gradient design matching brand
- Tier-specific messaging:
  - Anonymous: "You've created 10 previews! Sign up for 10 more free tokens this month"
  - Free: "You've used all 10 tokens this month. Upgrade to Creator for 50 watermark-free tokens!"
  - Creator: "You've used all 50 tokens. Upgrade to Plus for 250/month!"
- Side-by-side current tier vs recommended tier
- Token reset countdown: "Your tokens refresh in 18 days" (if applicable)
- Primary CTA: "Upgrade to [Tier]" → `/pricing`
- Secondary CTA: "View Pricing" → `/pricing`

**Files to Create**:
- `src/components/modals/QuotaExhaustedModal.tsx` (new modal component)
- `src/hooks/useQuotaModal.ts` (new: modal state management)

**Files to Modify**:
- `src/store/useFounderStore.ts` (lines 693-701: trigger modal instead of setting error)
- `src/sections/StudioConfigurator.tsx` (add modal trigger on generation attempt)

**Acceptance Criteria**:
- [ ] Modal appears when `canGenerateMore()` returns false
- [ ] Shows correct tier-specific messaging
- [ ] Displays token refresh countdown for time-gated tiers
- [ ] CTA redirects to `/pricing` with proper tier highlighted
- [ ] "Maybe Later" dismisses modal but keeps user in studio
- [ ] Modal can be re-triggered on subsequent generation attempts

---

#### **1.3 Token Warning Banner (80% Threshold)** ⭐️⭐️⭐️⭐️
**Priority**: HIGH
**Effort**: 2 days
**Impact**: Proactive upgrade prompts, reduces churn surprise

**Solution**:
- Add sticky banner at top of studio when `remainingTokens / quota <= 0.2`
- Design: Gradient amber/orange warning banner
- Message: "⚠️ You have X tokens left this period. Upgrade to [Next Tier] for Y more tokens/month."
- CTA button: "View Plans" → `/pricing`
- Dismissible but reappears on page reload until upgraded

**Files to Create**:
- `src/components/studio/TokenWarningBanner.tsx` (new banner component)

**Files to Modify**:
- `src/sections/StudioConfigurator.tsx` (add banner above main layout)
- `src/store/useFounderStore.ts` (add computed `shouldShowTokenWarning()` selector)

**Acceptance Criteria**:
- [ ] Banner appears when ≤20% tokens remain
- [ ] Shows tier-appropriate upgrade recommendation
- [ ] Can be dismissed but persists across sessions
- [ ] Links to pricing page with recommended tier highlighted
- [ ] Disappears after upgrade

---

#### **1.4 Token History & Usage Page** ⭐️⭐️⭐️⭐️⭐️
**Priority**: CRITICAL
**Effort**: 5 days
**Impact**: Transparency → trust → 40% fewer support tickets

**Current State**:
- All preview generations logged in `preview_logs` table ✅
- Includes: `style_id`, `created_at`, `tokens_spent`, `outcome`, `preview_url`
- NO user-facing UI to view this data ❌

**Solution**:
Create **`/studio/usage`** page with:

**Table View**:
- Columns: Date | Style | Preview Thumbnail | Tokens | Status | Actions
- Sortable by date, style, tokens
- Filter by date range (last 7/30/90 days, custom)
- Filter by outcome (success/error)
- Pagination (20 per page)
- Export to CSV button

**Usage Analytics Dashboard**:
- **Period Summary Card**:
  - Tokens used this period: 42 / 50
  - Progress bar with gradient fill
  - Days until reset: 18 days
- **Usage Chart**:
  - Line graph: tokens spent per day (last 30 days)
  - Bar chart: tokens by style (top 5)
- **Smart Recommendation**:
  - "Based on your usage, you're on track to use ~85 tokens/month"
  - "Upgrade to Plus (250 tokens) to never worry about limits"
  - Estimated savings if upgrading

**Navigation Integration**:
- Add "Token History" link in account dropdown
- Add "View Usage" link in studio sidebar (below token counter)
- Add inline link in QuotaExhaustedModal: "View your usage history"

**Files to Create**:
- `src/pages/UsagePage.tsx` (main page)
- `src/components/usage/TokenHistoryTable.tsx` (table component)
- `src/components/usage/UsageAnalyticsCard.tsx` (summary stats)
- `src/components/usage/UsageChart.tsx` (chart visualization)
- `src/components/usage/TierRecommendation.tsx` (smart upsell)
- `src/utils/usageApi.ts` (fetch preview_logs for current user)

**Files to Modify**:
- `src/main.tsx` (add route: `/studio/usage`)
- `src/components/navigation/FounderNavigation.tsx` (add dropdown link)
- `src/sections/StudioConfigurator.tsx` (add "View Usage" link in sidebar)

**API Endpoint Needed**:
- `supabase/functions/get-usage-history/index.ts` (new edge function)
  - Query `preview_logs` filtered by `user_id` or `anon_token`
  - Return paginated results with style metadata
  - Include period summary calculations

**Acceptance Criteria**:
- [ ] Table displays all user's preview generations
- [ ] Filtering and sorting work correctly
- [ ] Export CSV includes all columns
- [ ] Analytics show correct token spend trends
- [ ] Chart renders without performance issues (use recharts or similar)
- [ ] Tier recommendation logic suggests optimal plan
- [ ] Page loads in <2 seconds with 100+ records

---

### **TIER 2: Retention & Revenue Optimization (Weeks 4-6)**

#### **2.1 Persistent User Gallery ("My Studio")** ⭐️⭐️⭐️⭐️⭐️
**Priority**: VERY HIGH
**Effort**: 7 days
**Impact**: 3x return visits, 2x print orders, core stickiness

**Current State**:
- Previews generated but NOT persisted per user ❌
- Users lose work after closing browser ❌
- No way to revisit past creations ❌

**Solution**:
Create **`/studio/gallery`** page with:

**Gallery Grid**:
- Masonry layout showing all saved previews
- Each card shows:
  - Preview image (with watermark if applicable)
  - Style name
  - Orientation badge
  - Date created
  - Download button (tier-gated)
  - Re-order button → pre-fills configurator
  - Delete button
- Filter by: Style, Orientation, Date, Watermarked/Clean
- Sort by: Newest, Oldest, Most Recent Order

**Auto-Save on Generation**:
- Every successful preview → automatically save to gallery
- Show toast: "✓ Saved to your gallery"
- Link in toast: "View Gallery"

**Download Functionality**:
- **Free/Anonymous**: Can download watermarked version only
- **Creator/Plus/Pro**: Download watermark-free version
- Show upgrade prompt if free user clicks clean download
- Track downloads in analytics

**Database Schema**:
```sql
CREATE TABLE user_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  anon_token TEXT REFERENCES anonymous_tokens(token),
  preview_log_id UUID REFERENCES preview_logs(id),
  style_id TEXT NOT NULL,
  style_name TEXT NOT NULL,
  orientation TEXT NOT NULL,
  watermarked_url TEXT NOT NULL,
  clean_url TEXT, -- null for free/anonymous
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_downloaded_at TIMESTAMPTZ,
  download_count INT DEFAULT 0,
  is_favorited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_user_gallery_user ON user_gallery(user_id, created_at DESC);
CREATE INDEX idx_user_gallery_anon ON user_gallery(anon_token, created_at DESC);
```

**Files to Create**:
- `src/pages/GalleryPage.tsx` (main gallery view)
- `src/components/gallery/GalleryGrid.tsx` (masonry grid)
- `src/components/gallery/GalleryItem.tsx` (individual card)
- `src/components/gallery/GalleryFilters.tsx` (filter controls)
- `src/utils/galleryApi.ts` (CRUD operations)
- `supabase/functions/save-to-gallery/index.ts` (save preview)
- `supabase/functions/get-gallery/index.ts` (fetch gallery items)
- `supabase/migrations/[timestamp]_create_user_gallery.sql`

**Files to Modify**:
- `src/store/useFounderStore.ts` (line 805: auto-save after successful generation)
- `src/components/navigation/FounderNavigation.tsx` (add "My Art" nav link)
- `src/main.tsx` (add `/studio/gallery` route)

**Acceptance Criteria**:
- [ ] Gallery displays all user's previews in masonry grid
- [ ] Auto-save happens after every successful generation
- [ ] Download watermarked version works for all users
- [ ] Download clean version gated behind paid tiers
- [ ] Free users see upgrade modal when clicking clean download
- [ ] Re-order button pre-fills studio with saved preview settings
- [ ] Filtering and sorting work smoothly
- [ ] Infinite scroll or pagination handles 100+ items
- [ ] Gallery loads in <2 seconds

---

#### **2.2 Billing Lifecycle Polish** ⭐️⭐️⭐️⭐️
**Priority**: HIGH
**Effort**: 3 days
**Impact**: 15% churn reduction, improved user confidence

**Current State**:
- Stripe webhooks update database correctly ✅
- PricingPage shows success/cancel messages ✅
- BUT: No celebration, no immediate feedback ❌
- No subscription management UI ❌

**Solution**:

**Success Flow Enhancement**:
- On `/pricing?checkout=success`:
  - Show **UpgradeSuccessModal** with confetti animation
  - Message: "Welcome to [Tier Name]! 🎉"
  - Show new token quota prominently
  - CTA: "Start Creating" → `/create`
  - Auto-close after 5 seconds or manual dismiss
- Immediately hydrate entitlements (don't wait for webhook)
- Show loading state: "Activating your subscription..."

**Subscription Management**:
- In account dropdown, show:
  - Current tier badge
  - Renewal date: "Renews Jan 12, 2026"
  - Link: "Manage Subscription" → Stripe Customer Portal
- Add to `/account/settings` page:
  - Subscription status card
  - Payment method on file
  - Billing history (last 3 invoices)
  - Cancel subscription button (with confirmation)

**Payment Failure Handling**:
- `invoice.payment_failed` webhook → trigger:
  - In-app notification (banner): "Payment failed. Please update your card."
  - Email notification (Stripe sends automatically)
  - Grace period: 7 days before downgrade
  - After 7 days: webhook downgrades to free tier
- UI shows: "⚠️ Payment Issue - Update Payment Method" banner

**Files to Create**:
- `src/components/modals/UpgradeSuccessModal.tsx` (celebration modal with confetti)
- `src/components/account/SubscriptionCard.tsx` (subscription details)
- `src/components/ui/ConfettiEffect.tsx` (confetti animation)
- `src/utils/stripePortal.ts` (generate Customer Portal link)

**Files to Modify**:
- `src/pages/PricingPage.tsx` (lines 117-120: trigger success modal)
- `src/components/navigation/FounderNavigation.tsx` (add renewal date, manage link)
- `supabase/functions/stripe-webhook/index.ts` (add payment failure notification logic)

**Acceptance Criteria**:
- [ ] Success modal appears with confetti on upgrade
- [ ] Entitlements update within 3 seconds of checkout
- [ ] Renewal date displays in account dropdown
- [ ] "Manage Subscription" opens Stripe Customer Portal
- [ ] Payment failure banner appears within 1 hour
- [ ] Downgrade happens automatically after 7-day grace period

---

#### **2.3 Smart Tier Recommendations** ⭐️⭐️⭐️⭐️
**Priority**: HIGH
**Effort**: 4 days
**Impact**: 25% better tier selection, 10-15% ARPU lift

**Current State**:
- Pricing page shows static tier cards
- Users guess which plan they need
- No personalization based on usage patterns

**Solution**:

**Usage-Based Analysis**:
- Track rolling 30-day average: `avgTokensPerMonth`
- Calculate: `projectedMonthlyUsage = avgTokensPerMonth * 1.2` (add 20% buffer)
- Map to optimal tier:
  - < 10 tokens/mo → Free
  - 10-50 tokens/mo → Creator
  - 50-250 tokens/mo → Plus
  - 250+ tokens/mo → Pro

**Pricing Page Personalization**:
- Add "Recommended for You" badge on optimal tier card
- Show calculation tooltip: "Based on your avg. 42 tokens/month"
- Highlight cost savings: "Save $XX/year vs buying tokens individually"
- Anonymous users: Default recommend Creator (most popular)

**In-Studio Prompts**:
- After 30 tokens used in current period:
  - If Free tier & approaching limit:
    - Banner: "You're on track to use ~45 tokens/month. Upgrade to Creator ($9.99) for 50 tokens + no watermarks!"
- After hitting 80% quota:
  - "You're using tokens faster than expected. Consider upgrading to [Next Tier]."

**Files to Create**:
- `src/utils/tierRecommendation.ts` (recommendation logic)
- `src/components/pricing/RecommendedBadge.tsx` (badge component)

**Files to Modify**:
- `src/pages/PricingPage.tsx` (add recommendation logic, badge display)
- `src/components/ui/TierCard.tsx` (add `isRecommended` prop, badge slot)
- `src/store/useFounderStore.ts` (add usage tracking helpers)
- `src/components/studio/TokenWarningBanner.tsx` (enhance with recommendation)

**Acceptance Criteria**:
- [ ] Recommendation algorithm calculates correctly based on 30-day avg
- [ ] "Recommended for You" badge appears on correct tier
- [ ] Tooltip explains recommendation logic
- [ ] Anonymous users see Creator as default recommendation
- [ ] In-studio banners suggest appropriate tier at 30/80% thresholds
- [ ] Analytics track recommendation acceptance rate

---

#### **2.4 Profile Management & Settings** ⭐️⭐️⭐️
**Priority**: MEDIUM-HIGH
**Effort**: 4 days
**Impact**: Professional feel, reduced checkout friction

**Current State**:
- User profile exists in `profiles` table
- Email from auth, no other data
- No UI for profile management

**Solution**:

**Profile Page (`/account/profile`)**:
- **Account Info Section**:
  - Email (read-only, from Supabase auth)
  - Display name (optional, editable)
  - Avatar upload (store in Supabase Storage)
  - Member since date
- **Shipping Defaults** (for canvas orders):
  - Full name
  - Address line 1 & 2
  - City, State, Zip
  - Country
  - Phone number
  - "Save as default" checkbox
- **Email Preferences**:
  - Marketing emails toggle
  - Order status updates toggle
  - Monthly usage reports toggle
  - New style releases toggle

**Settings Page (`/account/settings`)**:
- **Studio Preferences**:
  - Preview quality: Fast / Balanced / High Quality
  - Auto-save to gallery: On / Off
  - Default canvas size: [dropdown]
  - Default frame color: Black / White / None
- **Privacy & Security**:
  - Download account data (JSON export)
  - Delete account (danger zone, confirmation required)
- **Subscription** (if applicable):
  - Link to subscription management
  - Billing history
  - Invoices download

**Database Schema Updates**:
```sql
ALTER TABLE profiles ADD COLUMN display_name TEXT;
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN shipping_name TEXT;
ALTER TABLE profiles ADD COLUMN shipping_address_line1 TEXT;
ALTER TABLE profiles ADD COLUMN shipping_address_line2 TEXT;
ALTER TABLE profiles ADD COLUMN shipping_city TEXT;
ALTER TABLE profiles ADD COLUMN shipping_state TEXT;
ALTER TABLE profiles ADD COLUMN shipping_zip TEXT;
ALTER TABLE profiles ADD COLUMN shipping_country TEXT DEFAULT 'US';
ALTER TABLE profiles ADD COLUMN shipping_phone TEXT;
ALTER TABLE profiles ADD COLUMN email_marketing BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN email_orders BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN email_reports BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN email_releases BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN studio_preview_quality TEXT DEFAULT 'balanced';
ALTER TABLE profiles ADD COLUMN studio_auto_save BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN studio_default_size TEXT;
ALTER TABLE profiles ADD COLUMN studio_default_frame TEXT DEFAULT 'black';
```

**Files to Create**:
- `src/pages/ProfilePage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/components/account/ProfileForm.tsx`
- `src/components/account/ShippingForm.tsx`
- `src/components/account/EmailPreferences.tsx`
- `src/components/account/StudioPreferences.tsx`
- `src/components/account/DangerZone.tsx`
- `src/utils/profileApi.ts`
- `supabase/migrations/[timestamp]_extend_profiles.sql`

**Files to Modify**:
- `src/main.tsx` (add routes)
- `src/components/navigation/FounderNavigation.tsx` (add dropdown links)

**Acceptance Criteria**:
- [ ] Profile form saves display name and avatar correctly
- [ ] Avatar upload to Supabase Storage works
- [ ] Shipping defaults persist and pre-fill checkout
- [ ] Email preferences toggle correctly
- [ ] Studio preferences apply to next session
- [ ] Account deletion flow requires confirmation + password
- [ ] Data export generates valid JSON

---

### **TIER 3: Professional & Scale Features (Weeks 7-9)**

#### **3.1 Referral Program & Token Rewards** ⭐️⭐️⭐️
**Priority**: MEDIUM
**Effort**: 5 days
**Impact**: Viral growth, 15-25% organic acquisition

**Mechanism**:
- Each user gets unique referral link: `wondertone.com/r/ABC123XYZ`
- Referrer gets 5 bonus tokens when referee signs up
- Referee gets 5 bonus tokens on signup
- Track in `referrals` table
- Show referral dashboard: `/account/referrals`
  - Total referrals
  - Pending tokens
  - Tokens earned

**Social Sharing**:
- After generating preview: "Share" button
- Pre-populated text: "Just created amazing AI art with @Wondertone! Get 5 free tokens: [referral link]"
- Track shares in analytics
- Bonus: 1 token for every 3 social shares (prevents abuse)

**Files to Create**:
- `src/pages/ReferralsPage.tsx`
- `src/components/referrals/ReferralDashboard.tsx`
- `src/components/gallery/ShareButtons.tsx`
- `src/utils/referralApi.ts`
- `supabase/functions/track-referral/index.ts`
- `supabase/migrations/[timestamp]_create_referrals.sql`

**Database Schema**:
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES auth.users(id),
  referee_user_id UUID REFERENCES auth.users(id),
  referral_code TEXT UNIQUE NOT NULL,
  bonus_tokens_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN bonus_tokens INT DEFAULT 0;
```

**Acceptance Criteria**:
- [ ] Referral code generated on user signup
- [ ] Landing page `/r/ABC123` tracks referrer and redirects to signup
- [ ] Tokens awarded to both parties on referee signup
- [ ] Referral dashboard shows accurate stats
- [ ] Social share buttons include referral link
- [ ] Share bonus tracks and awards tokens

---

#### **3.2 Collaborative Workspaces (Plus/Pro only)** ⭐️⭐️⭐️
**Priority**: MEDIUM
**Effort**: 8 days
**Impact**: B2B enabler, 20% ARPU lift for target segment

**Use Case**: Studios managing multiple clients, teams sharing token pool

**Features**:
- Workspace admin can invite members (email)
- Shared token pool (Plus: 250, Pro: 500)
- Members see shared gallery
- Role-based permissions:
  - Admin: Manage members, billing, full access
  - Member: Create previews, view shared gallery
  - Viewer: View gallery only
- Usage attribution: Track which member used tokens
- Workspace switching UI (if user belongs to multiple)

**Database Schema**:
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id),
  tier TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member', 'viewer'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

ALTER TABLE subscriptions ADD COLUMN workspace_id UUID REFERENCES workspaces(id);
ALTER TABLE preview_logs ADD COLUMN workspace_id UUID;
ALTER TABLE user_gallery ADD COLUMN workspace_id UUID;
```

**Files to Create**:
- `src/pages/WorkspacesPage.tsx`
- `src/components/workspace/WorkspaceSelector.tsx`
- `src/components/workspace/MemberManagement.tsx`
- `src/components/workspace/UsageByMember.tsx`
- `src/utils/workspaceApi.ts`

**Acceptance Criteria**:
- [ ] Plus/Pro users can create workspace
- [ ] Invite flow sends email with join link
- [ ] Members see shared token pool
- [ ] Usage tracking attributes tokens to members
- [ ] Admin can remove members
- [ ] Workspace selector allows switching between personal/workspaces

---

#### **3.3 In-App Billing Center** ⭐️⭐️
**Priority**: MEDIUM
**Effort**: 3 days
**Impact**: Reduced Stripe redirect friction

**Solution**:
- Embed Stripe Customer Portal in `/account/billing`
- Show:
  - Current subscription
  - Payment method on file (with update button)
  - Billing history (last 12 invoices)
  - Download invoice PDFs
  - Cancel subscription flow (in-app)
  - Reactivate if canceled

**Files to Create**:
- `src/pages/BillingPage.tsx`
- `src/components/billing/PaymentMethod.tsx`
- `src/components/billing/InvoiceHistory.tsx`
- `src/components/billing/CancelSubscription.tsx`

**Acceptance Criteria**:
- [ ] Payment method displays last 4 digits
- [ ] Update card opens Stripe modal
- [ ] Invoice history shows all past invoices
- [ ] Download invoice opens PDF in new tab
- [ ] Cancel flow requires confirmation
- [ ] Reactivation available for canceled subscriptions

---

### **TIER 4: Nice-to-Haves & Delight Features (Week 10+)**

#### **4.1 Living Canvas Premium Gating** ⭐️⭐️
**Priority**: LOW-MEDIUM
**Effort**: 2 days

**Current State**: Living Canvas is available to all users (unclear if intended)

**Solution**: Gate Living Canvas downloads behind Creator+ tier
- Free/Anonymous: Can see demo but can't download
- Creator/Plus/Pro: Full download access
- Show upgrade modal when free user clicks download

---

#### **4.2 Batch Preview Generation** ⭐️⭐️
**Priority**: LOW
**Effort**: 3 days

**Use Case**: Generate multiple styles at once (Plus/Pro)

**Solution**:
- "Generate All" button in studio
- Queue-based generation (3 concurrent max)
- Progress indicator showing X/Y complete
- Costs N tokens upfront

---

#### **4.3 Style Favorites & Custom Collections** ⭐️⭐️
**Priority**: LOW
**Effort**: 3 days

**Solution**:
- Star icon on style cards → save to favorites
- "Favorites" filter in studio sidebar
- Create custom collections: "Client Work", "Portraits", etc.
- Drag-and-drop organization

---

#### **4.4 Advanced Analytics Dashboard** ⭐️⭐️
**Priority**: LOW
**Effort**: 5 days

**Solution**:
- `/account/analytics` page showing:
  - Most popular styles (usage heatmap)
  - Orientation preferences
  - Time-of-day usage patterns
  - Month-over-month growth
  - Predicted quota needs

---

#### **4.5 Email Digest & Monthly Reports** ⭐️⭐️
**Priority**: LOW
**Effort**: 4 days

**Solution**:
- Monthly email: "Your October Art Summary"
- Shows: Tokens used, styles explored, top creation
- Includes referral link for bonus tokens
- Tier recommendation if usage is high

---

## 🏆 Recommended Implementation Order

### **Sprint 1 (Week 1): Token UX Foundation**
1. Token UX consistency (1.1) – 2 days
2. Token warning banner (1.3) – 2 days
3. Hard gate modal (1.2) – 4 days

**Goal**: Fix immediate user confusion, add proactive warnings

---

### **Sprint 2 (Week 2): Transparency & Trust**
1. Token history page (1.4) – 5 days

**Goal**: Build user trust through full transparency

---

### **Sprint 3 (Week 3-4): Retention Core**
1. Persistent gallery (2.1) – 7 days

**Goal**: Make Wondertone sticky, enable return visits

---

### **Sprint 4 (Week 5): Revenue Optimization**
1. Billing lifecycle polish (2.2) – 3 days
2. Smart tier recommendations (2.3) – 4 days

**Goal**: Improve conversion and reduce churn

---

### **Sprint 5 (Week 6): Professional Features**
1. Profile management (2.4) – 4 days

**Goal**: Professional UX, reduce checkout friction

---

### **Sprint 6+ (Week 7-10): Scale & Growth**
1. Referral program (3.1) – 5 days
2. Collaborative workspaces (3.2) – 8 days
3. In-app billing (3.3) – 3 days

**Goal**: Enable B2B, drive viral growth

---

## 📊 Expected Business Impact

### **After Sprint 1-2 (Token UX + History)**
- **Support tickets**: -40% ("where did my tokens go?")
- **Trust score**: +35% (NPS improvement)
- **Upgrade conversion**: +2x (hard gate modal)

### **After Sprint 3 (Gallery)**
- **Return visits**: +3x (users come back to view gallery)
- **Print orders**: +2x (re-order from gallery)
- **Session duration**: +150% (browsing past creations)

### **After Sprint 4-5 (Revenue + Profile)**
- **Optimal tier selection**: +25% (smart recommendations)
- **Involuntary churn**: -15% (billing polish)
- **Checkout abandonment**: -20% (saved shipping info)

### **After Sprint 6+ (Growth)**
- **Organic acquisition**: +15-25% (referral program)
- **B2B revenue**: +20% ARPU (workspaces)
- **LTV**: +40% (all improvements combined)

---

## 🐛 Critical Bugs to Fix

### **1. Navigation Token Badge Calculation Mismatch**
**Location**: [FounderNavigation.tsx:62-71](src/components/navigation/FounderNavigation.tsx#L62-L71)
**Issue**: Uses `generationLimit - generationCount` instead of `entitlements.remainingTokens`
**Impact**: Badge shows incorrect count after token deduction
**Fix**: Replace calculation with `entitlements.remainingTokens`

### **2. ENABLE_AUTO_PREVIEWS Flag**
**Location**: [useFounderStore.ts:20](src/store/useFounderStore.ts#L20)
**Issue**: Currently set to `false` (testing mode)
**Impact**: Previews don't auto-generate in production
**Fix**: Change to `true` or make environment-dependent

### **3. Entitlement Hydration Race Condition**
**Location**: [useFounderStore.ts:676-678](src/store/useFounderStore.ts#L676-L678)
**Issue**: Preview generation sometimes starts before entitlements loaded
**Impact**: Occasional "Unable to verify preview allowance" errors
**Fix**: Add loading guard in `startStylePreview`, block until `entitlements.status === 'ready'`

---

## 🔧 Technical Debt Priorities

1. **Standardize token display logic** (create `useTokenBalance()` hook)
2. **Add error boundary coverage** around Studio and Gallery
3. **Improve preview cache invalidation** on orientation changes
4. **Add retry logic** for failed entitlement hydration
5. **Create shared modal management system** (replace ad-hoc state)
6. **Add loading skeletons** for all async data fetches
7. **Optimize bundle size** (code-split gallery/usage pages)

---

## 📝 Notes for Future Claude Sessions

### **State Management Reminders**:
- `entitlements.remainingTokens` is SOURCE OF TRUTH (server-side)
- `generationCount` is CLIENT-SIDE and can drift (don't rely on it)
- Always use `canGenerateMore()` before preview attempts
- `updateEntitlementsFromResponse()` syncs after each generation

### **Key Files Map**:
- Token logic: `useFounderStore.ts` (lines 676-878)
- Preview generation: `stylePreviewApi.ts`, `founderPreviewGeneration.ts`
- Entitlements API: `entitlementsApi.ts`
- Database schema: `supabase/migrations/20251015090000_entitlements.sql`
- Edge functions: `supabase/functions/generate-style-preview/`

### **Testing Checklist**:
- [ ] Test as anonymous user (5 token soft gate, 10 hard gate)
- [ ] Test as free user (10 token monthly limit)
- [ ] Test as Creator user (50 tokens, no watermark)
- [ ] Test tier upgrade flow end-to-end
- [ ] Test token refresh on period rollover
- [ ] Verify token counts match across Nav + Studio

---

## 🎯 Success Metrics to Track

### **User Engagement**:
- Token usage rate (avg tokens/user/month)
- Gallery visit frequency
- Usage page visits
- Return visit rate

### **Conversion Metrics**:
- Quota exhaustion → upgrade conversion rate
- Free → Creator conversion (target: 8-12%)
- Creator → Plus upgrade rate (target: 5-8%)
- Hard gate modal CTA click rate (target: 25%+)

### **Retention Metrics**:
- 7-day retention rate
- 30-day retention rate
- Gallery saves per user
- Download frequency

### **Revenue Metrics**:
- MRR growth
- ARPU by tier
- Churn rate (target: <5% monthly)
- Upgrade velocity

---

_This roadmap is a living document. Update as priorities shift or new opportunities emerge. Always maintain the "world's smartest AI art company" north star._

**Next Session Focus**: Sprint 1 - Token UX Foundation
**First Task**: Fix navigation token badge calculation mismatch
