import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { StylePromptService } from './stylePromptService.ts';
import { handleCorsPreflightRequest, createCorsResponse } from './corsUtils.ts';
import { validateRequest } from './requestValidator.ts';
import { ReplicateService } from './replicateService.ts';
import { createSuccessResponse, createErrorResponse } from './responseUtils.ts';
import {
  getPromptCacheConfig,
  getCachedPrompt,
  setCachedPrompt,
  schedulePromptWarmup,
  type PromptWarmupResult
} from './promptCache.ts';
import { CacheMetadataService } from './cache/cacheMetadataService.ts';
import { PreviewStorageClient } from './cache/storageClient.ts';
import { createImageDigest, buildCacheKey } from './cache/cacheKey.ts';
import { LruMemoryCache } from './cache/memoryCache.ts';
import { createRequestLogger } from './logging.ts';
import type { CacheStatus } from './types.ts';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const cacheEnabledGlobally = (Deno.env.get('PREVIEW_CACHE_ENABLED') ?? 'true').toLowerCase() !== 'false';
const ttlDays = parsePositiveInt(Deno.env.get('PREVIEW_CACHE_TTL_DAYS'), 30);
const ttlMs = ttlDays * ONE_DAY_MS;
const memoryCapacity = parsePositiveInt(Deno.env.get('PREVIEW_CACHE_MAX_MEMORY_ITEMS'), 256);
const cacheBucket = Deno.env.get('PREVIEW_CACHE_BUCKET') ?? 'preview-cache';
const asyncEnabled = (Deno.env.get('PREVIEW_ASYNC_ENABLED') ?? 'false').toLowerCase() === 'true';
const webhookBaseUrl = Deno.env.get('PREVIEW_WEBHOOK_BASE_URL');
const webhookSecret = Deno.env.get('PREVIEW_WEBHOOK_SECRET');

const memoryCache = new LruMemoryCache<string>(memoryCapacity);

const initializeWarmup = (() => {
  let initialized = false;
  return (stylePromptService: StylePromptService) => {
    if (initialized) return;
    initialized = true;

    const config = getPromptCacheConfig();
    if (!config.enabled) {
      return;
    }

    schedulePromptWarmup(async (styleName): Promise<PromptWarmupResult | null> => {
      const metadata = await stylePromptService.getStylePromptWithMetadata(styleName);
      if (!metadata || !metadata.prompt) {
        return metadata ? { ...metadata, prompt: metadata.prompt ?? null } : null;
      }
      return {
        prompt: metadata.prompt,
        styleId: metadata.styleId,
        styleVersion: metadata.styleVersion
      };
    });
  };
})();

async function normalizeImageInput(image: string): Promise<string> {
  if (image.startsWith('data:image/')) {
    return image;
  }

  try {
    const response = await fetch(image);
    if (!response.ok) {
      throw new Error(`Image fetch failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return `data:${contentType};base64,${base64}`;
  } catch (_error) {
    console.error('Failed to normalize image input:', error);
    return image;
  }
}

function buildFallbackPrompt(style: string): string {
  return `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;
}

const isExpired = (isoDate: string): boolean => {
  const expiresAt = Date.parse(isoDate);
  return Number.isNaN(expiresAt) || expiresAt <= Date.now();
};

const computeStoragePath = (styleId: number, aspectRatio: string, quality: string, imageDigest: string): string => {
  const sanitizedAspect = aspectRatio.toLowerCase();
  const sanitizedQuality = quality.toLowerCase();
  return `${styleId}/${sanitizedQuality}/${sanitizedAspect}/${imageDigest}.jpg`;
};

async function handleWebhookRequest(req: Request, url: URL): Promise<Response> {
  if (!webhookSecret) {
    return createCorsResponse(JSON.stringify({ ok: false, error: 'webhook_not_configured' }), 500);
  }

  const token = url.searchParams.get('token');
  if (token !== webhookSecret) {
    return createCorsResponse(JSON.stringify({ ok: false, error: 'unauthorized' }), 401);
  }

  try {
    const body = await req.json();
    const status = body?.status as string | undefined ?? 'unknown';
    const predictionId = body?.id as string | undefined;
    const input = body?.input ?? {};
    const requestId = input?.request_id as string | undefined;
    const webhookLogger = createRequestLogger((requestId ?? predictionId ?? 'webhook').toString());
    let output = body?.output as string | string[] | undefined;
    if (Array.isArray(output)) {
      output = output[0];
    }
    const _errorMsg = body?.error as string | undefined;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return createCorsResponse(JSON.stringify({ ok: false, error: 'configuration_error' }), 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const cacheMetadataService = new CacheMetadataService(supabase);
    const storageClient = new PreviewStorageClient(supabase, cacheBucket);

    const identifierColumn = requestId ? 'request_id' : 'prediction_id';
    const identifier = requestId ?? predictionId;

    if (!identifier) {
      return createCorsResponse(JSON.stringify({ ok: false, error: 'missing_request' }), 400);
    }

    const { data: statusRow, error: statusError } = await supabase
      .from('previews_status')
      .select('*')
      .eq(identifierColumn, identifier)
      .single();

    if (statusError || !statusRow) {
      return createCorsResponse(JSON.stringify({ ok: false, error: 'status_not_found' }), 404);
    }

    let previewUrl: string | null = statusRow.preview_url ?? null;
    let cacheStatus: CacheStatus = 'miss';

    if (status === 'succeeded' && output) {
      try {
        const imageDigest = statusRow.image_digest as string | null;
        const styleId = statusRow.style_id as number | null;
        const styleVersion = statusRow.style_version as string | null;
        const aspectRatio = statusRow.aspect_ratio as string | null;
        const quality = statusRow.quality as string | null;
        const watermark = statusRow.watermark as boolean | null;
        const cacheAllowed = (statusRow.cache_allowed as boolean | null) ?? true;

        if (cacheAllowed && imageDigest && styleId && styleVersion && aspectRatio && quality && typeof watermark === 'boolean') {
          const cacheKey = buildCacheKey({
            imageDigest,
            styleId,
            styleVersion,
            aspectRatio,
            quality,
            watermark
          });

          const storagePath = computeStoragePath(styleId, aspectRatio, quality, imageDigest);
          const uploadResult = await storageClient.uploadFromUrl(output, storagePath);
          previewUrl = uploadResult.publicUrl;

          await cacheMetadataService.upsert({
            cacheKey,
            styleId,
            styleVersion,
            imageDigest,
            aspectRatio,
            quality,
            watermark,
            storagePath: uploadResult.storagePath,
            previewUrl: uploadResult.publicUrl,
            ttlExpiresAt: new Date(Date.now() + ttlMs).toISOString(),
            sourceRequestId: statusRow.request_id as string
          });

          memoryCache.set(cacheKey, uploadResult.publicUrl, ttlMs);
          cacheStatus = 'hit';
        } else {
          previewUrl = typeof output === 'string' ? output : null;
          cacheStatus = 'bypass';
        }
      } catch (cacheError) {
        webhookLogger.warn('Failed to persist cached preview from webhook', {
          requestId: statusRow.request_id,
          error: cacheError instanceof Error ? cacheError.message : String(cacheError)
        });
      }
    }

    const upsertPayload = {
      request_id: statusRow.request_id,
      prediction_id: predictionId ?? statusRow.prediction_id,
      status,
      preview_url: previewUrl,
      error: errorMsg ?? null,
      image_digest: statusRow.image_digest,
      style_id: statusRow.style_id,
      style_version: statusRow.style_version,
      aspect_ratio: statusRow.aspect_ratio,
      quality: statusRow.quality,
      watermark: statusRow.watermark,
      cache_allowed: statusRow.cache_allowed,
      created_at: statusRow.created_at,
      updated_at: new Date().toISOString()
    };

    await supabase.from('previews_status').upsert(upsertPayload, { onConflict: 'request_id' });

    webhookLogger.info('Processed preview webhook callback', {
      requestId: statusRow.request_id,
      predictionId: predictionId ?? statusRow.prediction_id,
      status,
      cacheStatus,
      hasPreview: Boolean(previewUrl)
    });

    return createCorsResponse(JSON.stringify({ ok: true, cacheStatus }), 200);
  } catch (_error) {
    console.error('Webhook handling failed', error);
    return createCorsResponse(JSON.stringify({ ok: false, error: 'webhook_error' }), 500);
  }
}

async function handleStatusRequest(url: URL): Promise<Response> {
  const requestId = url.searchParams.get('requestId');
  if (!requestId) {
    return createCorsResponse(JSON.stringify({ error: 'missing_requestId' }), 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return createCorsResponse(JSON.stringify({ error: 'configuration_error' }), 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('previews_status')
    .select('request_id,status,preview_url,error,prediction_id,updated_at')
    .eq('request_id', requestId)
    .single();

  if (error || !data) {
    return createCorsResponse(JSON.stringify({ error: 'not_found' }), 404);
  }

  return createCorsResponse(JSON.stringify(data), 200);
}

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  if (req.method === 'POST' && pathname.endsWith('/webhook')) {
    return handleWebhookRequest(req, url);
  }

  if (req.method === 'GET' && pathname.endsWith('/status')) {
    return handleStatusRequest(url);
  }

  if (req.method !== 'POST') {
    return createCorsResponse(
      JSON.stringify(createErrorResponse('method_not_allowed', 'Method not allowed')),
      405
    );
  }

  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const logger = createRequestLogger(requestId);

  try {
    const body = await req.json();
    const validation = validateRequest(body);

    if (!validation.isValid) {
      logger.warn('Request validation failed', { error: validation.error });
      return createCorsResponse(
        JSON.stringify(createErrorResponse('invalid_request', validation.error!)),
        400
      );
    }

    const {
      imageUrl,
      style,
      aspectRatio,
      quality,
      watermark = true,
      cacheBypass = false
    } = validation.data!;

    const normalizedAspectRatio = aspectRatio.toLowerCase();
    const normalizedQuality = quality.toLowerCase();

    const normalizedImageUrl = await normalizeImageInput(imageUrl);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !replicateApiToken || !supabaseUrl || !supabaseServiceKey) {
      logger.error('Missing required environment configuration');
      return createCorsResponse(
        JSON.stringify(createErrorResponse('configuration_error', 'AI service configuration error', requestId)),
        500
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stylePromptService = new StylePromptService(supabase);
    initializeWarmup(stylePromptService);

    const cacheMetadataService = new CacheMetadataService(supabase);
    const storageClient = new PreviewStorageClient(supabase, cacheBucket);

    let _promptCacheWasHit = false;
    let stylePrompt: string;
    let styleMetadata = await stylePromptService.getStylePromptWithMetadata(style);

    const cachedPrompt = getCachedPrompt(style);
    if (cachedPrompt) {
      const _promptCacheWasHit = true;
      stylePrompt = cachedPrompt.prompt;
      styleMetadata = {
        prompt: cachedPrompt.prompt,
        styleId: cachedPrompt.styleId,
        styleVersion: cachedPrompt.styleVersion
      };
      console.log('[prompt-cache]', {
        action: 'hit',
        style,
        requestId,
        source: cachedPrompt.source,
        ageMs: cachedPrompt.ageMs
      });
    } else {
      const promptFetchStart = Date.now();
      let fetchedMetadata = styleMetadata;

      if (!fetchedMetadata) {
        try {
          fetchedMetadata = await stylePromptService.getStylePromptWithMetadata(style);
        } catch (_error) {
          console.error('[prompt-cache]', {
            action: 'fetch_error',
            style,
            requestId,
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }

      const resolvedMetadata = fetchedMetadata ?? {
        prompt: null,
        styleVersion: '0',
        styleId: styleMetadata?.styleId ?? stylePromptService.resolveStyleId(style)
      };

      const promptFetchDurationMs = Date.now() - promptFetchStart;

      if (resolvedMetadata.prompt) {
        stylePrompt = resolvedMetadata.prompt;
        setCachedPrompt(style, {
          prompt: resolvedMetadata.prompt,
          styleId: resolvedMetadata.styleId,
          styleVersion: resolvedMetadata.styleVersion
        }, 'db');
      } else {
        stylePrompt = buildFallbackPrompt(style);
        setCachedPrompt(style, {
          prompt: stylePrompt,
          styleId: resolvedMetadata.styleId,
          styleVersion: resolvedMetadata.styleVersion
        }, 'fallback');
      }

      console.log('[prompt-cache]', {
        action: 'miss',
        style,
        requestId,
        fetchDurationMs: promptFetchDurationMs,
        source: resolvedMetadata.prompt ? 'db' : 'fallback'
      });

      styleMetadata = {
        prompt: stylePrompt,
        styleId: resolvedMetadata.styleId,
        styleVersion: resolvedMetadata.styleVersion
      };
    }

    if (!styleMetadata) {
      styleMetadata = {
        prompt: stylePrompt,
        styleId: stylePromptService.resolveStyleId(style),
        styleVersion: '0'
      };
    }

    const cacheAllowedForRequest = cacheEnabledGlobally && !cacheBypass;
    let cacheStatus: CacheStatus = cacheBypass ? 'bypass' : 'miss';
    const imageDigest = await createImageDigest(normalizedImageUrl);
    let cacheKey: string | null = null;

    if (cacheAllowedForRequest) {
      cacheKey = buildCacheKey({
        imageDigest,
        styleId: styleMetadata.styleId,
        styleVersion: styleMetadata.styleVersion,
        aspectRatio: normalizedAspectRatio,
        quality: normalizedQuality,
        watermark
      });

      const cachedFromMemory = memoryCache.get(cacheKey);
      if (cachedFromMemory) {
        cacheStatus = 'hit';
        logger.info('Cache hit (memory)', { cacheKey });
        cacheMetadataService.recordHit(cacheKey).catch((error) => {
          logger.warn('Failed to record cache hit', { error: error?.message ?? 'unknown', cacheKey });
        });
        const duration = Date.now() - startTime;
        return createCorsResponse(
          JSON.stringify(createSuccessResponse(cachedFromMemory, requestId, duration, cacheStatus))
        );
      }

      try {
        const metadataEntry = await cacheMetadataService.get(cacheKey);
        if (metadataEntry && metadataEntry.preview_url && !isExpired(metadataEntry.ttl_expires_at)) {
          cacheStatus = 'hit';
          const ttlRemaining = Date.parse(metadataEntry.ttl_expires_at) - Date.now();
          if (ttlRemaining > 0) {
            memoryCache.set(cacheKey, metadataEntry.preview_url, ttlRemaining);
          }
          logger.info('Cache hit (storage)', { cacheKey });
          cacheMetadataService.recordHit(cacheKey).catch((error) => {
            logger.warn('Failed to record cache hit', { error: error?.message ?? 'unknown', cacheKey });
          });
          const duration = Date.now() - startTime;
          return createCorsResponse(
            JSON.stringify(createSuccessResponse(metadataEntry.preview_url, requestId, duration, cacheStatus))
          );
        } else if (metadataEntry && metadataEntry.preview_url) {
          logger.info('Cache entry expired, regenerating', { cacheKey });
        }
      } catch (_error) {
        logger.warn('Cache metadata lookup failed', { error: error?.message ?? 'unknown', cacheKey });
      }
    }

    const persistGeneratedPreview = async (rawOutput: string): Promise<string> => {
      let finalPreviewUrl = rawOutput;

      if (cacheAllowedForRequest && cacheKey) {
        try {
          const storagePath = computeStoragePath(styleMetadata.styleId, normalizedAspectRatio, normalizedQuality, imageDigest);
          const ttlExpiresAt = new Date(Date.now() + ttlMs).toISOString();
          const uploadResult = await storageClient.uploadFromUrl(rawOutput, storagePath);
          finalPreviewUrl = uploadResult.publicUrl;

          await cacheMetadataService.upsert({
            cacheKey,
            styleId: styleMetadata.styleId,
            styleVersion: styleMetadata.styleVersion,
            imageDigest,
            aspectRatio: normalizedAspectRatio,
            quality: normalizedQuality,
            watermark,
            storagePath: uploadResult.storagePath,
            previewUrl: uploadResult.publicUrl,
            ttlExpiresAt,
            sourceRequestId: requestId
          });

          memoryCache.set(cacheKey, uploadResult.publicUrl, ttlMs);
          cacheStatus = 'hit';
        } catch (_error) {
          logger.warn('Failed to cache preview output', { error: error instanceof Error ? error.message : String(error), cacheKey, requestId });
        }
      } else if (!cacheAllowedForRequest) {
        cacheStatus = cacheBypass ? 'bypass' : cacheStatus;
      }

      return finalPreviewUrl;
    };

    const isAuthenticated = Boolean(body?.isAuthenticated);

    if (asyncEnabled && (!webhookBaseUrl || !webhookSecret)) {
      logger.warn('Async preview enabled but webhook configuration is incomplete. Falling back to synchronous mode.', {
        hasBaseUrl: Boolean(webhookBaseUrl),
        hasSecret: Boolean(webhookSecret)
      });
    }

    if (asyncEnabled && webhookBaseUrl && webhookSecret) {
      const webhookUrl = `${webhookBaseUrl.replace(/\/$/, '')}/functions/v1/generate-style-preview/webhook?token=${webhookSecret}`;
      const createBody = {
        input: {
          prompt: stylePrompt,
          input_images: [normalizedImageUrl],
          openai_api_key: openaiApiKey,
          aspect_ratio: normalizedAspectRatio,
          quality: normalizedQuality,
          request_id: requestId
        },
        webhook: webhookUrl,
        webhook_events_filter: ['completed', 'failed', 'canceled']
      } as const;

      const asyncResp = await fetch('https://api.replicate.com/v1/models/openai/gpt-image-1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${replicateApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createBody)
      });

      if (!asyncResp.ok) {
        const errTxt = await asyncResp.text();
        logger.error('Replicate async create failed', { requestId, status: asyncResp.status, errTxt });
        return createCorsResponse(
          JSON.stringify(createErrorResponse('generation_failed', `GPT-Image-1 API request failed: ${asyncResp.status} - ${errTxt}`, requestId)),
          503
        );
      }

      const asyncData = await asyncResp.json();

      if (asyncData?.status === 'succeeded' && asyncData?.output) {
        const immediateOutput = Array.isArray(asyncData.output) ? asyncData.output[0] : asyncData.output;
        const finalPreviewUrl = await persistGeneratedPreview(immediateOutput);
        const duration = Date.now() - startTime;

        await supabase.from('previews_status').upsert({
          request_id: requestId,
          prediction_id: asyncData?.id ?? null,
          status: 'succeeded',
          preview_url: finalPreviewUrl,
          error: null,
          image_digest: imageDigest,
          style_id: styleMetadata.styleId,
          style_version: styleMetadata.styleVersion,
          aspect_ratio: normalizedAspectRatio,
          quality: normalizedQuality,
          watermark,
          cache_allowed: cacheAllowedForRequest,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'request_id' });

        logger.info('Replicate returned immediate result', { requestId, cacheStatus });
        return createCorsResponse(
          JSON.stringify(createSuccessResponse(finalPreviewUrl, requestId, duration, cacheStatus)),
          200
        );
      }

      await supabase.from('previews_status').upsert({
        request_id: requestId,
        prediction_id: asyncData?.id ?? null,
        status: asyncData?.status ?? 'processing',
        preview_url: null,
        error: null,
        image_digest: imageDigest,
        style_id: styleMetadata.styleId,
        style_version: styleMetadata.styleVersion,
        aspect_ratio: normalizedAspectRatio,
        quality: normalizedQuality,
        watermark,
        cache_allowed: cacheAllowedForRequest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'request_id' });

      logger.info('Queued preview generation via webhook', {
        requestId,
        status: asyncData?.status ?? 'processing',
        cacheAllowedForRequest
      });

      return createCorsResponse(
        JSON.stringify({ requestId, status: asyncData?.status ?? 'processing', isAuthenticated }),
        202
      );
    }

    const replicateService = new ReplicateService(replicateApiToken, openaiApiKey);
    const replicateStart = Date.now();

    logger.info('Generating preview via Replicate', {
      requestId,
      cacheStatus,
      cacheEnabled: cacheAllowedForRequest,
      style,
      aspectRatio,
      quality
    });

    const result = await replicateService.generateImageToImage(normalizedImageUrl, stylePrompt, normalizedAspectRatio, normalizedQuality);
    const replicateDurationMs = Date.now() - replicateStart;

    if (result.ok && result.output) {
      const rawOutput = Array.isArray(result.output) ? result.output[0] : result.output;
      const finalPreviewUrl = await persistGeneratedPreview(rawOutput);
      const duration = Date.now() - startTime;

      if (asyncEnabled && webhookBaseUrl && webhookSecret) {
        await supabase.from('previews_status').upsert({
          request_id: requestId,
          prediction_id: null,
          status: 'succeeded',
          preview_url: finalPreviewUrl,
          error: null,
          image_digest: imageDigest,
          style_id: styleMetadata.styleId,
          style_version: styleMetadata.styleVersion,
          aspect_ratio: normalizedAspectRatio,
          quality: normalizedQuality,
          watermark,
          cache_allowed: cacheAllowedForRequest,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'request_id' });
      }

      logger.info('Replicate generation success', { requestId, replicateDurationMs, cacheStatus });
      return createCorsResponse(
        JSON.stringify(createSuccessResponse(finalPreviewUrl, requestId, duration, cacheStatus)),
        200
      );
    }

    logger.error('Replicate generation failed', { error: result.error, requestId });
    return createCorsResponse(
      JSON.stringify(createErrorResponse('generation_failed', result.error || 'AI service is temporarily unavailable. Please try again.', requestId)),
      503
    );
  } catch (_error) {
    logger.error('Unhandled error in preview generation', { error: error?.message ?? 'unknown', requestId });
    return createCorsResponse(
      JSON.stringify(createErrorResponse('internal_error', 'Internal server error. Please try again.', requestId)),
      500
    );
  }
});
