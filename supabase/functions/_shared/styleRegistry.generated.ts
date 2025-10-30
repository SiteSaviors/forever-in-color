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
  tone: "trending",
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
  numericId: null,
  tone: "abstract",
  tier: "free",
  prompt: null,
},
{
  id: "prisma-tesla",
  name: "Prisma Tesla",
  numericId: null,
  tone: "abstract",
  tier: "free",
  prompt: null,
},
{
  id: "op-art-pulse",
  name: "Op Art Pulse",
  numericId: null,
  tone: "abstract",
  tier: "free",
  prompt: null,
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
    prompt: "Recreate this exact image as electric glow neon art — with the subject outlined in glowing lines, surrounded by radiant highlights and pulsing neon energy. Maintain the subject's exact pose, facial details, and composition, while enhancing it with bold contrast, vibrant lighting, and an expressive aura. Use high-energy light trails, edge-lit glow, and a mix of fluorescent and electric tones to evoke a sense of power and presence — like a vivid memory lit from within.",
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
    prompt: "Recreate the exact image as a UV-neon drip/splatter painting. Preserve the full structure of the subject with a clean silhouette. Fluorescent accents: hot pink, electric blue, acid green, violet, and citrus orange. Build bold color fields, then layer sprays, splatter bursts, and gravity drips. Add soft neon bloom and thin rim-light glow along fast contours; use overspray speckle sparingly.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "casso-cubist",
  name: "Casso Cubist",
  numericId: null,
  tone: "abstract",
  tier: "premium",
  prompt: null,
},
{
  id: "sumi-ink-whisper",
  name: "Sumi Ink Whisper",
  numericId: null,
  tone: "abstract",
  tier: "premium",
  prompt: null,
},
{
  id: "abstract-chorus",
  name: "Abstract Chorus",
  numericId: null,
  tone: "abstract",
  tier: "premium",
  prompt: null,
},
{
  id: "voxel-arcade",
  name: "Voxel Arcade",
  numericId: null,
  tone: "electric",
  tier: "premium",
  prompt: null,
},
{
  id: "retro-synthwave",
  name: "Retro Synthwave",
  numericId: null,
  tone: "electric",
  tier: "premium",
  prompt: null,
},
{
  id: "holowire-prism",
  name: "Holowire Prism",
  numericId: 6,
  tone: "electric",
  tier: "premium",
  prompt: {
    numericId: 6,
    prompt: "Recreate the exact image as an artistic low poly illustration — colorful, faceted, and compositionally accurate. Preserve the full subject structure, including precise pose, facial features, proportions, and spatial layout. Break the image into angular geometric polygons of varied sizes, using bold color blocking and gradient transitions to reflect natural shading. Emphasize artistic abstraction through clean edges and stylized fragmentation, while maintaining visual clarity and realism in the subject. The result should feel modern and decorative — like a vibrant digital mosaic that's both expressive and true to the original form.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "deco-luxe",
  name: "Deco Luxe",
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
  id: "signature-aurora",
  name: "Aurora Signature",
  numericId: null,
  tone: "signature",
  tier: "premium",
  prompt: null,
},
{
  id: "porcelain-figurine",
  name: "Porcelain Figurine",
  numericId: 28,
  tone: "signature",
  tier: "premium",
  prompt: {
    numericId: 28,
    prompt: "Recreate the exact image as a glazed porcelain/ceramic figurine — glossy, delicate, and collectible. Preserve full structure and pose, then smooth forms to rounded, toy-like geometry. Coat surfaces with high-gloss glaze: tight specular highlights, pooling at creases, and tiny pinhole bubbles; add gold luster edge trims sparingly. Use a curated pastel palette with 1–2 jewel accents. Place on a soft tabletop shadow. The result should feel like a premium ceramic keepsake",
    updatedAt: "2025-10-16 07:13:28.066242+00",
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
