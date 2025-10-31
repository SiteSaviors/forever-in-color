// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Run `npm run build:registry` to regenerate.

export type EdgeStyleRegistryEntry = {
  id: string;
  name: string;
  numericId: number | null;
  tone: 'trending' | 'classic' | 'modern' | 'abstract' | 'stylized' | 'electric' | 'signature' | null;
  tier: 'free' | 'premium';
  prompt: {
    numericId: number;
    prompt: string;
    updatedAt: string;
  } | null;
};

export const EDGE_STYLE_REGISTRY: EdgeStyleRegistryEntry[] = [
{
  id: "original-image",
  name: "Original Image",
  numericId: 1,
  tone: null,
  tier: "free",
  prompt: {
    numericId: 1,
    prompt: "Keep the image exactly as is, no artistic transformation",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "classic-oil-painting",
  name: "Classic Oil Painting",
  numericId: 2,
  tone: "classic",
  tier: "free",
  prompt: {
    numericId: 2,
    prompt: "Recreate the exact image as a majestic oil painting, evoking a sense of timeless elegance, with meticulous attention to detail and subtle texture, characteristic of traditional realism. Employ smooth, expressive brushstrokes that convey a sense of refinement, and a harmonious palette of natural tones, reminiscent of old masters. Soft, warm lighting casts a gentle glow on the subject, accentuating the subtle play of shadows and highlights. The composition is thoughtfully arranged, with a clear sense of balance and harmony, drawing the viewer's eye to the central figure. The subject's pose, facial features, and skin tone are meticulously preserved, with a focus on capturing the subtleties of expression, inviting the viewer to connect with the subject on a deeper level.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "calm-watercolor",
  name: "Calm Watercolor",
  numericId: 20,
  tone: "classic",
  tier: "free",
  prompt: {
    numericId: 20,
    prompt: "Recreate the exact image as a soft watercolor — quiet, luminous, and gently diffused. Preserve the full composition and structure of the subject with accurate proportions and clear focal details. Paint primarily wet-on-wet with feathered edges, letting shapes dissolve softly into surrounding washes. Avoid heavy splatter, harsh outlines, or dramatic blooms. Let backgrounds recede with atmospheric wash and a whispered vignette so the subject breathes in open space. The result should feel still, balanced, and tender — a tranquil watercolor that honors the original image with poised simplicity.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "gallery-acrylic",
  name: "Gallery Acrylic",
  numericId: 14,
  tone: "classic",
  tier: "free",
  prompt: {
    numericId: 14,
    prompt: "Recreate the exact image as a contemporary acrylic painting — bold color, crisp edges, and clean, layered flats. Preserve the subject’s full composition. Render forms with decisive brush and palette-knife strokes; build color in opaque layers (lights over darks) with minimal glazing. Keep transitions intentional: hard edges on graphic planes and tighter details; soft, feathered edges only where needed for depth. Use a modern, saturated palette with high local contrast; avoid oil-style glow or muddy blends. Add subtle canvas tooth and occasional knife ridges to suggest fast-drying acrylic texture. The result should feel fresh, vivid, and gallery-ready — a sharp, modern staple that stays true to the original photo.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "watercolor-dreams",
  name: "Watercolor Dreams",
  numericId: 4,
  tone: "signature",
  tier: "free",
  prompt: {
    numericId: 4,
    prompt: "Recreate the exact image in an expressive watercolor style — bold, dynamic, and emotionally vibrant. Preserve the full composition and structure of the subject, including the subject's pose, features, proportions, and spatial arrangement. Use loose, energetic brushwork, vivid splashes of color, and spontaneous paint drips to convey movement and feeling. Let pigments flow and merge unpredictably, creating a painterly abstraction around the subject without distorting the core details. Emphasize contrast, texture, and fluid transitions, with a sense of joyful chaos that enhances — not overwhelms — the subject's presence. The result should feel alive and impressionistic, yet true to the original image.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "pastel-bliss",
  name: "Pastel Bliss",
  numericId: 5,
  tone: "classic",
  tier: "premium",
  prompt: {
    numericId: 5,
    prompt: "Recreate the exact image in a soft pastel illustration style — calming and emotionally warm, with clearly defined forms and balanced contrast. Preserve the full composition and subject structure, including accurate pose, features, proportions, and spatial layout. Use smooth shading and subtle blending between gentle pastel hues — but ensure the subject remains crisp and well-defined against the background. Avoid overly washed-out or faded tones; instead, apply light colors with intention and depth, creating a soft yet vibrant rendering. The final image should feel peaceful and nostalgic, while still vivid and visually engaging.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "pop-art-bust",
  name: "Pop Art Bust",
  numericId: null,
  tone: "modern",
  tier: "free",
  prompt: null,
},
{
  id: "modern-colorblock",
  name: "Modern Colorblock",
  numericId: 3,
  tone: "modern",
  tier: "free",
  prompt: {
    numericId: 3,
    prompt: "Recreate the exact image in a modern colorblock style — bold, clean, and hard-edged. Preserve the full composition and structure of the subject with accurate proportions. Simplify surfaces into large, opaque color planes with razor-sharp edges; reserve small, high-contrast blocks for facial details and key accents. Build shadows and highlights as discrete blocks rather than soft fades; maintain generous negative space for a poster-like feel. The result should feel fresh, graphic, and gallery-ready — a confident modern portrait built from pure color shapes.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "dot-symphony",
  name: "Dot Symphony",
  numericId: 19,
  tone: "modern",
  tier: "free",
  prompt: {
    numericId: 19,
    prompt: "Recreate the exact image in an authentic pointillist style — built from countless small dots of pure color. Preserve the subject’s full composition, pose, proportions, and facial structure. Render form with closely packed dots that optically blend at viewing distance; avoid soft airbrush or continuous-tone gradients. Use luminous complements to model light and shadow. Keep edges readable by tightening dot density along contours and features. The result should feel radiant and shimmering, like a sunlit scene resolved through color vibration.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "fauve-splash",
  name: "Fauve Splash",
  numericId: 18,
  tone: "modern",
  tier: "free",
  prompt: {
    numericId: 18,
    prompt: "Recreate the exact image in a Fauvist style — wild color, bold shapes, and liberated brushwork. Preserve the subject’s composition, pose, and anatomy while simplifying forms into decisive planes. Replace natural hues with expressive, high-key color. Keep linework confident, contours slightly exaggerated, and lighting stylized rather than realistic. The result should feel joyful, daring, and saturated with emotion.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "hex-weave",
  name: "Hex Weave",
  numericId: 29,
  tone: "abstract",
  tier: "free",
  prompt: {
    numericId: 29,
    prompt: "Recreate the exact image as an isometric hex weave—textile, dimensional, and readable. Preserve the subject’s full composition and a clean silhouette. Implement over/under weaving logic with subtle cast shadows. Increase strand density around eyes and lips for detail; use larger, looser weave on hair and background. Render strands with soft fiber sheen (matte to satin), avoiding photographic texture. Keep pupils and key features partially un-woven for identity; palette stays tasteful with one accent color thread.",
    updatedAt: "2025-10-30 03:26:58.086611+00",
  },
},
{
  id: "prisma-tesla",
  name: "Prisma Tesla",
  numericId: 30,
  tone: "abstract",
  tier: "free",
  prompt: {
    numericId: 30,
    prompt: "Recreate the exact image as a low-poly prism composition—faceted, crisp, and high-impact. Preserve full structure and pose. Triangulate forms with Delaunay-like facets; use finer facets around eyes and mouth, larger facets elsewhere. Assign each triangle a cohesive color ramp with mild hue shift; add slim bevel highlights on key edges, no heavy outlines. Introduce a few spectral light leaks near specular zones; keep skin tones stylized but believable. Background is dark-to-mid with soft bokeh sparkles; no facet overdraw on pupils.",
    updatedAt: "2025-10-30 03:27:34.727397+00",
  },
},
{
  id: "op-art-pulse",
  name: "Op Art Pulse",
  numericId: 31,
  tone: "abstract",
  tier: "free",
  prompt: {
    numericId: 31,
    prompt: "Recreate the exact image in an optical art style — rhythmic, high-contrast patterns that create vibration and depth. Use a restrained palette (black/white or limited duotone) and control line frequency so features remain readable. Employ gradient line spacing to model volume and a subtle background field that pulses outward from the silhouette. The result should feel kinetic and mesmerizing — a crisp optical illusion that still honors the subject’s identity.",
    updatedAt: "2025-10-30 03:28:33.633157+00",
  },
},
{
  id: "street-graffiti",
  name: "Street Graffiti",
  numericId: 26,
  tone: "modern",
  tier: "free",
  prompt: {
    numericId: 26,
    prompt: "Recreate the exact image as a multi-layer street stencil — bold, high-contrast, and urban. Preserve the full composition and structure of the subject with accurate proportions and a clean silhouette. Reduce forms to 2–4 flat stencil layers (shadow, mid, light, highlight) with crisp cut edges and visible overspray halos. Place on a subtle wall texture (concrete, brick, plywood) with light paint bleed; keep facial/details sharp via tighter inner cuts. The result should feel like a hand-cut stencil hit cleanly on a city wall.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "riso-punch",
  name: "Riso Punch",
  numericId: 17,
  tone: "modern",
  tier: "free",
  prompt: {
    numericId: 17,
    prompt: "Recreate the exact image in a risograph print style — graphic, tactile, and slightly misregistered. Preserve the subject’s full composition, pose, proportions, and facial details while translating forms into bold shapes. Use a 2–3 color ink set (e.g., fluorescent pink, teal, sunflower yellow) with visible halftone textures, overprint blends, and subtle off-register edges for energy. Keep shadows as dot fields and midtones as layered screens; avoid photographic gradients. Paper texture should read as uncoated stock with light grain. The final image should feel like a studio poster print — punchy, imperfect, and irresistibly modern.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "3d-storybook",
  name: "3D Storybook",
  numericId: 7,
  tone: "stylized",
  tier: "free",
  prompt: {
    numericId: 7,
    prompt: "Recreate the exact image as a stylized 3D illustration — expressive, playful, and visually engaging. Preserve the full composition and structure of the original subject, including accurate shape, proportions, and spatial layout. Render the subject with smooth, rounded modeling, vibrant colors, and soft lighting to create a polished, animated look. Use exaggerated but intentional design elements to enhance personality and charm, whether the subject is a person, pet, vehicle, building, or object. The final image should feel joyful and dynamic, like a scene from a Pixar or Fortnite-style animated world — stylized yet true to the original form.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "90s-cartoon",
  name: "90s Cartoon",
  numericId: 21,
  tone: "stylized",
  tier: "free",
  prompt: {
    numericId: 21,
    prompt: "Recreate the exact image as a 1990s TV cartoon. Preserve the full composition and structure of the subject. Translate forms into thick black keylines (3–6 px look), flat cel-shaded color blocks (1–2 shadow steps), and simple shape language (slightly exaggerated geometry, squash-and-stretch where natural). Use a vibrant Saturday-morning palette (teals, oranges, purples, limes) with minimal gradients; keep highlights as solid shapes, not soft glows. Background may use pattern panels (dots, zigzags, checker). The result should feel like a crisp, nostalgic 90s cartoon — playful, graphic, and instantly readable.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "pop-surrealism",
  name: "Pop Surrealism",
  numericId: 22,
  tone: "stylized",
  tier: "premium",
  prompt: {
    numericId: 22,
    prompt: "Recreate the exact image in a vivid Pop Surrealism style — blending painterly realism with whimsical, dreamlike energy. Use richly saturated colors, hyperreal texture, and dramatic golden-hour lighting to enhance emotion. Incorporate fantastical, swirling skies and surreal background elements (like glowing clouds or floating orbs) that feel imaginative yet harmonious with the scene. The final artwork should evoke a fairytale-like quality — romantic, expressive, and elevated beyond reality — like a magical memory painted in vibrant, surreal detail.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "papercraft-layers",
  name: "Papercraft Layers",
  numericId: 23,
  tone: "stylized",
  tier: "premium",
  prompt: {
    numericId: 23,
    prompt: "Recreate the exact image as a layered papercraft collage — dimensional, clean-edged, and softly shadowed. Preserve the full composition, pose, and proportions while decomposing the image into cut-paper shapes with precise vector-like edges. Stack 6–12 layers separated by subtle drop shadows and ambient occlusion to create depth. Use matte, slightly textured cardstock colors with tasteful gradients only where necessary. Keep eyes, hands, and key contours sharply defined. The result should feel like a premium handcrafted diorama made of paper.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "voxel-mineworld",
  name: "Voxel Mineworld",
  numericId: 24,
  tone: "stylized",
  tier: "premium",
  prompt: {
    numericId: 24,
    prompt: "Recreate the exact image as a Minecraft-style voxel diorama. Preserve full composition and silhouette. Rebuild forms with hard cubic voxels (no bevels) at 2–8 px scale; use smaller voxels only for eyes/logos/hands. Apply matte, pixelated textures (no photo gradients), soft even lighting with ambient occlusion in creases, and a faint ground grid shadow. Keep silhouettes clean—no noisy fragmentation.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "claymation-sculpt",
  name: "Claymation Sculpt",
  numericId: 25,
  tone: "stylized",
  tier: "premium",
  prompt: {
    numericId: 25,
    prompt: "Recreate the exact image as a stop-motion clay portrait — chunky, handmade, and charming. Preserve the subject’s full composition and proportions with a clean silhouette. Model forms as soft clay volumes with visible thumbprints, tool marks, and light seam lines; keep facial/details readable with sharper clay cuts. Use matte, saturated colors with subtle plasticine sheen; no photographic texture. Add tabletop studio lighting (soft key + tiny speculars) and a simple backdrop card. The result should feel like a frame from a claymation film — playful, tactile, and alive.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "artisan-charcoal",
  name: "Artisan Charcoal",
  numericId: 8,
  tone: "classic",
  tier: "premium",
  prompt: {
    numericId: 8,
    prompt: "Recreate the exact image as a detailed charcoal sketch — textured, hand-drawn, and expressive. Preserve the full structure and composition of the original subject, including accurate proportions, angles, and spatial arrangement. Use rich crosshatching, soft smudging, and tonal shading to build form and depth, mimicking traditional charcoal on textured paper. Keep the subject's details clear and intact while rendering them in a warm, monochromatic palette. The result should feel timeless and handcrafted, like a finely rendered charcoal illustration that blends realism with artistic character.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "classic-crayon",
  name: "Classic Crayon",
  numericId: 12,
  tone: "classic",
  tier: "premium",
  prompt: {
    numericId: 12,
    prompt: "Recreate the exact image as a hand-drawn crayon illustration — warm, waxy, and richly textured. Preserve the full composition and subject structure. Render forms with layered crayon strokes. Use a balanced color palette that matches the original image while allowing gentle artistic exaggeration; build shadows with cross-hatching and stacked complementary colors rather than flat black. The final image should read as a crisp, expressive crayon portrait — colorful, tactile, and true to the original photo.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "neon-splash",
  name: "Neon Splash",
  numericId: 10,
  tone: "electric",
  tier: "free",
  prompt: {
    numericId: 10,
    prompt: "Recreate the exact image in a dynamic Neon Splash style — electric, expressive, and bursting with high-intensity energy. Preserve the full subject composition, pose, and proportions with accurate facial features and visual structure. Surround the scene with vivid neon paint splashes, glowing outlines, and abstract light trails that radiate from the subject. Use a high-contrast color palette with hot pinks, electric blues, purples, and glowing oranges. Incorporate kinetic strokes, scatter effects, and surreal lighting to convey movement and emotion. The final image should feel like a glowing explosion of joy, power, and motion — where color and light collide in a captivating, artistic storm",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "electric-drip",
  name: "Electric Drip",
  numericId: 11,
  tone: "electric",
  tier: "free",
  prompt: {
    numericId: 11,
    prompt: "Recreate the exact image as a UV-neon drip/splatter painting. Preserve the full structure of the subject with a clean silhouette. Fluorescent accents: hot pink, electric blue, acid green, violet, and citrus orange. Build bold color fields, then layer sprays, splatter bursts, and gravity drips. Add soft neon bloom and thin rim-light glow along fast contours; use overspray speckle sparingly.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "glow-crayon",
  name: "Glow Crayon",
  numericId: 27,
  tone: "electric",
  tier: "premium",
  prompt: {
    numericId: 27,
    prompt: "Recreate the exact image as a blacklight-inspired crayon illustration — bold, waxy, and nightlife-bright. Preserve the full composition, pose, proportions, and facial features. Build forms with thick crayon strokes and layered color stacks; use high-impact hues (hot pink, electric blue, acid green, violet) with a subtle outer glow to simulate UV pop. Keep edges outlined with confident dark marks; add cross-hatch shading and visible paper tooth for texture. Introduce selective white-crayon highlights and soft bloom around the brightest areas. The result should feel like a glow-party sketchbook page — playful, modern, and ultra shareable.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "casso-cubist",
  name: "Casso Cubist",
  numericId: 32,
  tone: "abstract",
  tier: "premium",
  prompt: {
    numericId: 32,
    prompt: "Recreate the exact image in Synthetic Cubism — bold collage logic with graphic shapes and inserts. Preserve the composition and readable proportions of the subject, then rebuild forms using larger flat planes, cut-paper edges, and selective contour lines. Integrate collage elements (newsprint textures, music-staff scraps, woodgrain, painted labels) as surface inlays; keep them abstract and non-readable. Use a warmer, more playful palette (tan, cream, coral, olive, charcoal) with 1–2 accent colors. Outline only where needed; let overlapping shapes and stamped textures imply volume. The result should feel modern, witty, and constructed — a lively cubist collage that still honors the source image.",
    updatedAt: "2025-10-30 03:29:16.55469+00",
  },
},
{
  id: "sumi-ink-whisper",
  name: "Sumi Ink Whisper",
  numericId: 33,
  tone: "abstract",
  tier: "premium",
  prompt: {
    numericId: 33,
    prompt: "Recreate the exact image as a sumi-ink marbling portrait—fluid, poetic, and atmospheric. Preserve composition and a clean silhouette. Reduce to a desaturated ink base, then advect soft marbling flows along cheek and hair contours; keep eyes, nostrils, and lip edges sharper for identity. Layer delicate gold-foil veins across broad ink pools; use feathered edges and paper grain. Avoid chaotic turbulence over the eye triangle. Add faint bloom around highlights; background remains a calm marbled wash.",
    updatedAt: "2025-10-30 03:30:08.333804+00",
  },
},
{
  id: "abstract-chorus",
  name: "Abstract Chorus",
  numericId: 34,
  tone: "abstract",
  tier: "premium",
  prompt: {
    numericId: 34,
    prompt: "Recreate the exact image as an Orphist color-harmony—prismatic, circular, and musical. Preserve overall structure and a clean silhouette. Build the background with translucent discs and curved arcs that radiate behind and around the silhouette. \\n",
    updatedAt: "2025-10-30 03:30:50.144199+00",
  },
},
{
  id: "voxel-arcade",
  name: "Voxel Arcade",
  numericId: 35,
  tone: "electric",
  tier: "premium",
  prompt: {
    numericId: 35,
    prompt: "Recreate the exact image in a neon cyber-voxel aesthetic — electric, high-contrast, and nightlife-ready. Preserve the subject’s composition, pose, and facial accuracy while reconstructing forms with dark matte voxels accented by emissive edges and light strips (cyan, magenta, violet). Add subtle scanlines, rim-light glows, and reflected color on nearby blocks; keep background voxels sparse to frame the figure. Maintain legibility by using finer voxel resolution at facial features and hands. The result should feel like a retro-future arcade hero shot — vibrant cubes lit by pure energy.",
    updatedAt: "2025-10-30 05:08:34.764196+00",
  },
},
{
  id: "retro-synthwave",
  name: "Retro Synthwave",
  numericId: 37,
  tone: "electric",
  tier: "premium",
  prompt: {
    numericId: 37,
    prompt: "Recreate the exact image in a retro-future neon synthwave style — dark base, electric accents, and clean silhouette. Preserve the full composition and proportions of the subject. Palette-lock to hot magenta, electric cyan, violet, and indigo with small sunset orange/pink for glow accents; no naturalistic gradients.",
    updatedAt: "2025-10-30 05:14:50.092634+00",
  },
},
{
  id: "holowire-prism",
  name: "Holowire Prism",
  numericId: 36,
  tone: "electric",
  tier: "premium",
  prompt: {
    numericId: 36,
    prompt: "Recreate the exact image as a neon wireframe overlay — precise, minimal, and high-contrast. Preserve proportions and a clean silhouette, then trace primary forms with thin emissive ribs (cyan/magenta/violet), using denser lines at joints and feature edges. Keep surfaces mostly matte; wireframe floats just above the subject with subtle parallax and a faint floor grid. Do not cross the pupils/emblems; let the wireframe conform around those features. Use mild neon bloom, no heavy glow; background remains dark and uncluttered.",
    updatedAt: "2025-10-30 05:12:33.691598+00",
  },
},
{
  id: "plush-figure",
  name: "Plush Figure",
  numericId: 44,
  tone: "experimental",
  tier: "premium",
  prompt: {
    numericId: 44,
    prompt: "Recreate the exact image as a hand-sewn felt plush—soft, stitched, and huggable. Preserve the subject’s composition and clean silhouette, then rebuild forms as layered felt panels with visible blanket stitches along edges, occasional cross-stitches, and tiny fabric seams. Use matte wool-fiber texture with light fuzz; add gentle poly-fill puffing for rounded volume. Replace eyes/emblems with button or embroidered details; no photographic surfaces. Keep colors cozy and slightly desaturated; add subtle fabric shadowing and tabletop studio light for depth.",
    updatedAt: "2025-10-30 22:19:21.165638+00",
  },
},
{
  id: "candy-gummy",
  name: "Candy Gummy",
  numericId: 45,
  tone: "experimental",
  tier: "premium",
  prompt: {
    numericId: 45,
    prompt: "Recreate the exact image as a translucent gummy candy—edible, glossy, and playful. Preserve the silhouette and readable proportions; soften forms into rounded, jellylike geometry with subsurface glow. Render materials as tinted gelatin with tiny suspended air bubbles, smooth meniscus edges, and gentle stickiness; add specular highlights and soft internal caustics. Use a bright candy palette; optional “sugar sparkle” variant with fine crystalline dusting on outer surfaces. Background simple and clean to emphasize translucency.",
    updatedAt: "2025-10-30 22:19:43.914864+00",
  },
},
{
  id: "action-figure",
  name: "Action Figure",
  numericId: 46,
  tone: "experimental",
  tier: "premium",
  prompt: {
    numericId: 46,
    prompt: "Recreate the exact image as an action figure—glossy PVC/ABS, collectible, and retail-ready. Preserve the subject’s composition and clean silhouette, then rebuild forms with panel breaks, visible injection-mold seams, and articulated joints (ball shoulders/hips, hinge elbows/knees, cut wrists/neck or equivalent connectors). Replace textures with crisp color blocking and tampo-printed decals; no photographic surfaces.",
    updatedAt: "2025-10-30 22:21:01.249607+00",
  },
},
{
  id: "porcelain-figurine",
  name: "Porcelain Figurine",
  numericId: 28,
  tone: "experimental",
  tier: "premium",
  prompt: {
    numericId: 28,
    prompt: "Recreate the exact image as a porcelain figurine — high-gloss glaze, smooth sculpted planes, and hand-painted gold trim. Preserve the original pose and expression with refined, slightly idealized anatomy. Add delicate floral or filigree accents around clothing edges. Lighting should include bright highlights and subtle reflections characteristic of kiln-fired ceramic. Present on a small pedestal or tabletop shadow with a soft studio backdrop.",
    updatedAt: "2025-10-30T07:16:07.570425+00",
  },
},
{
  id: "ice-sculpture",
  name: "Ice Sculpture",
  numericId: 47,
  tone: "experimental",
  tier: "premium",
  prompt: {
    numericId: 47,
    prompt: "Recreate the exact image as a carved ice sculpture—crystalline, frosted, and event-ready. Preserve structure and silhouette; translate planes into chisel facets, bevels, and shallow relief cuts. Material: clear ice with internal cracks, faint bubbles, and edge frost; cooler blue-white rim light and subtle volumetric fog. Seat the piece on a pedestal or banquet plinth with a thin melt pool and soft reflections. Keep surfaces clean and glassy where freshly cut; heavier frost in shadowed recesses.",
    updatedAt: "2025-10-30 22:21:39.356445+00",
  },
},
{
  id: "bronze-statue",
  name: "Bronze Statue",
  numericId: 48,
  tone: "experimental",
  tier: "premium",
  prompt: {
    numericId: 48,
    prompt: "Recreate the exact image as a cast bronze statue—monumental, weighty, and timeless. Preserve overall structure and a clean silhouette; translate forms into metal with crisp chisel/tool detail and softened edges from casting. Render a dark bronze alloy with subtle patina (green/teal in recesses), warm speculars on highlights, and faint foundry seam hints; mount on a stone or plinth base with engraved plate. Keep surfaces matte-to-satin, no photographic texture; add gentle museum lighting with cool rim to reveal volume.",
    updatedAt: "2025-10-30 22:22:18.252698+00",
  },
},
{
  id: "wax-candle",
  name: "Wax Candle",
  numericId: 49,
  tone: "experimental",
  tier: "premium",
  prompt: {
    numericId: 49,
    prompt: "Recreate the exact image as a sculpted wax candle—translucent, glossy, and gently melting. Preserve proportions and silhouette; simplify into smooth wax planes with subtle tool impressions, poured seams, and soft rounded edges. Material: tinted paraffin/beeswax with visible subsurface glow; include a centered wick and mild heat-softened sagging or drip trails. Optional lit variant with small flame, warm halo, and pooling wax at the base; place on a simple heat-safe dish.",
    updatedAt: "2025-10-30 22:22:43.041383+00",
  },
},
{
  id: "sand-sculpture",
  name: "Sand Sculpture",
  numericId: 50,
  tone: "experimental",
  tier: "premium",
  prompt: {
    numericId: 50,
    prompt: "Recreate the exact image as a compacted sand sculpture—grainy, sunlit, and ephemeral. Preserve structure and silhouette; model forms with crisp trowel cuts, layered compaction strata, and slightly crumbly edges. Use warm beach sand color with varied grain size and dry vs. damp patches; add wind-swept micro ripples and tiny shell fragments sparingly. Stage on a sandy plinth with soft footprints/tool marks; bright outdoor light with sharp cast shadows.",
    updatedAt: "2025-10-30 22:23:10.809495+00",
  },
},
{
  id: "colored-pencil",
  name: "Colored Pencil",
  numericId: 38,
  tone: "signature",
  tier: "premium",
  prompt: {
    numericId: 38,
    prompt: "Recreate the exact image as a colored pencil illustration — layered, precise, and richly textured. Preserve the full composition and structure of the subject with accurate proportions and clear silhouette. Build form using controlled hatching and cross-hatching, then deepen color with layered glazing and selective burnishing for smooth highlights. The result should feel detailed and handcrafted — a vibrant colored-pencil rendering that stays true to the original photo.",
    updatedAt: "2025-10-30 17:01:11.820672+00",
  },
},
{
  id: "memphis-pop",
  name: "Memphis Pop",
  numericId: 39,
  tone: "signature",
  tier: "premium",
  prompt: {
    numericId: 39,
    prompt: "Recreate the exact image in a Memphis design pop style — playful, geometric, and high-energy. Preserve the full structure of the subject with accurate proportions and a clean silhouette. Use flat, opaque color planes with crisp black keylines and limited halftone fills. Surround with ’80s motifs (squiggles, dots, checker, zigzags, circles/triangles) arranged on loose grid panels. Palette-lock to six colors: turquoise, lilac, peach, canary, black, white (no extra hues). Keep a clean buffer around face and hands (no patterns crossing features). Favor large, simple background blocks with a few pattern zones for rhythm. No gradients, painterly textures, or photographic shading. The result should feel bright, collectible, and instantly Memphis.",
    updatedAt: "2025-10-30 17:02:27.536618+00",
  },
},
{
  id: "liquid-chrome",
  name: "Liquid Chrome",
  numericId: 40,
  tone: "signature",
  tier: "premium",
  prompt: {
    numericId: 40,
    prompt: "Recreate the exact image as a liquid-chrome smear—glossy, mirrorlike, and sculptural. Preserve proportions and silhouette. Convert forms into high-gloss metallic surfaces; smear normals along graceful flow lines to elongate highlights. Use bright specular streaks and deep blacks; minimal midtones. Keep eyes readable via controlled highlight shapes; avoid melting features beyond recognition. Background is dark and uncluttered with faint reflection/caustic hints; no colored tints unless subtle cyan/steel accents.",
    updatedAt: "2025-10-30 17:06:26.949228+00",
  },
},
{
  id: "glass-ripple",
  name: "Glass Ripple",
  numericId: 41,
  tone: "signature",
  tier: "premium",
  prompt: {
    numericId: 41,
    prompt: "Recreate the exact image as refractive ripple glass—sleek, prismatic, and sculptural. Preserve proportions and silhouette. Convert surfaces into clear glass panels with normals derived from soft noise; bend and duplicate features subtly through refraction. Add bright specular rims and clean caustic streaks; apply a slight RGB misregister (1–2 px) for chromatic dispersion. Background remains dark to mid, with faint reflected streaks; glow is minimal.",
    updatedAt: "2025-10-30 17:07:29.908011+00",
  },
},
{
  id: "deco-royale",
  name: "Deco Royale",
  numericId: 15,
  tone: "signature",
  tier: "premium",
  prompt: {
    numericId: 15,
    prompt: "Recreate the exact image in a bold, modern Art Deco style — a dramatic fusion of classic glamour and contemporary edge. Maintain the subject's full composition, pose, and spatial layout with high fidelity. Apply rich, dimensional lighting and sharp, clean linework to create a sense of depth and visual focus. Use strong geometric framing, symmetry, and gold accents to echo iconic Deco architecture, balanced with smooth digital gradients and matte finishes. Emphasize a luxury palette — including deep teal, navy, black, gold, blush, and cream — for a sophisticated, high-impact aesthetic. The result should feel like a cinematic poster or luxury magazine cover: expressive, powerful, and timelessly stylish.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "the-renaissance",
  name: "The Renaissance",
  numericId: 42,
  tone: "signature",
  tier: "premium",
  prompt: {
    numericId: 42,
    prompt: "Recreate the exact image as a baroque/renaissance oil masterwork — rich chiaroscuro, velvety blacks, and tactile brushwork — enhanced with genuine gold-leaf ornament. Preserve the subject’s composition, pose, anatomy, and expression. Paint with layered glazes and controlled impasto; let warm candlelight model the face and hands. Add restrained gilding: garment trim, or frame cartouche that catches specular highlights and casts subtle gilt reflections onto nearby paint. Keep color harmonies in deep umbers, oxblood, ultramarine, and cream. The result should feel museum-caliber: dramatic, devotional, and exquisitely finished.",
    updatedAt: "2025-10-30 17:15:51.172479+00",
  },
},
{
  id: "sanctuary-glow",
  name: "Sanctuary Glow",
  numericId: 43,
  tone: "signature",
  tier: "premium",
  prompt: {
    numericId: 43,
    prompt: "Recreate the exact image as a luminous stained-glass window — leaded panes, jewel tones, and sunlit bloom. Preserve the subject’s pose, proportions, and facial readability while segmenting forms into glass panels bordered by realistic came (lead) lines. Use deep sapphire, ruby, emerald, and amber with faint seed bubbles and subtle internal gradients to simulate real glass. Introduce directional “cathedral” sunlight that passes through the panes, creating haloed edges, color spill, and soft caustic patterns on background surfaces. Keep detail micro-panes for eyes and hands; use larger panes for broader planes. The result should feel sacred and cinematic, as if the portrait were installed high in a grand nave.",
    updatedAt: "2025-10-30 17:17:20.746361+00",
  },
}
];

export const EDGE_STYLE_BY_NAME = new Map(
  EDGE_STYLE_REGISTRY.map((style) => [style.name, style])
);

export const EDGE_STYLE_BY_SLUG = new Map(
  EDGE_STYLE_REGISTRY.map((style) => [style.id, style])
);

export const EDGE_STYLE_BY_ID = new Map(
  EDGE_STYLE_REGISTRY.filter((style) => style.numericId !== null).map((style) => [style.numericId as number, style])
);
