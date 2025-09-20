/*
# Update style_prompts table with custom prompts

1. Changes
   - Adds custom prompts to the style_prompts table if it exists
   - Creates the table first if it doesn't exist
   - Handles the case where the table already exists
   - Creates an index for faster lookups
*/

-- Create the style_prompts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'style_prompts') THEN
    CREATE TABLE public.style_prompts (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      style_id INTEGER NOT NULL UNIQUE,
      prompt TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Insert or update custom prompts
DO $$
BEGIN
  -- Style 1: Original Image
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 1) THEN
    UPDATE public.style_prompts SET prompt = 'Keep the image exactly as is, no artistic transformation', updated_at = now() WHERE style_id = 1;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (1, 'Keep the image exactly as is, no artistic transformation');
  END IF;

  -- Style 2: Classic Oil Painting
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 2) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image as a majestic oil painting, evoking a sense of timeless elegance, with meticulous attention to detail and subtle texture, characteristic of traditional realism. Employ smooth, expressive brushstrokes that convey a sense of refinement, and a harmonious palette of natural tones, reminiscent of old masters. Soft, warm lighting casts a gentle glow on the subject, accentuating the subtle play of shadows and highlights. The composition is thoughtfully arranged, with a clear sense of balance and harmony, drawing the viewer''s eye to the central figure. The subject''s pose, facial features, and skin tone are meticulously preserved, with a focus on capturing the subtleties of expression, inviting the viewer to connect with the subject on a deeper level.', updated_at = now() WHERE style_id = 2;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (2, 'Recreate the exact image as a majestic oil painting, evoking a sense of timeless elegance, with meticulous attention to detail and subtle texture, characteristic of traditional realism. Employ smooth, expressive brushstrokes that convey a sense of refinement, and a harmonious palette of natural tones, reminiscent of old masters. Soft, warm lighting casts a gentle glow on the subject, accentuating the subtle play of shadows and highlights. The composition is thoughtfully arranged, with a clear sense of balance and harmony, drawing the viewer''s eye to the central figure. The subject''s pose, facial features, and skin tone are meticulously preserved, with a focus on capturing the subtleties of expression, inviting the viewer to connect with the subject on a deeper level.');
  END IF;

  -- Style 4: Watercolor Dreams
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 4) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image in an expressive watercolor style — bold, dynamic, and emotionally vibrant. Preserve the full composition and structure of the subject, including the subject''s pose, features, proportions, and spatial arrangement. Use loose, energetic brushwork, vivid splashes of color, and spontaneous paint drips to convey movement and feeling. Let pigments flow and merge unpredictably, creating a painterly abstraction around the subject without distorting the core details. Emphasize contrast, texture, and fluid transitions, with a sense of joyful chaos that enhances — not overwhelms — the subject''s presence. The result should feel alive and impressionistic, yet true to the original image.', updated_at = now() WHERE style_id = 4;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (4, 'Recreate the exact image in an expressive watercolor style — bold, dynamic, and emotionally vibrant. Preserve the full composition and structure of the subject, including the subject''s pose, features, proportions, and spatial arrangement. Use loose, energetic brushwork, vivid splashes of color, and spontaneous paint drips to convey movement and feeling. Let pigments flow and merge unpredictably, creating a painterly abstraction around the subject without distorting the core details. Emphasize contrast, texture, and fluid transitions, with a sense of joyful chaos that enhances — not overwhelms — the subject''s presence. The result should feel alive and impressionistic, yet true to the original image.');
  END IF;

  -- Style 5: Pastel Bliss
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 5) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image in a soft pastel illustration style — calming and emotionally warm, with clearly defined forms and balanced contrast. Preserve the full composition and subject structure, including accurate pose, features, proportions, and spatial layout. Use smooth shading and subtle blending between gentle pastel hues — but ensure the subject remains crisp and well-defined against the background. Avoid overly washed-out or faded tones; instead, apply light colors with intention and depth, creating a soft yet vibrant rendering. The final image should feel peaceful and nostalgic, while still vivid and visually engaging.', updated_at = now() WHERE style_id = 5;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (5, 'Recreate the exact image in a soft pastel illustration style — calming and emotionally warm, with clearly defined forms and balanced contrast. Preserve the full composition and subject structure, including accurate pose, features, proportions, and spatial layout. Use smooth shading and subtle blending between gentle pastel hues — but ensure the subject remains crisp and well-defined against the background. Avoid overly washed-out or faded tones; instead, apply light colors with intention and depth, creating a soft yet vibrant rendering. The final image should feel peaceful and nostalgic, while still vivid and visually engaging.');
  END IF;

  -- Style 6: Gemstone Poly
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 6) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image as an artistic low poly illustration — colorful, faceted, and compositionally accurate. Preserve the full subject structure, including precise pose, facial features, proportions, and spatial layout. Break the image into angular geometric polygons of varied sizes, using bold color blocking and gradient transitions to reflect natural shading. Emphasize artistic abstraction through clean edges and stylized fragmentation, while maintaining visual clarity and realism in the subject. The result should feel modern and decorative — like a vibrant digital mosaic that''s both expressive and true to the original form.', updated_at = now() WHERE style_id = 6;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (6, 'Recreate the exact image as an artistic low poly illustration — colorful, faceted, and compositionally accurate. Preserve the full subject structure, including precise pose, facial features, proportions, and spatial layout. Break the image into angular geometric polygons of varied sizes, using bold color blocking and gradient transitions to reflect natural shading. Emphasize artistic abstraction through clean edges and stylized fragmentation, while maintaining visual clarity and realism in the subject. The result should feel modern and decorative — like a vibrant digital mosaic that''s both expressive and true to the original form.');
  END IF;

  -- Style 7: 3D Storybook
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 7) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image as a stylized 3D illustration — expressive, playful, and visually engaging. Preserve the full composition and structure of the original subject, including accurate shape, proportions, and spatial layout. Render the subject with smooth, rounded modeling, vibrant colors, and soft lighting to create a polished, animated look. Use exaggerated but intentional design elements to enhance personality and charm, whether the subject is a person, pet, vehicle, building, or object. The final image should feel joyful and dynamic, like a scene from a Pixar or Fortnite-style animated world — stylized yet true to the original form.', updated_at = now() WHERE style_id = 7;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (7, 'Recreate the exact image as a stylized 3D illustration — expressive, playful, and visually engaging. Preserve the full composition and structure of the original subject, including accurate shape, proportions, and spatial layout. Render the subject with smooth, rounded modeling, vibrant colors, and soft lighting to create a polished, animated look. Use exaggerated but intentional design elements to enhance personality and charm, whether the subject is a person, pet, vehicle, building, or object. The final image should feel joyful and dynamic, like a scene from a Pixar or Fortnite-style animated world — stylized yet true to the original form.');
  END IF;

  -- Style 8: Artisan Charcoal
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 8) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image as a detailed charcoal sketch — textured, hand-drawn, and expressive. Preserve the full structure and composition of the original subject, including accurate proportions, angles, and spatial arrangement. Use rich crosshatching, soft smudging, and tonal shading to build form and depth, mimicking traditional charcoal on textured paper. Keep the subject''s details clear and intact while rendering them in a warm, monochromatic palette. The result should feel timeless and handcrafted, like a finely rendered charcoal illustration that blends realism with artistic character.', updated_at = now() WHERE style_id = 8;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (8, 'Recreate the exact image as a detailed charcoal sketch — textured, hand-drawn, and expressive. Preserve the full structure and composition of the original subject, including accurate proportions, angles, and spatial arrangement. Use rich crosshatching, soft smudging, and tonal shading to build form and depth, mimicking traditional charcoal on textured paper. Keep the subject''s details clear and intact while rendering them in a warm, monochromatic palette. The result should feel timeless and handcrafted, like a finely rendered charcoal illustration that blends realism with artistic character.');
  END IF;

  -- Style 9: Pop Art Burst
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 9) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image in a bold comic-style pop art illustration — inspired by vintage halftone printing and retro poster design. Maintain the full composition and subject structure, including accurate pose, proportions, facial features, and spatial layout. Apply thick black outlines, flat color blocking, and vibrant, saturated tones — especially reds, blues, and yellows — to create a high-impact graphic look. Use dense halftone dot textures to add visual rhythm and dimension across both subject and background. The final image should be energetic and expressive, while staying true to the subject''s original form and mood, like a stylized moment frozen in a vintage comic book.', updated_at = now() WHERE style_id = 9;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (9, 'Recreate the exact image in a bold comic-style pop art illustration — inspired by vintage halftone printing and retro poster design. Maintain the full composition and subject structure, including accurate pose, proportions, facial features, and spatial layout. Apply thick black outlines, flat color blocking, and vibrant, saturated tones — especially reds, blues, and yellows — to create a high-impact graphic look. Use dense halftone dot textures to add visual rhythm and dimension across both subject and background. The final image should be energetic and expressive, while staying true to the subject''s original form and mood, like a stylized moment frozen in a vintage comic book.');
  END IF;

  -- Style 10: Neon Splash
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 10) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image in a dynamic Neon Splash style — electric, expressive, and bursting with high-intensity energy. Preserve the full subject composition, pose, and proportions with accurate facial features and visual structure. Surround the scene with vivid neon paint splashes, glowing outlines, and abstract light trails that radiate from the subject. Use a high-contrast color palette with hot pinks, electric blues, purples, and glowing oranges. Incorporate kinetic strokes, scatter effects, and surreal lighting to convey movement and emotion. The final image should feel like a glowing explosion of joy, power, and motion — where color and light collide in a captivating, artistic storm', updated_at = now() WHERE style_id = 10;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (10, 'Recreate the exact image in a dynamic Neon Splash style — electric, expressive, and bursting with high-intensity energy. Preserve the full subject composition, pose, and proportions with accurate facial features and visual structure. Surround the scene with vivid neon paint splashes, glowing outlines, and abstract light trails that radiate from the subject. Use a high-contrast color palette with hot pinks, electric blues, purples, and glowing oranges. Incorporate kinetic strokes, scatter effects, and surreal lighting to convey movement and emotion. The final image should feel like a glowing explosion of joy, power, and motion — where color and light collide in a captivating, artistic storm');
  END IF;

  -- Style 11: Electric Bloom
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 11) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate this exact image as electric glow neon art — with the subject outlined in glowing lines, surrounded by radiant highlights and pulsing neon energy. Maintain the subject''s exact pose, facial details, and composition, while enhancing it with bold contrast, vibrant lighting, and an expressive aura. Use high-energy light trails, edge-lit glow, and a mix of fluorescent and electric tones to evoke a sense of power and presence — like a vivid memory lit from within.', updated_at = now() WHERE style_id = 11;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (11, 'Recreate this exact image as electric glow neon art — with the subject outlined in glowing lines, surrounded by radiant highlights and pulsing neon energy. Maintain the subject''s exact pose, facial details, and composition, while enhancing it with bold contrast, vibrant lighting, and an expressive aura. Use high-energy light trails, edge-lit glow, and a mix of fluorescent and electric tones to evoke a sense of power and presence — like a vivid memory lit from within.');
  END IF;

  -- Style 13: Abstract Fusion
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 13) THEN
    UPDATE public.style_prompts SET prompt = 'Create abstract fusion art by blending watercolor, digital textures, and geometric patterns into a cohesive, expressive, multi-style composition. CRITICAL: Preserve the EXACT same person - same face, same eye color, same expression, same proportions, same pose. Do not alter any facial features, anatomical structure, or identifying characteristics.', updated_at = now() WHERE style_id = 13;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (13, 'Create abstract fusion art by blending watercolor, digital textures, and geometric patterns into a cohesive, expressive, multi-style composition. CRITICAL: Preserve the EXACT same person - same face, same eye color, same expression, same proportions, same pose. Do not alter any facial features, anatomical structure, or identifying characteristics.');
  END IF;

  -- Style 15: Deco Luxe
  IF EXISTS (SELECT 1 FROM public.style_prompts WHERE style_id = 15) THEN
    UPDATE public.style_prompts SET prompt = 'Recreate the exact image in a bold, modern Art Deco style — a dramatic fusion of classic glamour and contemporary edge. Maintain the subject''s full composition, pose, and spatial layout with high fidelity. Apply rich, dimensional lighting and sharp, clean linework to create a sense of depth and visual focus. Use strong geometric framing, symmetry, and gold accents to echo iconic Deco architecture, balanced with smooth digital gradients and matte finishes. Emphasize a luxury palette — including deep teal, navy, black, gold, blush, and cream — for a sophisticated, high-impact aesthetic. The result should feel like a cinematic poster or luxury magazine cover: expressive, powerful, and timelessly stylish.', updated_at = now() WHERE style_id = 15;
  ELSE
    INSERT INTO public.style_prompts (style_id, prompt) VALUES (15, 'Recreate the exact image in a bold, modern Art Deco style — a dramatic fusion of classic glamour and contemporary edge. Maintain the subject''s full composition, pose, and spatial layout with high fidelity. Apply rich, dimensional lighting and sharp, clean linework to create a sense of depth and visual focus. Use strong geometric framing, symmetry, and gold accents to echo iconic Deco architecture, balanced with smooth digital gradients and matte finishes. Emphasize a luxury palette — including deep teal, navy, black, gold, blush, and cream — for a sophisticated, high-impact aesthetic. The result should feel like a cinematic poster or luxury magazine cover: expressive, powerful, and timelessly stylish.');
  END IF;
END $$;

-- Create an index for faster lookups if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'style_prompts' 
    AND indexname = 'idx_style_prompts_style_id'
  ) THEN
    CREATE INDEX idx_style_prompts_style_id ON public.style_prompts(style_id);
  END IF;
END $$;