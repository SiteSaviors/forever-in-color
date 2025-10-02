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
  } catch (error) {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
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

    let promptCacheWasHit = false;
    let stylePrompt: string;
    let styleMetadata = await stylePromptService.getStylePromptWithMetadata(style);

    const cachedPrompt = getCachedPrompt(style);
    if (cachedPrompt) {
      promptCacheWasHit = true;
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
        } catch (error) {
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
    let cacheKey: string | null = null;
    let imageDigest: string | null = null;

    if (cacheAllowedForRequest) {
      imageDigest = await createImageDigest(normalizedImageUrl);
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
      } catch (error) {
        logger.warn('Cache metadata lookup failed', { error: error?.message ?? 'unknown', cacheKey });
      }
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
      let finalPreviewUrl = rawOutput;

      if (cacheAllowedForRequest && cacheKey && imageDigest && rawOutput) {
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
          cacheStatus = 'miss';
          logger.info('Cached preview output', { cacheKey, storagePath: uploadResult.storagePath });
        } catch (error) {
          logger.warn('Failed to cache preview output', { error: error?.message ?? 'unknown', cacheKey });
        }
      }

      const duration = Date.now() - startTime;
      console.log('[preview-metrics]', {
        requestId,
        style,
        action: 'replicate_success',
        replicateDurationMs,
        totalDurationMs: duration,
        promptCacheHit: promptCacheWasHit,
        outputCacheStatus: cacheStatus
      });

      return createCorsResponse(
        JSON.stringify(createSuccessResponse(finalPreviewUrl, requestId, duration, cacheStatus))
      );
    }

    logger.error('Replicate generation failed', { error: result.error, requestId });
    console.error('[preview-metrics]', {
      requestId,
      style,
      action: 'replicate_failure',
      replicateDurationMs,
      promptCacheHit: promptCacheWasHit,
      outputCacheStatus: cacheStatus,
      error: result.error || 'unknown_error'
    });
    return createCorsResponse(
      JSON.stringify(createErrorResponse('generation_failed', result.error || 'AI service is temporarily unavailable. Please try again.', requestId)),
      503
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Unhandled error in preview generation', { error: error?.message ?? 'unknown', requestId });
    console.error('[preview-metrics]', {
      requestId,
      action: 'replicate_exception',
      totalDurationMs: duration,
      message: error instanceof Error ? error.message : String(error)
    });
    return createCorsResponse(
      JSON.stringify(createErrorResponse('internal_error', 'Internal server error. Please try again.', requestId)),
      500
    );
  }
});
