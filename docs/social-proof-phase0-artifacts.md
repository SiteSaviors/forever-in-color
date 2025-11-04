# Social Proof Section – Phase 0 Artifact Prep

**Project:** Wondertone Studio – “Proof of Wonder” Social Proof Section  
**Phase:** 0 (Artifact Preparation)  
**Purpose:** Collect and approve every content, asset, and data point required before engineering begins. No code changes in this phase.

---

## 1. Goals & Success Criteria

| Goal | Success Criteria |
| --- | --- |
| Establish rock-solid inputs for the upcoming build | Every asset, quote, and metric documented, sourced, and approved. |
| Keep the section subscription-first while showcasing canvas as bonus | Digital-first stories make up ~80% of slots, canvas ~20%. |
| Ensure every item clears legal, brand, and performance checks | Usage rights confirmed, file specs optimized, analytics hooks defined. |

**Exit Criteria:** This checklist is fully populated with approved assets, open questions resolved/assigned, and stakeholders sign off. Only then do we move to Phase 1.

---

## 2. Content & Asset Inventory

### 2.1 Hero Copy + Metrics
- **Headline:** `Join 10,000+ creators transforming photos in seconds.`  
- **Subhead:** `Watermark-free digital exports. Premium canvases when you want something on the wall.`  
- **Stats (animated pills):**
  1. `2.3M+ previews generated` – source Analytics → confirm latest value.
  2. `96% of Creator members would recommend Wondertone` – source NPS survey.
  3. `12K canvases shipped` – source fulfillment dashboard.
- **Press Logos:** Minimum 4 (TechCrunch, Wired, Product Hunt, etc.). Collect SVG/PNG with usage rights.
- **CTA copy:** `Start Free Preview` (primary), `See canvas quality` (secondary link).

### 2.2 Spotlight Cards (3 total)
| Slot | Story Type | Required Assets | Notes |
| --- | --- | --- | --- |
| Spotlight 1 | Creator engagement boost | Before photo, after art (Neon Splash), quote with metric (“+320% IG reach”), portrait avatar | Emphasize Creator Pro plan benefit. |
| Spotlight 2 | Portfolio/Client success | Before headshot, after art (Watercolor Dreams), quote about watermark-free exports | Mention “Creator Pro since MM/YYYY”. |
| Spotlight 3 | Canvas moment | Lifestyle photo (canvas on wall), unboxing shot optional, quote about delivery speed | Include shipping stat (“Arrived in 5 days to Austin”). |

> **Asset Specs:** 1080×1080 minimum, sRGB, export AVIF + WebP + JPG. Provide alt text and source credits.

### 2.3 Proof Mosaic Tiles (8 total)
- Mix of UGC screenshots (Insta/TikTok/Twitter), portfolio shots, home installs.
- Each tile needs: image, caption (≤60 chars), badge label (`Creator Pro`, `Canvas Print`, `Hybrid`), optional link (e.g., Instagram profile).  
- Ensure variety: 5 digital, 2 canvas, 1 hybrid.

### 2.4 Testimonials & Quotes
- Minimum 6 quotes (3 used in spotlights, 3 for mosaic overlays).  
- Metadata required: name (First + initial), location, plan type, permission status, metric callback (if stated).
- Provide longer-form copy for potential tooltips.

### 2.5 Analytics & CTA Events
- `social_proof_cta_click` (primary button)
- `social_proof_canvas_link_click`
- `social_proof_spotlight_interaction` (card ID, type: auto / manual)
- `social_proof_mosaic_open` (tile ID, product badge)

Document parameters now for analytics engineer.

---

## 3. Asset Sources & Ownership

| Item | Source | Owner | Status |
| --- | --- | --- | --- |
| Stats values (previews, recommendation %, canvases shipped) | Analytics team | 🚧 Pending verification |
| Press logos | Brand marketing | ✅ TechCrunch SVG existing / 🔄 others pending |
| Before/after imagery (digital) | Content ops (pull from Wondertone library) | 🚧 Must curate 4 high-quality pairs |
| Canvas lifestyle shots | Photo team | 🚧 Need 3 final selections + usage rights |
| Customer quotes & permissions | CX/Community | 🚧 Outreach required |
| UGC tiles | Social team | 🚧 Collect 8 posts with consent |
| Accessibility copy (alt text) | UX writing | 🔄 Draft pending asset selection |

If any asset is AI-generated placeholder, mark clearly and schedule post-launch swap.

---

## 4. Technical Constraints & Specs

- **Image delivery:** Place assets in `public/social-proof/`. Naming convention: `spotlight-{1..3}-{before|after}.{avif|webp|jpg}`, `mosaic-{1..8}.{format}`.
- **File sizes:** target ≤200 KB per image (AVIF/WebP), ≤400 KB fallback JPG.
- **Aspect ratios:** Spotlights = 4:5 (portrait) or 1:1 square; Mosaic tiles = 1:1 square.
- **Color treatment:** Align with Wondertone palette (deep purple background, amber accents).
- **Alt text:** Provide descriptive captions (e.g., “Before photo of Sarah smiling in studio; After: Neon Splash portrait with neon lines”).
- **Legal:** Confirm testimonial and UGC usage rights; store consent confirmation in `docs/legal/social-proof-consents.md` (future).

---

## 5. Open Questions & Decisions Needed

1. **Metrics auto-refresh?** Static vs pulled via API. Decision needed from analytics lead.
2. **CTA destination:** Does primary button open upload modal or navigate to `/create`? Product to confirm.
3. **Canvas anchor:** Confirm target section ID (future Canvas Quality module). Placeholder `#canvas-quality`.
4. **Spotlight rotation:** auto-advance interval (6s recommended) and whether pause on hover is required.
5. **UGC linking:** Decide if tiles link out to social posts (needs external navigation policy).

Assign each question to owner in planning doc.

---

## 6. Timeline & Responsibilities

| Milestone | Owner | Due |
| --- | --- | --- |
| Finalize metrics + press assets | Analytics / Brand | **T+2 days** |
| Curate spotlight imagery + quotes | Content Ops | **T+4 days** |
| Collect UGC + permissions | Social | **T+4 days** |
| Provide alt text & CTA microcopy | UX Writing | **T+5 days** |
| Asset optimization (AVIF/WebP/JPG) | Frontend | **T+6 days** |
| Phase 0 sign-off | PM + Stakeholders | **T+6 days** |

> T = today (Phase 0 kickoff). Adjust dates as needed in project tracker.

---

## 7. Deliverables Checklist

- [ ] Metrics + press logos verified & approved  
- [ ] Spotlight assets (imagery, quotes, stats, PTO approvals)  
- [ ] Mosaic tiles (images, captions, badges, permissions)  
- [ ] CTA copy + analytics event spec  
- [ ] Alt text + accessibility notes  
- [ ] File locations documented  
- [ ] All open questions answered  
- [ ] Stakeholder sign-off recorded

Keep this checklist updated in the project tracker. Once complete, Phase 1 (config + skeleton) can begin without rework.

---

## 8. References

- `docs/social-proof-implementation-plan.md` – master spec (retain for ongoing phases)  
- `docs/style-inspiration-implementation-plan.md` – pattern references  
- `src/hooks/useMediaQuery.ts` – existing responsive hook  
- Brand guideline deck – color, typography, logo usage (see Figma link)

---

**Next Steps:** Populate the asset inventory, secure approvals, and update the checklist. Notify engineering when all Phase 0 deliverables are complete so development can start confidently.
