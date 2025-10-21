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
  numericId: null,
  tone: "classic",
  tier: "free",
  prompt: null,
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
  numericId: null,
  tone: "modern",
  tier: "free",
  prompt: null,
},
{
  id: "dot-symphony",
  name: "Dot Symphony",
  numericId: null,
  tone: "modern",
  tier: "free",
  prompt: null,
},
{
  id: "fauve-splash",
  name: "Fauve Splash",
  numericId: null,
  tone: "modern",
  tier: "free",
  prompt: null,
},
{
  id: "swiss-grid",
  name: "Swiss Grid",
  numericId: null,
  tone: "modern",
  tier: "free",
  prompt: null,
},
{
  id: "riso-punch",
  name: "Riso Punch",
  numericId: null,
  tone: "modern",
  tier: "free",
  prompt: null,
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
  id: "pop-art-burst",
  name: "Pop Art Burst",
  numericId: 9,
  tone: "stylized",
  tier: "free",
  prompt: {
    numericId: 9,
    prompt: "Recreate the exact image in a bold comic-style pop art illustration — inspired by vintage halftone printing and retro poster design. Maintain the full composition and subject structure, including accurate pose, proportions, facial features, and spatial layout. Apply thick black outlines, flat color blocking, and vibrant, saturated tones — especially reds, blues, and yellows — to create a high-impact graphic look. Use dense halftone dot textures to add visual rhythm and dimension across both subject and background. The final image should be energetic and expressive, while staying true to the subject's original form and mood, like a stylized moment frozen in a vintage comic book.",
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
  id: "electric-bloom",
  name: "Electric Bloom",
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
  id: "deco-luxe",
  name: "Deco Luxe",
  numericId: 15,
  tone: "stylized",
  tier: "free",
  prompt: {
    numericId: 15,
    prompt: "Recreate the exact image in a bold, modern Art Deco style — a dramatic fusion of classic glamour and contemporary edge. Maintain the subject's full composition, pose, and spatial layout with high fidelity. Apply rich, dimensional lighting and sharp, clean linework to create a sense of depth and visual focus. Use strong geometric framing, symmetry, and gold accents to echo iconic Deco architecture, balanced with smooth digital gradients and matte finishes. Emphasize a luxury palette — including deep teal, navy, black, gold, blush, and cream — for a sophisticated, high-impact aesthetic. The result should feel like a cinematic poster or luxury magazine cover: expressive, powerful, and timelessly stylish.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "abstract-fusion",
  name: "Abstract Fusion",
  numericId: 13,
  tone: "abstract",
  tier: "free",
  prompt: {
    numericId: 13,
    prompt: "Create abstract fusion art by blending watercolor, digital textures, and geometric patterns into a cohesive, expressive, multi-style composition. CRITICAL: Preserve the EXACT same person - same face, same eye color, same expression, same proportions, same pose. Do not alter any facial features, anatomical structure, or identifying characteristics.",
    updatedAt: "2025-10-16 07:13:28.066242+00",
  },
},
{
  id: "gemstone-poly",
  name: "Gemstone Poly",
  numericId: 6,
  tone: "electric",
  tier: "free",
  prompt: {
    numericId: 6,
    prompt: "Recreate the exact image as an artistic low poly illustration — colorful, faceted, and compositionally accurate. Preserve the full subject structure, including precise pose, facial features, proportions, and spatial layout. Break the image into angular geometric polygons of varied sizes, using bold color blocking and gradient transitions to reflect natural shading. Emphasize artistic abstraction through clean edges and stylized fragmentation, while maintaining visual clarity and realism in the subject. The result should feel modern and decorative — like a vibrant digital mosaic that's both expressive and true to the original form.",
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
