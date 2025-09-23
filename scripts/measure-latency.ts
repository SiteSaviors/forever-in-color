#!/usr/bin/env node
/*
  Simple harness to measure p50/p95 latency for the edge function.
  - Makes N POST requests with provided JSON body
  - Extracts `.duration` from response JSON; if not present, measures wall time
  - Writes results to stdout and an optional output file

  Usage:
    node scripts/measure-latency.ts \
      --url https://<edge-domain>/functions/v1/generate-style-preview \
      --body ./scripts/sample-body.json \
      --count 100 \
      --concurrency 5 \
      --out v1_durations.txt

  For v2 async mode, supply a status endpoint hook via --status-url and a field --request-id-key if needed.
*/

import fs from 'node:fs';
import path from 'node:path';

interface Args {
  url: string;
  bodyPath?: string;
  bodyInline?: string;
  count: number;
  concurrency: number;
  out?: string;
  warmup: number;
  headers?: string[];
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const url = get('--url');
  if (!url) {
    console.error('Missing --url');
    process.exit(1);
  }
  const bodyPath = get('--body');
  const bodyInline = get('--body-inline');
  const count = parseInt(get('--count') || '50', 10);
  const concurrency = parseInt(get('--concurrency') || '5', 10);
  const out = get('--out');
  const warmup = parseInt(get('--warmup') || '5', 10);
  const headersArg = get('--headers');
  const headers = headersArg ? headersArg.split(',') : undefined; // e.g. "Authorization: Bearer X-Token"
  return { url, bodyPath, bodyInline, count, concurrency, out, warmup, headers } as Args;
}

function parseHeaders(kvs?: string[]): Record<string, string> | undefined {
  if (!kvs) return undefined;
  const h: Record<string, string> = {};
  for (const kv of kvs) {
    const idx = kv.indexOf(':');
    if (idx === -1) continue;
    const k = kv.slice(0, idx).trim();
    const v = kv.slice(idx + 1).trim();
    if (k) h[k] = v;
  }
  return h;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.floor(p * (sorted.length - 1));
  return sorted[idx];
}

async function main() {
  const { url, bodyPath, bodyInline, count, concurrency, out, warmup, headers } = parseArgs();
  const hdrs: Record<string, string> = { 'Content-Type': 'application/json', ...(parseHeaders(headers) || {}) };
  const body = bodyInline
    ? bodyInline
    : bodyPath
    ? fs.readFileSync(path.resolve(bodyPath), 'utf8')
    : JSON.stringify({ imageUrl: 'data:image/png;base64,', style: 'Classic Oil Painting', aspectRatio: '1:1', quality: 'medium' });

  const results: number[] = [];

  async function oneRun(i: number, warmupMode = false) {
    const t0 = Date.now();
    const res = await fetch(url, { method: 'POST', headers: hdrs, body });
    const t1 = Date.now();
    let dur = t1 - t0;
    try {
      const json = await res.json();
      if (typeof json?.duration === 'number') {
        dur = json.duration;
      }
    } catch (_err) {
      // ignore JSON parse errors; fallback to wall-clock duration
    }
    if (!warmupMode) results.push(dur);
  }

  // Warm-up
  for (let i = 0; i < warmup; i++) {
    await oneRun(i, true);
  }

  // Concurrent runs
  let inFlight = 0;
  let idx = 0;
  await new Promise<void>((resolve) => {
    const pump = () => {
      while (inFlight < concurrency && idx < count) {
        const i = idx++;
        inFlight++;
        oneRun(i).finally(() => {
          inFlight--;
          if (results.length >= count) resolve();
          else pump();
        });
      }
    };
    pump();
  });

  const p50 = percentile(results, 0.5);
  const p95 = percentile(results, 0.95);
  const min = Math.min(...results);
  const max = Math.max(...results);
  const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);

  const report = { samples: results.length, min, p50, p95, max, avg };
  console.log(JSON.stringify(report));

  if (out) {
    const lines = results.map((d, i) => `${i + 1} ${d}`).join('\n');
    fs.writeFileSync(out, lines + '\n');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
