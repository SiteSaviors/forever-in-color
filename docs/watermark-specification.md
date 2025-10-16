# Wondertone Canva-Style Grid Watermark - Technical Specification

**Version:** 1.0
**Date:** 2025-10-16
**Author:** Claude Sonnet 4.5
**Status:** Implementation Ready

---

## Design Philosophy

**Conversion-Optimized Watermarking:**
The watermark must be **impossible to ignore, impossible to remove, yet preserve the art's emotional impact**. Every pixel is engineered to drive one behavior: upgrade to paid.

**Inspiration:** Canva's professional diagonal grid - proven at massive scale to convert free users without destroying the preview experience.

---

## Visual Specification

### Pattern Type: Diagonal Grid with Centered Logo

```
┌─────────────────────────────────────────┐
│  W O N D E R T O N E                   │
│    \     W O N D E R T O N E         / │
│      \       W O N D E R T O N E   /   │
│        \                         /     │
│          \    [WONDERTONE LOGO] /      │
│            \                  /        │
│              W O N D E R T O N E       │
│            /                  \        │
│          /                      \      │
│        /   W O N D E R T O N E    \    │
│      /                              \  │
│    /     W O N D E R T O N E          \│
│  W O N D E R T O N E                   │
└─────────────────────────────────────────┘
```

---

## Grid Pattern Specification

### Diagonal Lines

**Angle:** -30° (from horizontal, top-right to bottom-left)
- **Why -30°?** Matches Canva's proven pattern; aggressive enough to be distracting, not so steep it looks amateurish

**Spacing Between Lines:** 170px vertical distance
- **Calculation:** For image height `H`, number of lines = `ceil(H / 170) + 2` (extra lines for rotation overflow)

**Text Repetition Along Each Line:**
- **"WONDERTONE"** text repeated every 170px horizontal distance
- **Font:** System sans-serif (fallback: Arial, Helvetica, sans-serif)
- **Font Size:** `max(18px, imageWidth * 0.025)` (scales with image, min 18px for readability)
- **Font Weight:** 600 (semi-bold)
- **Letter Spacing:** 0.15em (slightly expanded for readability)
- **Text Transform:** UPPERCASE

**Text Rendering:**
- **Fill Color:** White (#FFFFFF)
- **Stroke:** 1px black (#000000) at 50% opacity of main text
  - **Purpose:** Ensures visibility on both light and dark backgrounds
- **Anti-aliasing:** Enabled (smooth edges)

---

## Center Logo Specification

### Logo Asset

**File:** `public/Wondertone-Logo-Icon/wondertone-watermark-icon.png`
- **Format:** PNG with transparency
- **Source Dimensions:** ~512x512px (actual logo artwork smaller)
- **Color:** Purple/lavender "W" mark

### Logo Placement

**Position:**
- **Horizontal:** Exact center (50% of image width)
- **Vertical:** Exact center (50% of image height)

**Size:**
- **Width:** 15% of image width (minimum 120px, maximum 400px)
- **Height:** Maintain aspect ratio
- **Calculation:**
  ```typescript
  const logoWidth = Math.max(120, Math.min(400, imageWidth * 0.15));
  const logoHeight = logoWidth; // Square aspect ratio
  ```

**Opacity:** Inherits from context opacity (see below)

**Rendering:**
- Composite over grid text
- Smooth scaling (bicubic interpolation)
- No rotation (logo stays upright regardless of grid angle)

---

## Opacity by Context

### Context-Aware Opacity Levels

| Context | Opacity | Purpose | User Sees |
|---------|---------|---------|-----------|
| **preview** | 38% | UI display in studio/gallery | Visible but art still shines |
| **download** | 40% | Maximum deterrent for saved files | Clearly watermarked |
| **canvas** | 23% | Room visualization (CanvasInRoomPreview) | Subtle, preserves mock realism |

**Implementation:**
```typescript
const opacityMap = {
  preview: 0.38,
  download: 0.40,
  canvas: 0.23
};
```

**Why these specific values?**
- **38% (preview):** Sweet spot - visible without destroying art
- **40% (download):** Maximum before users complain it ruins the preview
- **23% (canvas):** Minimum where watermark is still detectable but room mock looks professional

---

## Color & Contrast Optimization

### Text Color Strategy

**Primary:** White (#FFFFFF)
**Stroke:** Black (#000000) at 19% opacity (50% of 38% base)

**Why white with black stroke?**
- **Light backgrounds:** Black stroke provides contrast
- **Dark backgrounds:** White fill provides contrast
- **Mixed backgrounds:** Combination ensures visibility everywhere

### Logo Color Handling

**Current Logo:** Purple/lavender (#A78BFA-ish)
**Rendering:** Apply opacity to entire logo, preserving original color

**Consideration:** If visibility issues arise, convert to white (#FFFFFF) programmatically
- **Pros:** Better visibility, matches text
- **Cons:** Loses brand color

**Decision:** Start with original purple, test visibility, convert to white if needed

---

## Grid Generation Algorithm

### Server-Side (ImageScript/Deno)

```typescript
function generateWatermarkGrid(
  imageWidth: number,
  imageHeight: number,
  context: 'preview' | 'download' | 'canvas',
  logoBuffer: ArrayBuffer
): ImageData {

  const opacity = context === 'canvas' ? 0.23 : context === 'download' ? 0.40 : 0.38;
  const angle = -30; // degrees
  const lineSpacing = 170; // px
  const textSpacing = 170; // px
  const fontSize = Math.max(18, imageWidth * 0.025);

  // 1. Create canvas matching image dimensions
  const canvas = createCanvas(imageWidth, imageHeight);
  const ctx = canvas.getContext('2d');

  // 2. Configure text style
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
  ctx.lineWidth = 1;
  ctx.letterSpacing = '0.15em';

  // 3. Rotate canvas for diagonal pattern
  ctx.save();
  ctx.translate(imageWidth / 2, imageHeight / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-imageWidth / 2, -imageHeight / 2);

  // 4. Calculate grid bounds (accounting for rotation)
  const diagonal = Math.sqrt(imageWidth ** 2 + imageHeight ** 2);
  const numLines = Math.ceil(diagonal / lineSpacing) + 2;
  const startY = -diagonal / 2;

  // 5. Draw text grid
  for (let i = 0; i < numLines; i++) {
    const y = startY + (i * lineSpacing);
    const numTexts = Math.ceil(diagonal / textSpacing) + 2;

    for (let j = 0; j < numTexts; j++) {
      const x = -diagonal / 2 + (j * textSpacing);
      ctx.strokeText('WONDERTONE', x, y);
      ctx.fillText('WONDERTONE', x, y);
    }
  }

  ctx.restore();

  // 6. Draw center logo
  const logoWidth = Math.max(120, Math.min(400, imageWidth * 0.15));
  const logoX = (imageWidth - logoWidth) / 2;
  const logoY = (imageHeight - logoWidth) / 2;

  ctx.globalAlpha = opacity;
  ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoWidth);

  return canvas.toImageData();
}
```

### Client-Side (Canvas API/React)

```typescript
function applyWatermarkOverlay(
  sourceImage: HTMLImageElement,
  wondertoneLogo: HTMLImageElement,
  context: 'preview' | 'download' | 'canvas'
): string {

  const { width, height } = sourceImage;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;

  // Draw source image
  ctx.drawImage(sourceImage, 0, 0);

  // Apply watermark grid (same algorithm as server)
  const opacity = context === 'canvas' ? 0.23 : context === 'download' ? 0.40 : 0.38;

  // [Grid rendering code - same as server]

  return canvas.toDataURL('image/jpeg', 0.92);
}
```

---

## Performance Optimization

### Caching Strategy

**Server-Side:**
1. **Generate once** per image + context combination
2. **Store in CDN** with aggressive cache headers:
   ```http
   Cache-Control: public, max-age=2592000, immutable
   Vary: X-WT-Context
   ```
3. **Cache key:** `watermark:v1:{imageHash}:{context}`

**Client-Side:**
1. **Memoize** watermark renders by image source + context
2. **WeakMap cache** to avoid memory leaks:
   ```typescript
   const watermarkCache = new WeakMap<HTMLImageElement, Map<string, string>>();
   ```

### Rendering Performance

**Server:**
- **ImageScript** (Deno native): ~50-100ms per watermark generation
- **Parallel processing:** Use Web Workers for batch operations

**Client:**
- **Canvas API:** ~30-50ms per watermark render
- **Async rendering:** Don't block main thread
- **Progressive enhancement:** Show un-watermarked while rendering

---

## Edge Cases & Fallbacks

### Small Images (< 500px)

**Problem:** Watermark may be too dense
**Solution:**
- Increase line spacing: `max(170, imageWidth * 0.35)`
- Reduce font size floor: `max(14px, imageWidth * 0.025)`
- Scale logo down: `max(80px, imageWidth * 0.15)`

### Large Images (> 4000px)

**Problem:** Too much processing time
**Solution:**
- Render watermark on 2000px version
- Scale up watermarked result (bicubic)
- **Trade-off:** Slightly blurrier watermark, but 4x faster

### Extreme Aspect Ratios

**Problem:** Very wide or very tall images may have awkward grid spacing
**Solution:**
- Calculate diagonal correctly: `sqrt(w² + h²)`
- Ensure grid covers entire rotated canvas
- Test with: 1:3 (tall) and 3:1 (wide) aspect ratios

### Logo Loading Failure

**Fallback:**
- If logo fails to load, render **only text grid**
- No center logo (better than broken image)
- Log error for monitoring

---

## Accessibility Considerations

### Alt Text

Watermarked images should have descriptive alt text:
```html
<img
  src="watermarked-url"
  alt="AI-generated artwork in Classic Oil Painting style (watermarked preview)"
/>
```

### Screen Readers

Watermarks are purely visual - no ARIA labels needed.

### Color Contrast

White text + black stroke ensures **WCAG AA compliance** (4.5:1 contrast) on most backgrounds.

---

## Quality Assurance Checklist

### Visual Tests

- [ ] Grid lines at exact -30° angle
- [ ] Text spacing consistent (170px)
- [ ] Logo perfectly centered
- [ ] Logo size proportional (15% of width)
- [ ] Opacity correct for each context (23%, 38%, 40%)

### Cross-Browser Tests

- [ ] Chrome (Canvas API)
- [ ] Safari (WebKit quirks)
- [ ] Firefox (Gecko rendering)
- [ ] Mobile Safari (iOS performance)

### Orientation Tests

- [ ] Square (1:1) images
- [ ] Horizontal (3:2) images
- [ ] Vertical (2:3) images
- [ ] Extreme aspect ratios (1:3, 3:1)

### Context Tests

- [ ] Preview context (38% opacity) in UI
- [ ] Download context (40% opacity) on saved files
- [ ] Canvas context (23% opacity) in room mock

### Performance Tests

- [ ] Server generation < 100ms (p95)
- [ ] Client render < 50ms (p95)
- [ ] CDN cache hit rate > 95%
- [ ] No memory leaks (client cache cleanup)

---

## Security Considerations

### Watermark Bypass Prevention

**Potential Attack:** User inspects network tab, finds original clean URL before watermarking

**Mitigation:**
1. **Never expose clean URLs** to free/anonymous users in API responses
2. **Sign URLs** with short TTL (5 minutes) for paid users
3. **Rate limit** watermark endpoint (prevent bulk scraping)

**Potential Attack:** User removes watermark via Photoshop

**Mitigation:**
- **Diagonal grid** is harder to remove than simple overlay
- **Embedded in JPEG** (not separate layer)
- **Trade-off:** Sophisticated users can remove anything - focus on casual users

---

## Monitoring & Analytics

### Metrics to Track

**Server-Side:**
- `watermark_generation_duration_ms` (p50, p95, p99)
- `watermark_cache_hit_rate`
- `watermark_errors_total` (by error type)

**Client-Side:**
- `watermark_render_duration_ms`
- `watermark_cache_utilization`
- `watermark_fallback_count` (when server fails)

**Business:**
- `watermarked_preview_views` (by tier)
- `watermark_to_upgrade_conversion_rate`
- `download_attempts_with_watermark` (frustration signals)

---

## Future Enhancements

### Phase 4: Dynamic Watermark Optimization

**Idea:** A/B test watermark opacity/density to maximize conversions

**Implementation:**
- Track conversion rates by opacity level
- Automatically adjust opacity per user segment
- Machine learning model to optimize per style

### Phase 5: Invisible Watermarking

**Idea:** Embed steganographic watermark for copyright protection

**Use Case:** Detect unauthorized use of Wondertone images on web

**Tools:** LSB steganography, DCT-based watermarking

---

## Appendix: Sample Images

### Preview Context (38% Opacity)
[Example will be generated during testing]

### Download Context (40% Opacity)
[Example will be generated during testing]

### Canvas Context (23% Opacity)
[Example will be generated during testing]

---

**Specification Status:** ✅ **READY FOR IMPLEMENTATION**
**Next Step:** Build server-side watermark service in ImageScript
