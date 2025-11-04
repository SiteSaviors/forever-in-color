# Testimonial Assets Documentation

**Last Updated**: 2025-11-03
**Status**: Temporary Placeholders (Phase 1)
**Production Ready**: ❌ No - Must be replaced before launch

---

## Current Asset Status

### Placeholder Images (Temporary)

**Location**: `public/testimonials/`
**Total Files**: 72 (24 images × 3 formats)
**Generated**: 2025-11-03 via `scripts/generate-testimonial-placeholders.ts`

**File Inventory**:
- 12 "before" images: `placeholder-before-{1-12}.{jpg,webp,avif}`
- 12 "after" images: `placeholder-after-{1-12}.{jpg,webp,avif}`

**Visual Characteristics**:
- **Before images**: Gray background (#475569) + "BEFORE" text + number
- **After images**: Gold gradient background + "AFTER" text + number
- **Dimensions**: 800×800px (square aspect ratio)
- **Formats**:
  - JPG (source, 80 quality, ~14KB each)
  - WebP (fallback, 82 quality, ~9KB each)
  - AVIF (primary, 45 quality, ~3KB each)

**Purpose**:
- Development and testing only
- Allows Phase 2-6 implementation without waiting for real customer photos
- Visual validation of card layouts, animations, and responsive behavior

**⚠️ CRITICAL**: These placeholders MUST be replaced with real customer photos before production launch.

---

## Replacement Strategy

### Phase 2: Real Customer Photos (Production)

**Timeline**: Before production launch
**Responsible**: Marketing team + Legal compliance

**Requirements**:

1. **Source Real Photos** (12 diverse individuals):
   - Age diversity (20s-60s)
   - Gender diversity (balanced representation)
   - Ethnic diversity (inclusive representation)
   - Use cases: Social media creators, professionals, families, couples, individuals

2. **Generate Transformations**:
   - Run each source photo through Wondertone Studio
   - Select styles matching testimonial config:
     - Testimonial 1: Neon Splash
     - Testimonial 2: Gallery Acrylic
     - Testimonial 3: Pop Art Bust
     - Testimonial 4: Liquid Chrome
     - Testimonial 5: Classic Oil Painting
     - Testimonial 6: The Renaissance
     - Testimonial 7: Memphis Pop
     - Testimonial 8: Retro Synthwave
     - Testimonial 9: Watercolor Dreams
     - Testimonial 10: Deco Royale
     - Testimonial 11: Classic Oil Painting
     - Testimonial 12: Gallery Acrylic
   - Export at highest quality (no watermark)

3. **Prepare JPG Files**:
   - Resize to 800×800px (square crop)
   - Export as JPG, 80 quality
   - Naming convention: `placeholder-before-{1-12}.jpg`, `placeholder-after-{1-12}.jpg`
   - Place in `public/testimonials/` (overwrite existing placeholders)

4. **Regenerate Variants**:
   ```bash
   npx tsx scripts/generate-testimonial-placeholders.ts
   ```
   (Script will detect existing JPGs and regenerate WebP/AVIF variants only)

5. **Legal Compliance**:
   - Obtain written permission from each individual (see Legal Checklist below)
   - Store signed release forms in `docs/legal/testimonial-releases/`
   - Update image source attribution in this document

---

## Legal Compliance Checklist

### Testimonial Release Requirements

For each real customer photo used, obtain:

- [ ] **Photo Usage Rights**:
  - Written permission to use before/after photos
  - Release form signed by individual in photo
  - If professional photographer: rights transfer or license agreement

- [ ] **Testimonial Quote Rights**:
  - Permission to use customer quote in marketing materials
  - Verification that quote is accurate and not edited substantively
  - Right to display customer name (first name + last initial)

- [ ] **Product Type Disclosure**:
  - Customer confirms they used Digital (Creator subscription) or Canvas (physical print)
  - Quote accurately reflects their experience with that product

- [ ] **Indefinite Usage**:
  - Permission extends to web, social media, print, and future channels
  - No expiration date (or specify renewal date if time-limited)

- [ ] **No Compensation Disclosure** (FTC compliance):
  - If customer received free product/service in exchange for testimonial, disclose prominently
  - Add footnote: "Customer received complimentary [product] in exchange for honest review"

### Release Form Template

Store signed forms in: `docs/legal/testimonial-releases/{customer-name}.pdf`

**Minimum Required Fields**:
- Full legal name of individual in photo
- Date of consent
- Signature
- Scope of usage (web, marketing, social media)
- Product used (Digital/Canvas)
- Quote attribution permission
- FTC disclosure (if applicable)

---

## Image Source Attribution (Current)

### Placeholder Images (Phase 1)

**Generation Method**: Programmatically generated via Node.js script
**Source Code**: `scripts/generate-testimonial-placeholders.ts`
**Technology**: `sharp` library for image processing
**License**: N/A (original creation, no third-party assets)
**Attribution Required**: None (temporary internal use only)

**Confirmation**: These placeholders contain NO copyrighted material, stock photos, or third-party assets.

---

### Real Customer Photos (Phase 2 - Pending)

**Status**: Not yet implemented

Once real photos are added, update this section with:

| Testimonial ID | Before Photo Source | After Photo Source | Release Form | Status |
|----------------|---------------------|---------------------|--------------|--------|
| testimonial-1  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-2  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-3  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-4  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-5  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-6  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-7  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-8  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-9  | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-10 | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-11 | TBD                 | TBD                 | TBD          | ❌ Pending |
| testimonial-12 | TBD                 | TBD                 | TBD          | ❌ Pending |

**Example Entry** (once real photo is added):
| testimonial-1  | Customer submission (Sarah M., signed release 2025-11-15) | Wondertone transformation (Neon Splash style) | `docs/legal/testimonial-releases/sarah-m.pdf` | ✅ Approved |

---

## Image Optimization Guidelines

### File Size Targets

**Per Image** (800×800px):
- AVIF: ~3KB (primary format, best compression)
- WebP: ~9KB (fallback for older browsers)
- JPG: ~14KB (universal fallback)

**Total Payload**:
- 24 images × 3 formats = 72 files
- Estimated total: ~624KB uncompressed
- Lazy loading: Only ~6 images load initially (Page 1 carousel)
- Initial payload: ~156KB (acceptable for social proof section)

### Quality Settings

Configured in `scripts/generate-testimonial-placeholders.ts`:
```typescript
JPEG_QUALITY = 80   // Balance quality vs. file size
WEBP_QUALITY = 82   // Slightly higher (better compression than JPEG)
AVIF_QUALITY = 45   // Much higher efficiency at lower numbers
```

**Do not increase quality** without measuring bundle impact. Current settings are optimized for:
- Visual fidelity at 800×800px display size
- Fast load times on mobile networks
- Minimal CLS (Cumulative Layout Shift) with `aspect-ratio` CSS

---

## Maintenance Schedule

### Quarterly Review (Every 3 Months)

- [ ] Verify all testimonial photos still have valid release forms
- [ ] Check for expired permissions (if time-limited releases used)
- [ ] Rotate testimonials based on:
  - Product mix (maintain 2:1 digital-to-canvas ratio)
  - Diversity representation
  - Quote freshness (avoid dated references like "2024 goal")

### Annual Audit (Every 12 Months)

- [ ] Contact customers to renew permissions (if not indefinite)
- [ ] Update photos if customer requests removal
- [ ] Refresh testimonials with recent customer submissions
- [ ] A/B test new testimonial variants (track conversion rates)

---

## Contact & Questions

**Marketing Team**: Update testimonial quotes/authors
**Legal Team**: Review release forms and FTC compliance
**Engineering Team**: Handle image optimization and file management

**Questions?** See `docs/social-proof-implementation-plan.md` for full technical specification.
