Complete Flow Map with Timing & States
┌─────────────────────────────────────────────────────────────────────┐
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STATE 1: PRODUCT PAGE - UPLOAD INTERFACE                           │
│ Route: /product                                                     │
│ Time: 0:02 (2 seconds from homepage load)                          │
│ Auth: NONE REQUIRED                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Header: "Step 1: Upload & Choose Your Style"                      │
│  Subtext: "Transform your photo in seconds - no account needed"    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UPLOAD DROPZONE (centered, prominent)                       │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │                                                         │  │  │
│  │  │          [📸 Upload Icon]                               │  │  │
│  │  │                                                         │  │  │
│  │  │     Drag & drop your photo here                        │  │  │
│  │  │     or click to browse                                 │  │  │
│  │  │                                                         │  │  │
│  │  │     PNG or JPG • Max 10MB                              │  │  │
│  │  │                                                         │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Or use camera 📷 (mobile only)                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Example transformations (3 before/after pairs, pre-rendered):     │
│  [Hover to see style switch instantly]                             │
│                                                                     │
│  USER ACTION: Uploads photo (file or drag-drop)                    │
│  SYSTEM ACTION:                                                    │
│    1. Validate file (size, format)                                 │
│    2. Generate data URI                                            │
│    3. Auto-detect orientation via ML                               │
│    4. IMMEDIATELY transition to STATE 2                            │
│  TIMING: <1 second validation → instant transition                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STATE 2: CROPPER INTERFACE (Auto-Opens)                            │
│ Route: /product (same page, modal/overlay)                         │
│ Time: 0:03 (1 second after upload)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FULL-SCREEN OVERLAY (dark backdrop, 80% opacity)                  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  "Perfect your framing"                                      │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │                                                         │  │  │
│  │  │    [Uploaded photo with crop overlay]                  │  │  │
│  │  │    React-easy-crop component                           │  │  │
│  │  │                                                         │  │  │
│  │  │    Pinch/zoom/drag enabled                             │  │  │
│  │  │                                                         │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Orientation selector (auto-selected based on detection):    │  │
│  │  ○ Portrait  ● Square  ○ Landscape                           │  │
│  │                                                               │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────────┐  │  │
│  │  │ Back            │  │ Continue with Cropped Photo →    │  │  │
│  │  └─────────────────┘  └──────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  USER ACTION: Adjusts crop, selects orientation, clicks Continue   │
│  SYSTEM ACTION:                                                    │
│    1. Generate cropped image (canvas operation, client-side)       │
│    2. Store: uploadedImage, selectedOrientation                    │
│    3. IMMEDIATELY start preview generation (background)            │
│    4. Transition to STATE 3                                        │
│  TIMING: <500ms crop processing → instant transition               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STATE 3: STYLE SELECTION - INTELLIGENT LOADING                     │
│ Route: /product                                                     │
│ Time: 0:05 (2 seconds after crop complete)                         │
│ Background: PREVIEW GENERATION STARTED                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Header disappears, replaced with:                                 │
│  "Your photo is being transformed..."                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MAIN CANVAS PREVIEW (center, large)                         │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │                                                         │  │  │
│  │  │    [User's cropped photo with blur effect]             │  │  │
│  │  │                                                         │  │  │
│  │  │    Shimmer overlay animation                           │  │  │
│  │  │    "✨ Creating your masterpiece..."                   │  │  │
│  │  │                                                         │  │  │
│  │  │    Progress: ▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 60%                   │  │  │
│  │  │                                                         │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Below preview: Style grid (6 cards, 2 rows × 3 cols)              │
│                                                                     │
│  STYLE CARDS (showing placeholders initially):                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                              │
│  │ ⭐      │ │         │ │         │  Row 1: Recommended           │
│  │ Water-  │ │ Classic │ │ Modern  │  (based on photo analysis)    │
│  │ color   │ │ Oil     │ │ Pastel  │                               │
│  │ Dreams  │ │ Paint   │ │ Bliss   │  [Shimmer loading state]      │
│  │ LOADING │ │ LOADING │ │ LOADING │                               │
│  └─────────┘ └─────────┘ └─────────┘                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                              │
│  │ Charcoal│ │ Abstract│ │ Pop Art │  Row 2: Other popular         │
│  │ Sketch  │ │ Fusion  │ │         │                               │
│  │ LOADING │ │ LOADING │ │ LOADING │                               │
│  └─────────┘ └─────────┘ └─────────┘                              │
│                                                                     │
│  SYSTEM BACKGROUND PROCESS (parallel):                             │
│    1. Intelligent recommendation engine analyzes photo             │
│       (colors, content, composition) → 3 recommended styles        │
│    2. Generate preview for TOP recommendation (Watercolor Dreams)  │
│       API call: generateAndWatermarkPreview()                      │
│    3. Generate previews for 2nd & 3rd recommendations (parallel)   │
│    4. As EACH preview completes → update card, animate reveal      │
│                                                                     │
│  TIMING TARGETS:                                                   │
│    - 0:08 (3s from STATE 3 entry): First preview ready             │
│    - 0:10 (5s): Second preview ready                               │
│    - 0:12 (7s): Third preview ready                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STATE 3A: FIRST PREVIEW REVEAL (THE "WOW" MOMENT)                  │
│ Route: /product                                                     │
│ Time: 0:08 (8 seconds from upload click)                           │
│ Critical Conversion Moment: 40% of purchase decisions happen here  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ANIMATION SEQUENCE (1.2 seconds total):                           │
│    1. Blur clears from canvas (0-400ms)                            │
│    2. Preview scales in with bounce (400-800ms)                    │
│    3. Subtle confetti burst (800-1000ms)                           │
│    4. Success checkmark appears (1000-1200ms)                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MAIN CANVAS PREVIEW                                         │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │                                                         │  │  │
│  │  │    [AI-GENERATED WATERCOLOR PREVIEW]                   │  │  │
│  │  │    Full resolution, watermarked                        │  │  │
│  │  │    Scale: 1.0, opacity: 1.0                            │  │  │
│  │  │                                                         │  │  │
│  │  │    Watermark: "WONDERTONE" diagonal, 20% opacity       │  │  │
│  │  │                                                         │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  "Watercolor Dreams" - ✓ Created                              │  │
│  │  [💖 Love it] [👁️ View Fullscreen]                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Style grid updates:                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                              │
│  │ ⭐ ✓    │ │ Classic │ │ Modern  │                              │
│  │ [READY] │ │ Oil     │ │ Pastel  │  First card shows preview     │
│  │ Water-  │ │ Paint   │ │ Bliss   │  with purple border (selected)│
│  │ color   │ │ LOADING │ │ LOADING │  Others still generating      │
│  │ Dreams  │ │ 73%... │ │ 45%... │                              │
│  └─────────┘ └─────────┘ └─────────┘                              │
│                                                                     │
│  MODAL APPEARS (2 seconds after preview reveal):                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ✨ Want to See It in Your Space?                            │  │
│  │                                                               │  │
│  │  [QR Code] ← Scan with your phone                            │  │
│  │                                                               │  │
│  │  View this artwork on your wall using AR                     │  │
│  │  No app required - instant preview                           │  │
│  │                                                               │  │
│  │  [Maybe Later]  [Show Me →]                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  USER ACTIONS (multiple paths):                                    │
│    Path A: Scan QR for AR → STATE 3B (AR Preview)                 │
│    Path B: Dismiss AR modal → Stay in STATE 3A                    │
│    Path C: Click different style card → Regenerate preview        │
│    Path D: Click "Continue" (appears in bottom bar) → STATE 4     │
│                                                                     │
│  BOTTOM BAR APPEARS (5 seconds after first preview, fades in):     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Watercolor Dreams • Square • From $89                       │  │
│  │  [Continue to Customize →]                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ (Path D: User clicks Continue)
┌─────────────────────────────────────────────────────────────────────┐
│ STATE 4: STUDIO WORKSPACE - UNIFIED CUSTOMIZATION                  │
│ Route: /product (same page, layout transforms)                     │
│ Time: 0:15 (7 seconds user viewing preview + interaction)          │
│ Header: "Customize Your Canvas"                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LAYOUT: Three-column (on desktop)                                 │
│                                                                     │
│  ┌─────────┬──────────────────────────────────┬─────────────────┐  │
│  │ LEFT    │ CENTER (60% width)               │ RIGHT           │  │
│  │ SIDEBAR │                                  │ SIDEBAR         │  │
│  │ (20%)   │                                  │ (20%)           │  │
│  ├─────────┼──────────────────────────────────┼─────────────────┤  │
│  │         │  LIVE CANVAS PREVIEW             │                 │  │
│  │ Styles  │  ┌────────────────────────────┐  │  Canvas Size    │  │
│  │ ────    │  │                            │  │  ────────       │  │
│  │         │  │  [Current AI Preview]      │  │  ● 8×10"        │  │
│  │ [Water] │  │                            │  │    $49          │  │
│  │ [Oil]   │  │  Updates in real-time as   │  │                 │  │
│  │ [Pastel]│  │  user changes size/frame   │  │  ○ 12×16"       │  │
│  │ [Char.] │  │                            │  │    $89          │  │
│  │ [Abs.]  │  │  Aspect ratio: Square      │  │                 │  │
│  │ [Pop]   │  │  (from orientation)        │  │  ○ 16×20"       │  │
│  │         │  │                            │  │    $129         │  │
│  │ [More]  │  └────────────────────────────┘  │                 │  │
│  │         │                                  │  ○ 20×24"       │  │
│  │ Collapse│  "Watercolor Dreams"             │    $169         │  │
│  │ [◄]     │  Square Canvas                   │                 │  │
│  │         │                                  │  Frame Options  │  │
│  │         │  [Recrop Photo]                  │  ────────       │  │
│  │         │  [View Fullscreen]               │  Floating Frame │  │
│  │         │                                  │  ☐ Enable +$29  │  │
│  │         │                                  │                 │  │
│  │         │                                  │  If enabled:    │  │
│  │         │                                  │  ○ White        │  │
│  │         │                                  │  ○ Black        │  │
│  │         │                                  │  ○ Espresso     │  │
│  │         │                                  │                 │  │
│  │         │                                  │ Living Memory   │  │
│  │         │                                  │ ─────────       │  │
│  │         │                                  │ ☐ Add AR Video  │  │
│  │         │                                  │   +$59.99       │  │
│  │         │                                  │                 │  │
│  │         │                                  │ [🎥 See Demo]   │  │
│  │         │                                  │                 │  │
│  │         │                                  │ AI Upscale      │  │
│  │         │                                  │ ──────────      │  │
│  │         │                                  │ ☐ Ultra HD      │  │
│  │         │                                  │   +$9.00        │  │
│  └─────────┴──────────────────────────────────┴─────────────────┘  │
│                                                                     │
│  BOTTOM BAR (sticky, always visible):                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Subtotal: $89.00                                            │  │
│  │  Free shipping on orders over $75 ✓                          │  │
│  │                                                               │  │
│  │  [← Back to Styles]  [Continue to Checkout →]                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  MOBILE LAYOUT (stacked):                                          │
│    - Preview on top (full width)                                   │
│    - Options below (accordion sections)                            │
│    - Bottom bar sticky                                             │
│                                                                     │
│  USER INTERACTIONS:                                                │
│    1. Change size → Price updates, preview stays same             │
│    2. Toggle frame → Visual frame overlays on preview             │
│    3. Enable Living Memory → Modal with demo video opens          │
│    4. Click "See Demo" → AR demo modal (QR code + video)          │
│    5. All changes reflected in bottom bar total                   │
│                                                                     │
│  LIVING MEMORY DEMO MODAL (if user clicks):                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Make Your Canvas Come Alive                                 │  │
│  │                                                               │  │
│  │  [Embedded video: 15 seconds]                                │  │
│  │  Shows person scanning canvas → video plays in AR            │  │
│  │                                                               │  │
│  │  How it works:                                               │  │
│  │  1. Upload a special video (wedding, birthday, etc.)         │  │
│  │  2. We generate a unique QR code for your canvas             │  │
│  │  3. Scan with any phone → video plays over the artwork       │  │
│  │                                                               │  │
│  │  ⭐ 847 people added Living Memory this week                  │  │
│  │                                                               │  │
│  │  Regular price: $59.99                                       │  │
│  │  Add now: $49.99 (save $10)                                  │  │
│  │                                                               │  │
│  │  [No Thanks]  [Add to My Canvas - $49.99]                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  USER ACTION: Clicks "Continue to Checkout"                        │
│  VALIDATION: Size must be selected (auto-default to 8×10)          │
│  TRANSITION: → STATE 5                                             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STATE 5: CHECKOUT - GUEST-FIRST FLOW                               │
│ Route: /product (checkout section revealed)                        │
│ Time: 0:45 (30 seconds in customization)                           │
│ Header: "Complete Your Order"                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  LAYOUT: Two-column                                                │
│                                                                     │
│  ┌──────────────────────────────┬──────────────────────────────┐   │
│  │ LEFT (60%)                   │ RIGHT (40%)                  │   │
│  │ Order Form                   │ Order Summary                │   │
│  ├──────────────────────────────┼──────────────────────────────┤   │
│  │                              │  Your Artwork                │   │
│  │ Guest Checkout               │  ┌────────────────────────┐  │   │
│  │ ──────────────               │  │ [Preview thumbnail]    │  │   │
│  │                              │  │ 200×200px              │  │   │
│  │ Email *                      │  └────────────────────────┘  │   │
│  │ ┌─────────────────────────┐  │                              │   │
│  │ │ your@email.com          │  │  Watercolor Dreams          │   │
│  │ └─────────────────────────┘  │  12×16" Square Canvas       │   │
│  │ For order confirmation       │  $89.00                      │   │
│  │                              │                              │   │
│  │ Shipping Address             │  Customizations:             │   │
│  │ ────────────────             │  • Floating Frame (Black)    │   │
│  │ Full Name *                  │    +$29.00                   │   │
│  │ ┌─────────────────────────┐  │  • Living Memory AR          │   │
│  │ │                         │  │    +$49.99 (saved $10!)      │   │
│  │ └─────────────────────────┘  │                              │   │
│  │                              │  ──────────────────────      │   │
│  │ Address Line 1 *             │  Subtotal: $167.99           │   │
│  │ ┌─────────────────────────┐  │  Shipping: FREE              │   │
│  │ │                         │  │  Tax: $13.44 (est.)          │   │
│  │ └─────────────────────────┘  │                              │   │
│  │                              │  ──────────────────────      │   │
│  │ City, State, ZIP *           │  Total: $181.43              │   │
│  │ ┌────────┬─────┬─────────┐  │                              │   │
│  │ │        │ ST  │         │  │  ┌────────────────────────┐  │   │
│  │ └────────┴─────┴─────────┘  │  │ Complete Order         │  │   │
│  │                              │  │ $181.43                │  │   │
│  │ ─────────────────────────    │  └────────────────────────┘  │   │
│  │                              │                              │   │
│  │ ☐ Create account for 10% off│  🔒 Secure checkout         │   │
│  │   (optional)                 │  Powered by Stripe           │   │
│  │                              │                              │   │
│  │ If checked:                  │  💳 30-day money-back       │   │
│  │ Password: [______________]   │     guarantee                │   │
│  │                              │                              │   │
│  │ ─────────────────────────    │  Need digital too?          │   │
│  │                              │  Add HD download for $14.99  │   │
│  │ Payment                      │  [Add Digital Download]      │   │
│  │ ───────                      │                              │   │
│  │ [Stripe Payment Element]     │                              │   │
│  │ • Card                       │                              │   │
│  │ • Apple Pay / Google Pay     │                              │   │
│  │                              │                              │   │
│  │ ┌─────────────────────────┐  │                              │   │
│  │ │ Place Order →           │  │                              │   │
│  │ └─────────────────────────┘  │                              │   │
│  │                              │                              │   │
│  │ By placing order you agree   │                              │   │
│  │ to Terms of Service          │                              │   │
│  └──────────────────────────────┴──────────────────────────────┘   │
│                                                                     │
│  MOBILE: Stacked layout, order summary collapses to expandable     │
│                                                                     │
│  SYSTEM VALIDATIONS:                                               │
│    1. Email format validation (real-time)                          │
│    2. Address validation via Stripe                                │
│    3. Payment processing via Stripe Checkout                       │
│                                                                     │
│  USER ACTION: Clicks "Place Order"                                 │
│  BACKEND PROCESS:                                                  │
│    1. Create Stripe payment intent                                 │
│    2. If account created: Register user in Supabase Auth           │
│    3. Store order in database (orders table)                       │
│    4. Associate AI preview with order (previews table)             │
│    5. If Living Memory selected: Create pending AR video record    │
│    6. Send confirmation email                                      │
│                                                                     │
│  SUCCESS: → STATE 6                                                │
│  FAILURE: Show error inline, allow retry                           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STATE 6: ORDER CONFIRMATION                                         │
│ Route: /product/success?order_id=xxx                               │
│ Time: 1:15 (30 seconds in checkout)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ✓ Order Confirmed!                                          │  │
│  │                                                               │  │
│  │  Order #WT-12847                                             │  │
│  │  Confirmation sent to: your@email.com                        │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ [Your AI artwork preview]                              │  │  │
│  │  │ Large display                                          │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  What happens next:                                          │  │
│  │  1. ✓ Your artwork is in production                          │  │
│  │  2. 📦 Ships within 5-7 business days                        │  │
│  │  3. 🚚 Tracking number sent to your email                    │  │
│  │                                                               │  │
│  │  If you selected Living Memory AR:                           │  │
│  │  → Check your email for video upload instructions            │  │
│  │                                                               │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ [Download Digital Preview Now]                         │  │  │
│  │  │ Watermarked version for sharing                        │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Create your account to track this order:                    │  │
│  │  [Activate My Account] (if not created during checkout)      │  │
│  │  → Sends magic link to email                                 │  │
│  │                                                               │  │
│  │  ─────────────────────────────────────────────────────       │  │
│  │                                                               │  │
│  │  Want to upgrade to HD digital download?                     │  │
│  │  Get the watermark-free version for printing                 │  │
│  │                                                               │  │
│  │  [Purchase HD Download - $24.99]                             │  │
│  │  (Higher price than pre-purchase bundle)                     │  │
│  │                                                               │  │
│  │  Or upgrade to canvas + digital bundle for $14.99 more       │  │
│  │  [Add Digital Bundle]                                        │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  [← Create Another Masterpiece]  [View Order Details]              │
│                                                                     │
│  ANALYTICS EVENTS FIRED:                                           │
│    - purchase (order_id, total, items, living_memory_added)        │
│    - conversion_complete (time_from_upload, style_id, size)        │
│                                                                     │
│  EMAIL TRIGGERED:                                                  │
│    - Order confirmation with order details                         │
│    - If Living Memory: AR video upload instructions                │
│    - If no account: Magic link for account activation              │
└─────────────────────────────────────────────────────────────────────┘
Alternative User Paths & Edge Cases
Path B: User Changes Style Mid-Flow
STATE 3A (First preview shown) →
User clicks different style card →
  ↓
STATE 3C: PREVIEW REGENERATION
  - Main canvas shows selected style's placeholder
  - "Generating [Style Name]..." loading state
  - If preview already cached: Instant display (200ms fade)
  - If not cached: Generate new preview (8-12 seconds)
  - Previous style card becomes unselected (gray border)
  - New style card gets purple border (selected)
  ↓
Returns to STATE 3A with new preview
Path C: User Tries AR Preview
STATE 3A (AR modal appears) →
User scans QR code with phone →
  ↓
STATE 3B: AR EXPERIENCE (Mobile Browser)
  - Opens camera on user's phone
  - AR view overlays canvas preview on detected wall
  - User can move phone to see different sizes
  - "Tap to see it larger" interactive resize
  - "Order This Size" button → Deeplink back to desktop session
    (Sets size based on AR preview selected)
  ↓
User returns to desktop/continues on mobile →
Resumes STATE 4 (Studio) with AR-selected size pre-filled
Path D: User Has Slow Preview Generation (>15 seconds)
STATE 3 (Waiting for first preview) →
15 seconds elapsed, no preview yet →
  ↓
STATE 3D: SLOW GENERATION FALLBACK
  - Progress bar shows 85%
  - Text updates: "This is taking a bit longer – great art takes time 😉"
  - "Meanwhile, explore our styles" → Show style samples grid
  - If 30 seconds: Offer manual retry button
  - If 45 seconds: Show error message + support contact
  ↓
When preview completes → Interrupt with celebration animation
Returns to STATE 3A
Path E: Returning User With Account
Homepage → Clicks CTA →
  ↓
IF user has session cookie (authenticated):
  - STATE 1 shows: "Welcome back, [Name]!"
  - "Start fresh" or "Continue your last project"
  - If continue → Load saved uploadedImage, selectedStyle from database
  - Skip directly to STATE 4 (Studio) with previous state restored
ELSE:
  - Normal flow (STATE 1: Upload)
Critical Timing Benchmarks
Milestone	Target Time	Critical Success Factor
Homepage → Upload interface	0:02	Instant navigation, no auth wall
Upload → Cropper	0:03	<1s file validation
Crop → Style selection	0:05	Instant transition, generation starts in background
First Preview Reveal	0:08	THE WOW MOMENT - Most critical timing
2nd & 3rd Previews	0:10-0:12	Progressive enhancement, not required
AR Modal Appears	0:10	2s after first preview (emotional peak)
Bottom Bar Fades In	0:13	5s after first preview (user has absorbed)
User Clicks Continue	0:15	Average viewing time before decision
Studio/Customization	0:15-0:45	30s average exploration time
Checkout Form	0:45-1:15	30s form completion (with autofill)
Order Placed	1:15	Total journey: <90 seconds for fast users
Median User Journey: 2-3 minutes (upload → preview → customize → checkout) Fast Path: 75 seconds (upload → continue → checkout with defaults) Exploratory Path: 5-8 minutes (tries multiple styles, AR preview, reads Living Memory details)
State Management Requirements
Global State (Context/Zustand Store)
interface ProductFlowState {
  // Step 1: Upload & Style
  uploadedImage: string | null;           // Data URI
  originalImage: string | null;           // Before crop
  selectedOrientation: 'portrait' | 'square' | 'landscape';
  selectedStyle: { id: number; name: string } | null;
  
  // Step 2: Customization (merged with checkout in UI)
  selectedSize: '8x10' | '12x16' | '16x20' | '20x24';
  floatingFrame: { enabled: boolean; color: 'white' | 'black' | 'espresso' };
  livingMemory: boolean;
  aiUpscale: boolean;
  
  // Preview Generation
  previewUrls: { [styleId: number]: string };  // Cached previews
  isGenerating: boolean;
  generationErrors: { [styleId: number]: string };
  autoGenerationComplete: boolean;
  
  // Checkout
  email: string;
  shippingAddress: Address | null;
  
  // Analytics
  uploadTimestamp: number;
  firstPreviewTimestamp: number | null;
  
  // Actions
  setUploadedImage: (img: string) => void;
  setSelectedStyle: (style: {id: number, name: string}) => void;
  generatePreview: (styleId: number) => Promise<void>;
  // ... other actions
}
URL State (Query Params for Shareability)
/product?style=watercolor&orientation=square&size=12x16

Allows users to share configured link:
"Check out my art preview!" → Opens with pre-selected options
Technical Implementation Notes Per State
STATE 1: Upload Interface
Component: PhotoUploadContainer.tsx
File validation: Client-side (size <10MB, type: image/jpeg|png)
Performance: Lazy load react-easy-crop until needed
Mobile: Use capture="environment" for camera input
Analytics: Fire upload_started event
STATE 2: Cropper
Component: PhotoCropperSection.tsx
Library: react-easy-crop (already in dependencies)
Orientation detection: detectOrientationFromImage() utility
Canvas operation: Client-side crop, generate new data URI
Exit: Store cropped image, trigger preview generation
STATE 3: Style Selection & Preview
Components:
IntelligentStyleGrid.tsx (style cards)
StyleCard.tsx (individual cards)
usePreviewGeneration.ts (generation logic)
API: generateAndWatermarkPreview() → Supabase Edge Function
Polling: pollPreviewStatusUntilReady() with 2s intervals
Caching: Check previewUrls state before generating
Concurrency: Queue management for parallel generations
STATE 3A: Preview Reveal
Animation: Framer Motion or CSS keyframes
Watermarking: watermarkManager.addWatermark() client-side
Modal: AR prompt (dismissible, localStorage to avoid re-showing)
Bottom Bar: Fixed position, z-index above content
STATE 4: Studio Workspace
Components:
Main canvas: Preview display with aspect ratio container
CanvasConfigurationStep.tsx (size selector)
CustomizationStep.tsx (frame, AR, upscale options)
Live Preview: Update frame overlay via CSS (no regeneration needed)
Price Calculation: Real-time update in bottom bar
Living Memory Modal: Video demo (lazy load video file)
STATE 5: Checkout
Components:
ReviewOrderStep.tsx (order summary)
OrderActions.tsx (payment CTA)
Stripe Integration: useStripePayment.ts hook
Payment Element: Stripe.js embedded (lazy loaded at this state)
Validation: Real-time email/address validation
Guest Checkout: Optional account creation checkbox
STATE 6: Confirmation
Component: Success page
Email: Triggered via Supabase Edge Function
Database: Order record created, associated with user (if account)
Upsells: Digital download, account creation
Sharing: Generate shareable link to preview
Mobile-Specific Adaptations
STATE 1-2: Upload & Crop
Single column layout
Larger touch targets (min 44px)
Cropper gestures: pinch-zoom native support
STATE 3-4: Preview & Studio
Stack layout (no sidebars)
Style grid: 2×3 on mobile (vs 3×2 desktop)
Bottom bar sticky (always visible)
Accordions for options (collapsed by default)
STATE 5: Checkout
Single column form
Order summary collapsible (expanded by default)
Stripe mobile-optimized payment element
Apple Pay / Google Pay prominent
This is my exact recommended flow. The key principles:
No auth barriers until checkout (guest-first)
Instant transitions between states (<1s)
First preview in <10 seconds (the critical metric)
Progressive disclosure (don't show all options at once)
Persistent conversion path (bottom bar after first preview)
AR as emotional amplifier (shown at peak engagement)
Mobile-first design (50%+ traffic will be mobile)
What aspects would you like me to elaborate on?