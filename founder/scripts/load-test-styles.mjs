#!/usr/bin/env node
const fetch = globalThis.fetch || (await import('node-fetch')).default;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const TEST_IMAGE_URL = process.env.TEST_IMAGE_URL || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=90';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

const styles = [
  { id: 'classic-oil-painting', name: 'Classic Oil Painting', aspect: '1:1' },
  { id: 'watercolor-dreams', name: 'Watercolor Dreams', aspect: '1:1' },
  { id: 'neon-splash', name: 'Neon Splash', aspect: '3:2' },
  { id: 'artisan-charcoal', name: 'Artisan Charcoal', aspect: '2:3' },
  { id: 'gemstone-poly', name: 'Gemstone Poly', aspect: '1:1' },
];

const pollStatus = async (requestId) => {
  const statusUrl = `${SUPABASE_URL}/functions/v1/generate-style-preview/status?requestId=${encodeURIComponent(requestId)}`;
  let attempt = 0;
  while (attempt < 25) {
    const res = await fetch(statusUrl, { headers });
    if (!res.ok) throw new Error(`Status check failed (${res.status})`);
    const body = await res.json();
    const normalized = body.status?.toLowerCase();
    if ((normalized === 'succeeded' || normalized === 'complete') && body.preview_url) {
      return { url: body.preview_url, raw: body };
    }
    if (normalized === 'failed' || normalized === 'error') {
      throw new Error(body.error || 'Generation failed');
    }
    await new Promise((resolve) => setTimeout(resolve, 600 + attempt * 150));
    attempt += 1;
  }
  throw new Error('Timed out waiting for preview');
};

const callPreview = async (style, iteration) => {
  const payload = {
    imageUrl: TEST_IMAGE_URL,
    style: style.id,
    photoId: `${style.id}-${Date.now()}-${iteration}`,
    aspectRatio: style.aspect,
    watermark: false,
    quality: 'medium',
    isAuthenticated: false,
  };

  const start = Date.now();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-style-preview`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Generation call failed (${res.status})`);
  }

  const body = await res.json();
  let previewUrl = body.preview_url;
  if (!previewUrl && body.requestId) {
    const pollResult = await pollStatus(body.requestId);
    previewUrl = pollResult.url;
  }

  const duration = Date.now() - start;
  return { duration, response: body, previewUrl };
};

(async () => {
  console.info('Running style load test…');
  for (const style of styles) {
    console.info(`\nStyle: ${style.name}`);
    try {
      const first = await callPreview(style, 1);
      console.info(`  Pass 1: ${first.duration}ms (status=${first.response.status})`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      const second = await callPreview(style, 2);
      console.info(`  Pass 2: ${second.duration}ms (status=${second.response.status})`);
    } catch (error) {
      console.error(`  Error generating ${style.name}:`, error.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.info('\nLoad test complete.');
})();
