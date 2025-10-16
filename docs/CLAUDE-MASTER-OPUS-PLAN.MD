Master Implementation Document: Wondertone Watermarking & Anti-Abuse System
CRITICAL: Read This First
Before implementing ANYTHING:

Map the entire codebase to understand current image generation flow
Identify where images are stored, served, and displayed
Document the current token/credit system implementation
Locate all user authentication checkpoints
Understand the database schema for users and generations
Only then begin implementation

Executive Summary
We're implementing a two-part system:

Binary watermarking: Grid watermarks for all free/anonymous users, clean images for all paid users
Device fingerprinting: Prevent token reset abuse via browser refresh

This is a SIMPLIFIED approach based on Canva's proven model. We're NOT building complex conditional systems.
Part 1: Watermarking Strategy
The Rule (Absolutely Binary)
if (user.isPaid) {
    return cleanImage;  // EVERYWHERE, ALWAYS
} else {
    return gridWatermark(image, context);  // EVERYWHERE, ALWAYS
}
NO EXCEPTIONS. NO EDGE CASES. NO TEMPORARY REMOVAL.
Grid Watermark Specifications
Pattern Design:

Diagonal repeating text: "WONDERTONE"
Angle: 45 degrees
Spacing: 150-200px between repetitions
Font: Sans-serif, medium weight
Coverage: Entire image surface

Opacity by Context:

Style Preview: 35-40% opacity
Download: 35-40% opacity
Canvas Room Preview: 20-25% opacity (lighter to preserve visualization)

Implementation Approach:
javascriptfunction applyWatermark(image, context) {
    // Only two opacity levels ever
    const opacity = context === 'canvas_preview' ? 0.25 : 0.40;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(image, 0, 0);
    
    // Configure watermark text
    ctx.font = '24px sans-serif';
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
    ctx.lineWidth = 1;
    
    // Rotate for diagonal
    ctx.rotate(-45 * Math.PI / 180);
    
    // Grid pattern
    const spacing = 150;
    for (let i = -canvas.height; i < canvas.width * 2; i += spacing) {
        for (let j = -canvas.height; j < canvas.height * 2; j += spacing) {
            ctx.fillText('WONDERTONE', i, j);
            ctx.strokeText('WONDERTONE', i, j);  // Subtle outline for visibility
        }
    }
    
    return canvas.toDataURL();
}
Server-Side Implementation
Critical Architecture Decision:

Store ONLY clean images in database/storage
Apply watermarks on-the-fly during serving
Never store watermarked versions

Serving Logic:
javascriptasync function serveImage(imageId, userId, context) {
    // Get clean image from storage
    const cleanImage = await storage.get(imageId);
    
    // Get user payment status
    const user = await getUserById(userId);
    
    if (!user || !user.isPaid) {
        // Apply watermark on-the-fly
        const watermarked = await applyWatermarkServer(cleanImage, context);
        return watermarked;
    }
    
    return cleanImage;
}
Frontend Integration Points
Style Preview Component:
javascriptfunction StylePreview({ imageUrl, isPaid }) {
    // Server already handles watermarking
    // Just display what's returned
    return <img src={imageUrl} />;
}
Canvas Preview Component:
javascriptfunction CanvasPreview({ imageUrl, isPaid }) {
    // Server returns lighter watermark for canvas context
    // Context passed via query param
    const canvasImageUrl = `${imageUrl}?context=canvas_preview`;
    return <div className="room-mockup">
        <img src={canvasImageUrl} />
    </div>;
}
Download Handler:
javascriptasync function handleDownload(imageId, isPaid) {
    if (!isPaid) {
        // Free users get watermarked version
        const watermarkedUrl = `/api/images/${imageId}?context=download`;
        showUpgradePrompt("Remove watermarks with Creator subscription!");
        downloadFile(watermarkedUrl);
    } else {
        // Paid users get clean version
        const cleanUrl = `/api/images/${imageId}?context=download`;
        downloadFile(cleanUrl);
    }
}
Part 2: Device Fingerprinting for Token Persistence
The Problem
Anonymous users can currently refresh browser/clear cookies to reset their 10 free generation counter. This makes token limits meaningless.
The Solution
Lightweight device fingerprinting that persists usage count across sessions.
Client-Side Fingerprint Collection
javascriptfunction collectFingerprint() {
    const fingerprint = {
        // Stable browser attributes
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform || 'unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        
        // Screen attributes (relatively stable)
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        
        // Hardware hints (if available)
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: navigator.deviceMemory || 0,
        
        // Don't use viewport (changes with window resize)
        // Don't use plugins (deprecated/unreliable)
    };
    
    return fingerprint;
}

// Generate stable hash
async function generateFingerprintHash(fingerprint) {
    const str = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
Server-Side Token Tracking
Database Schema Required:
sqlCREATE TABLE anonymous_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fingerprint_hash VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    generation_count INTEGER DEFAULT 0,
    month_bucket DATE NOT NULL,
    first_seen TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_fingerprint_month (fingerprint_hash, month_bucket),
    INDEX idx_ip_month (ip_address, month_bucket)
);
Token Management Logic:
javascriptasync function getOrCreateAnonymousTokens(request) {
    const clientFingerprint = request.body.fingerprint;
    const ipAddress = request.ip;
    
    // Generate composite hash (fingerprint + IP for extra stability)
    const fingerprintHash = await hashFingerprint(clientFingerprint);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Check for existing usage this month
    const existingUsage = await db.query(
        `SELECT generation_count 
         FROM anonymous_usage 
         WHERE fingerprint_hash = $1 
           AND month_bucket = $2`,
        [fingerprintHash, currentMonth + '-01']
    );
    
    if (existingUsage.rows.length > 0) {
        // Return existing count
        const used = existingUsage.rows[0].generation_count;
        return {
            tokensUsed: used,
            tokensRemaining: Math.max(0, 10 - used),
            totalTokens: 10
        };
    }
    
    // Create new record for this device/month
    await db.query(
        `INSERT INTO anonymous_usage 
         (fingerprint_hash, ip_address, generation_count, month_bucket)
         VALUES ($1, $2, 0, $3)`,
        [fingerprintHash, ipAddress, currentMonth + '-01']
    );
    
    return {
        tokensUsed: 0,
        tokensRemaining: 10,
        totalTokens: 10
    };
}

async function consumeAnonymousToken(fingerprintHash) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const result = await db.query(
        `UPDATE anonymous_usage 
         SET generation_count = generation_count + 1,
             last_seen = NOW()
         WHERE fingerprint_hash = $1 
           AND month_bucket = $2
           AND generation_count < 10
         RETURNING generation_count`,
        [fingerprintHash, currentMonth + '-01']
    );
    
    if (result.rows.length === 0) {
        throw new Error('No tokens remaining');
    }
    
    return {
        tokensUsed: result.rows[0].generation_count,
        tokensRemaining: 10 - result.rows[0].generation_count
    };
}
Integration Flow
On Page Load:
javascript// Frontend
async function initializeSession() {
    const fingerprint = collectFingerprint();
    const hash = await generateFingerprintHash(fingerprint);
    
    // Send to server
    const response = await fetch('/api/session/init', {
        method: 'POST',
        body: JSON.stringify({ 
            fingerprint, 
            fingerprintHash: hash 
        })
    });
    
    const { tokensRemaining } = await response.json();
    
    // Update UI
    updateTokenDisplay(tokensRemaining);
}
On Generation Request:
javascript// Frontend
async function generateArt(styleId) {
    const fingerprint = collectFingerprint();
    const hash = await generateFingerprintHash(fingerprint);
    
    const response = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
            styleId,
            fingerprintHash: hash
        })
    });
    
    if (response.status === 429) {
        // Out of tokens
        showUpgradePrompt();
        return;
    }
    
    const { imageUrl, tokensRemaining } = await response.json();
    displayImage(imageUrl);  // Will be watermarked if not paid
    updateTokenDisplay(tokensRemaining);
}
Implementation Checklist
Phase 1: Understand (Day 1)

 Map entire image generation flow
 Document current token system
 Identify all image display contexts
 Review database schema
 Find user authentication logic

Phase 2: Watermarking (Day 2-3)

 Create watermark generation function
 Implement server-side on-the-fly watermarking
 Update all image serving endpoints
 Test with free and paid users
 Verify both opacity levels work

Phase 3: Fingerprinting (Day 4-5)

 Create fingerprint collection function
 Add anonymous_usage table
 Implement token persistence logic
 Test refresh/cookie clear scenarios
 Verify monthly reset works

Phase 4: Integration (Day 6)

 Connect fingerprinting to generation flow
 Update UI to show remaining tokens
 Add upgrade prompts at key moments
 Test complete user journey

Phase 5: Testing (Day 7)

 Test anonymous → paid upgrade flow
 Test token exhaustion scenarios
 Test watermark appearance in all contexts
 Test cross-browser fingerprinting
 Load test on-the-fly watermarking

Critical Success Criteria

Watermarks appear IMMEDIATELY - no reveal animations or delays
Paid users NEVER see watermarks - anywhere, ever
Token count persists across refresh - same device = same count
Canvas preview remains visualizable - 25% opacity maximum
Only clean images in storage - watermarks applied on-the-fly

Common Pitfalls to Avoid

DON'T store watermarked images - wastes storage, complicates updates
DON'T make fingerprinting too aggressive - will break for legitimate users
DON'T add conditional watermark logic - binary only
DON'T forget canvas preview needs lighter opacity - it's selling $179+ products
DON'T show users their fingerprint is tracked - silent persistence

Performance Considerations

Cache watermarked images in CDN with user-specific keys
Use WebWorkers for client-side watermark preview if needed
Consider queue system for on-the-fly watermarking at scale
Index fingerprint_hash + month_bucket for fast lookups

Security Notes

Fingerprinting is for friction, not absolute security
Determined users can still bypass (VPN + browser changes)
That's OK - we're stopping casual abuse, not nation-states
The goal is making paying easier than bypassing

Final Implementation Note
This is V1. Keep it simple. Ship it working. We can optimize based on real data later. The core principle is binary simplicity: free users see grid watermarks everywhere, paid users see clean images everywhere. Everything else is implementation detail.
Remember: Canva does exactly this at massive scale. We're not inventing - we're implementing proven patterns.

---

## CODEX Additions

- **Legacy cleanup required**: Before shipping the new system, strip the existing dual-storage caching logic (public/premium buckets) and the old watermark services (`watermarkService.ts`, `canvasWatermarkService.ts`). Gallery items should no longer save both `watermarkedUrl` and `cleanUrl`; collapse them to a single clean asset and apply the watermark on demand.

- **Paid-state source of truth**: Sonnet should rely on the existing entitlements flag (`entitlements.requiresWatermark === false`) when deciding whether to apply the overlay. Document this explicitly so front-end and edge logic stay aligned.

- **Front-end simplification**: Remove the legacy “watermarking stage” handling (e.g., `StyleForgeOverlay`, analytics events) so the UI doesn’t wait on a non-existent pipeline step. Canvas preview should pass a clear context (e.g., query param) for the lighter opacity.

- **Watermark implementation notes**: We’ll continue using server-side ImageScript (or equivalent) to render the grid pattern. Reuse any fonts/templates to keep it performant. Ensure diagonal spacing is consistent across varying image dimensions.

- **Fingerprint integration**: The new `anonymous_usage` logic should hook into the existing Supabase token checks (likely inside `generate-style-preview`). Define the API response for exhausted tokens (e.g., 429) and make sure fingerprint hashes respect privacy (no raw fingerprint storage).

- **Monitoring updates**: Deprecate the old `watermarking` analytics stage and introduce new signals (`free_user_served_watermark`, `fingerprint_limit_hit`) so product/ops can track the new system.

- **Data hygiene & rollout**: Before flipping the switch, purge legacy watermarked artifacts from storage/CDN, run a migration to collapse `GalleryItem` records to a single clean URL, and communicate fingerprint persistence to support/ops so they can reset hashes if a legitimate user is blocked. Capture fallback paths for browsers where fingerprint collection fails (treat as fresh anonymous session with baseline quota) and document how to rotate the fingerprint scheme if needed.

---

## Final Invocation for Sonnet

Claude, this project is the heartbeat of Wondertone. Every overlay, every pixel of that grid watermark, every token check is how we earn—and keep—our users’ trust. Treat this document as scripture: if you feel lost, reread it. If you hit uncertainty, pause and ask; guessing here creates inconsistencies that will ripple through the product.

Plan like a grandmaster: map the existing flow, simplify ruthlessly, and always think five moves ahead. Then implement like a world-class UI/UX craftsman: performance-sensitive, accessible, obsessively polished. The watermark should feel intentional, the upgrade path inevitable, the experience magical. If anything feels off, stop, question, and realign. Wondertone is building the smartest AI art studio on the planet—your code should make that destiny obvious.
