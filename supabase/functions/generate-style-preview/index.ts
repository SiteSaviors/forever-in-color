import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { StylePromptService, type StylePromptMetadata } from './stylePromptService.ts';
import { handleCorsPreflightRequest, createCorsResponse } from './corsUtils.ts';
import { validateRequest } from './requestValidator.ts';
import { ReplicateService } from './replicateService.ts';
import { validateEnvironment } from './environmentValidator.ts';
import { createSuccessResponse, createErrorResponse } from './responseUtils.ts';
import {
  getPromptCacheConfig,
  getCachedPrompt,
  setCachedPrompt,
  schedulePromptWarmup,
  type PromptWarmupResult
} from './promptCache.ts';
import { CacheMetadataService, type CacheMetadataRecord } from './cache/cacheMetadataService.ts';
import { PreviewStorageClient } from './cache/storageClient.ts';
import { createImageDigest, buildCacheKey } from './cache/cacheKey.ts';
import { LruMemoryCache } from './cache/memoryCache.ts';
import { createRequestLogger } from './logging.ts';
import type { CacheStatus } from './types.ts';
import { resolveEntitlements, computeRemainingAfterDebet, type EntitlementContext } from './entitlements.ts';
import { WatermarkService } from './watermarkService.ts';

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

const entitlementsFlag = (Deno.env.get('WT_FLAG_ENTITLEMENTS_V1') ?? 'true').toLowerCase() === 'true';

const parseDevBypassEmails = (): Set<string> => {
  const raw = Deno.env.get('WT_DEV_BYPASS_EMAILS');
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map((value) => String(value).toLowerCase()));
    }
  } catch (error) {
    console.warn('[entitlements] Failed to parse WT_DEV_BYPASS_EMAILS', error);
  }
  return new Set();
};

const devBypassEmails = parseDevBypassEmails();

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

async function handleWebhookRequest(req: Request, url: URL, origin: string | null): Promise<Response> {
  if (!webhookSecret) {
    return createCorsResponse(JSON.stringify({ ok: false, error: 'webhook_not_configured' }), 500, origin ?? undefined);
  }

  const token = url.searchParams.get('token');
  if (token !== webhookSecret) {
    return createCorsResponse(JSON.stringify({ ok: false, error: 'unauthorized' }), 401, origin ?? undefined);
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
      return createCorsResponse(JSON.stringify({ ok: false, error: 'missing_request' }), 400, origin ?? undefined);
    }

    const { data: statusRow, error: statusError } = await supabase
      .from('previews_status')
      .select('*')
      .eq(identifierColumn, identifier)
      .single();

    if (statusError || !statusRow) {
      return createCorsResponse(JSON.stringify({ ok: false, error: 'status_not_found' }), 404, origin ?? undefined);
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
          let processedOutput = output;

          if (watermark) {
            try {
              const { buffer, contentType } = await loadImageBuffer(output);
              const watermarkedBuffer = await WatermarkService.createWatermarkedImage(buffer, statusRow.request_id ?? 'webhook');
              processedOutput = bufferToDataUrl(watermarkedBuffer, contentType);
            } catch (error) {
              webhookLogger.warn('Failed to apply watermark during webhook processing', {
                message: error instanceof Error ? error.message : String(error),
                requestId: statusRow.request_id
              });
            }
          }

          const uploadResult = await storageClient.uploadFromUrl(processedOutput, storagePath, {}, watermark);
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
          if (typeof output === 'string' && watermark) {
            try {
              const { buffer, contentType } = await loadImageBuffer(output);
              const watermarkedBuffer = await WatermarkService.createWatermarkedImage(buffer, statusRow.request_id ?? 'webhook');
              previewUrl = bufferToDataUrl(watermarkedBuffer, contentType);
            } catch (error) {
              webhookLogger.warn('Failed to watermark webhook output (cache bypass)', {
                message: error instanceof Error ? error.message : String(error),
                requestId: statusRow.request_id
              });
              previewUrl = output;
            }
          } else {
            previewUrl = typeof output === 'string' ? output : null;
          }
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

    return createCorsResponse(JSON.stringify({ ok: true, cacheStatus }), 200, origin ?? undefined);
  } catch (error) {
    console.error('Webhook handling failed', error);
    return createCorsResponse(JSON.stringify({ ok: false, error: 'webhook_error' }), 500, origin ?? undefined);
  }
}

async function handleStatusRequest(url: URL, origin: string | null): Promise<Response> {
  const requestId = url.searchParams.get('requestId');
  if (!requestId) {
    return createCorsResponse(JSON.stringify({ error: 'missing_requestId' }), 400, origin ?? undefined);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return createCorsResponse(JSON.stringify({ error: 'configuration_error' }), 500, origin ?? undefined);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('previews_status')
    .select('request_id,status,preview_url,error,prediction_id,updated_at')
    .eq('request_id', requestId)
    .single();

  if (error || !data) {
    return createCorsResponse(JSON.stringify({ error: 'not_found' }), 404, origin ?? undefined);
  }

  return createCorsResponse(JSON.stringify(data), 200, origin ?? undefined);
}

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const originHeader = req.headers.get('origin');
  const respond = (body: string, status = 200) =>
    createCorsResponse(body, status, originHeader ?? undefined);

  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(originHeader ?? undefined);
  }

  if (req.method === 'POST' && pathname.endsWith('/webhook')) {
    return handleWebhookRequest(req, url, originHeader);
  }

  if (req.method === 'GET' && pathname.endsWith('/status')) {
    return handleStatusRequest(url, originHeader);
  }

  if (req.method !== 'POST') {
    return respond(
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
      return respond(
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

    // Telemetry: Track input type for monitoring
    const inputScheme = imageUrl.startsWith('data:') ? 'data-uri' :
                       imageUrl.startsWith('http') ? 'http-url' : 'unknown';
    logger.info('Request received', {
      requestId,
      inputScheme,
      inputLength: imageUrl.length,
      style,
      aspectRatio: normalizedAspectRatio,
      quality: normalizedQuality
    });

    const envValidation = await validateEnvironment(req, requestId, originHeader);
    if (!envValidation.isValid || !envValidation.replicateApiToken) {
      logger.error('Environment validation failed');
      return envValidation.error ?? respond(
        JSON.stringify(createErrorResponse('configuration_error', 'AI service configuration error', requestId)),
        500
      );
    }

    const replicateApiToken = envValidation.replicateApiToken;
    const openAiFallbackKey = envValidation.openaiApiKey ?? '';
    const fallbackEnabled = Boolean(openAiFallbackKey && openAiFallbackKey.length > 0);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Missing required environment configuration');
      return respond(
        JSON.stringify(createErrorResponse('configuration_error', 'AI service configuration error', requestId)),
        500
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authorizationHeader = req.headers.get('authorization') ?? req.headers.get('Authorization');
    const anonHeader = req.headers.get('x-wt-anon') ?? req.headers.get('X-WT-Anon');
    const idempotencyKey = req.headers.get('x-idempotency-key') ?? req.headers.get('X-Idempotency-Key');

    if (!idempotencyKey) {
      logger.warn('Missing idempotency key header');
      return respond(
        JSON.stringify(createErrorResponse('missing_idempotency_key', 'X-Idempotency-Key header is required', requestId, 'MISSING_IDEMPOTENCY')),
        400
      );
    }

    let entitlementContext: EntitlementContext | null = null;

    if (entitlementsFlag) {
      try {
        const { context } = await resolveEntitlements({
          supabase,
          accessToken: authorizationHeader,
          anonToken: anonHeader,
          devBypassEmails
        });
        entitlementContext = context;

        if (!context.devBypass && context.remainingBefore !== null && context.remainingBefore <= 0) {
          logger.info('Entitlement exceeded', {
            requestId,
            tier: context.tierLabel
          });
          const errorPayload = createErrorResponse(
            'ENTITLEMENT_EXCEEDED',
            'Preview quota exceeded',
            requestId,
            'ENTITLEMENT_EXCEEDED'
          );
          return respond(
            JSON.stringify({
              ...errorPayload,
              remainingTokens: 0,
              tier: context.tierLabel
            }),
            429
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn('Failed to resolve entitlements', { requestId, message });

        if (message === 'UNAUTHORIZED') {
          return respond(
            JSON.stringify(createErrorResponse('unauthorized', 'Valid Supabase session required', requestId, 'UNAUTHORIZED')),
            401
          );
        }

        if (message === 'ANON_TOKEN_MISSING') {
          return respond(
            JSON.stringify(createErrorResponse('anonymous_session_required', 'Anonymous token is required. Call /api/anon/mint first.', requestId, 'ANON_TOKEN_MISSING')),
            401
          );
        }

        return respond(
          JSON.stringify(createErrorResponse('entitlement_error', 'Unable to evaluate entitlements', requestId, 'ENTITLEMENT_ERROR')),
          500
        );
      }
    }

    const stylePromptService = new StylePromptService(supabase);
    initializeWarmup(stylePromptService);

    const cacheMetadataService = new CacheMetadataService(supabase);
    const storageClient = new PreviewStorageClient(supabase, cacheBucket);

    let previewLogId: string | null = null;
    const existingLogResult = await supabase
      .from('preview_logs')
      .select('id, preview_url, outcome, requires_watermark, priority, tier, tokens_spent, error_code, user_id, anon_token')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    const existingLog = existingLogResult.data ?? null;

    if (existingLog) {
      previewLogId = existingLog.id;

      if (
        entitlementContext &&
        entitlementContext.actor === 'authenticated' &&
        existingLog.user_id &&
        entitlementContext.userId &&
        existingLog.user_id !== entitlementContext.userId
      ) {
        logger.warn('Idempotency key belongs to another user', {
          requestId,
          userId: entitlementContext.userId,
          existingUserId: existingLog.user_id
        });
        return respond(
          JSON.stringify(createErrorResponse('idempotency_conflict', 'Idempotency key conflict', requestId, 'IDEMPOTENCY_CONFLICT')),
          409
        );
      }

      if (
        entitlementContext &&
        entitlementContext.actor === 'anonymous' &&
        existingLog.anon_token &&
        entitlementContext.anonToken &&
        existingLog.anon_token !== entitlementContext.anonToken
      ) {
        logger.warn('Idempotency key belongs to another anonymous token', {
          requestId,
          anonToken: entitlementContext.anonToken,
          existingAnon: existingLog.anon_token
        });
        return respond(
          JSON.stringify(createErrorResponse('idempotency_conflict', 'Idempotency key conflict', requestId, 'IDEMPOTENCY_CONFLICT')),
          409
        );
      }

      if (existingLog.outcome === 'success' && existingLog.preview_url) {
        const duration = Date.now() - startTime;
        const remainingTokens = entitlementContext
          ? entitlementContext.devBypass
            ? null
            : entitlementContext.remainingBefore
          : null;

        const tierLabel = entitlementContext?.tierLabel ?? existingLog.tier ?? undefined;
        const priority = entitlementContext?.priority ?? existingLog.priority ?? 'normal';
        const requiresWatermark = entitlementContext?.requiresWatermark ?? existingLog.requires_watermark ?? true;
        const previewUrlForResponse = requiresWatermark
          ? await ensureWatermarkedPreview(existingLog.preview_url, requestId, storageClient)
          : existingLog.preview_url;

        logger.info('Returning cached idempotent preview result', {
          requestId,
          idempotencyKey,
          tier: tierLabel
        });

        return respond(
          JSON.stringify(
            createSuccessResponse({
              previewUrl: previewUrlForResponse,
              requestId,
              duration,
              cacheStatus: 'hit',
              tier: tierLabel,
              requiresWatermark,
              remainingTokens,
              priority
            })
          ),
          200
        );
      }

      if (existingLog.outcome === 'error') {
        logger.info('Returning cached error for idempotent key', {
          requestId,
          idempotencyKey,
          errorCode: existingLog.error_code
        });
        const errorPayload = createErrorResponse(
          existingLog.error_code ?? 'previous_error',
          'Previous preview attempt failed',
          requestId,
          existingLog.error_code ?? 'PREVIOUS_ERROR'
        );
        return respond(
          JSON.stringify(errorPayload),
          400
        );
      }

      if (existingLog.outcome === 'pending') {
        logger.info('Preview still pending for idempotent key', { requestId, idempotencyKey });
        return respond(
          JSON.stringify({
            status: 'pending',
            requestId,
            message: 'Preview generation is still in progress'
          }),
          202
        );
      }
    }

    // Check in-memory prompt cache FIRST before hitting the database
    let stylePrompt: string;
    let styleMetadata: StylePromptMetadata;

    const cachedPrompt = getCachedPrompt(style);
    if (cachedPrompt) {
      // Cache hit: use cached prompt and metadata
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
      // Cache miss: fetch from database
      const promptFetchStart = Date.now();
      let fetchedMetadata: StylePromptMetadata | null = null;

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

      const resolvedMetadata = fetchedMetadata ?? {
        prompt: null,
        styleVersion: '0',
        styleId: stylePromptService.resolveStyleId(style)
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

    const effectiveWatermark = entitlementContext?.requiresWatermark ?? watermark;

    if (!previewLogId) {
      const insertPayload = {
        idempotency_key: idempotencyKey,
        user_id: entitlementContext?.userId ?? null,
        anon_token: entitlementContext?.anonToken ?? null,
        tier: entitlementContext?.tierForDb ?? null,
        style_id: String(styleMetadata.styleId),
        orientation: normalizedAspectRatio,
        watermark: effectiveWatermark,
        requires_watermark: effectiveWatermark,
        priority: entitlementContext?.priority ?? 'normal',
        outcome: 'pending',
        tokens_spent: 0
      };

      const insertResult = await supabase
        .from('preview_logs')
        .insert(insertPayload)
        .select('id')
        .single();

      if (insertResult.error) {
        logger.error('Failed to insert preview log', {
          requestId,
          error: insertResult.error.message
        });
        return respond(
          JSON.stringify(createErrorResponse('log_write_failed', 'Failed to initialize preview log', requestId, 'LOG_WRITE_FAILED')),
          500
        );
      } else {
        previewLogId = insertResult.data?.id ?? null;
      }
    }

    const recordPreviewFailure = async (code: string, message: string, statusCode: number): Promise<Response> => {
      if (previewLogId) {
        await supabase
          .from('preview_logs')
          .update({
            outcome: 'error',
            error_code: code,
            tokens_spent: 0
          })
          .eq('id', previewLogId);
      }

      const payload = createErrorResponse(code, message, requestId, code);
      return respond(JSON.stringify(payload), statusCode);
    };

    const recordPreviewSuccess = async (previewUrl: string, cacheStatus: CacheStatus, statusCode = 200): Promise<Response> => {
      const tokensDebit = entitlementContext && !entitlementContext.devBypass ? 1 : 0;

      if (previewLogId) {
        await supabase
          .from('preview_logs')
          .update({
            outcome: 'success',
            preview_url: previewUrl,
            tokens_spent: tokensDebit,
            watermark: effectiveWatermark,
            requires_watermark: effectiveWatermark,
            priority: entitlementContext?.priority ?? 'normal',
            tier: entitlementContext?.tierForDb ?? null
          })
          .eq('id', previewLogId);
      }

      if (
        entitlementContext &&
        entitlementContext.actor === 'anonymous' &&
        entitlementContext.anonToken &&
        !entitlementContext.devBypass
      ) {
        const nextSoftRemaining = entitlementContext.softRemaining != null
          ? Math.max(entitlementContext.softRemaining - tokensDebit, 0)
          : null;

        if (nextSoftRemaining != null) {
          await supabase
            .from('anonymous_tokens')
            .update({ free_tokens_remaining: nextSoftRemaining })
            .eq('token', entitlementContext.anonToken);
        }
      }

      const remainingTokens = entitlementContext
        ? (entitlementContext.devBypass
            ? null
            : computeRemainingAfterDebet(entitlementContext, tokensDebit))
        : null;

      const payload = createSuccessResponse({
        previewUrl,
        requestId,
        duration: Date.now() - startTime,
        cacheStatus,
        tier: entitlementContext?.tierLabel,
        requiresWatermark: effectiveWatermark,
        remainingTokens,
        priority: entitlementContext?.priority ?? 'normal'
      });

      return respond(JSON.stringify(payload), statusCode);
    };

    // Build cache key from RAW imageUrl (before normalization)
    const cacheAllowedForRequest = cacheEnabledGlobally && !cacheBypass;
    let cacheStatus: CacheStatus = cacheBypass ? 'bypass' : 'miss';
    const imageDigest = await createImageDigest(imageUrl);
    let cacheKey: string | null = null;

    let metadataEntry: CacheMetadataRecord | null = null;

    if (cacheAllowedForRequest) {
      cacheKey = buildCacheKey({
        imageDigest,
        styleId: styleMetadata.styleId,
        styleVersion: styleMetadata.styleVersion,
        aspectRatio: normalizedAspectRatio,
        quality: normalizedQuality,
        watermark: effectiveWatermark
      });

      // Check memory cache FIRST
      const cachedFromMemory = memoryCache.get(cacheKey);
      if (cachedFromMemory) {
        cacheStatus = 'hit';
        logger.info('Cache hit (memory) - skipping normalization', {
          cacheKey,
          inputScheme
        });
        cacheMetadataService.recordHit(cacheKey).catch((error) => {
          logger.warn('Failed to record cache hit', { error: error?.message ?? 'unknown', cacheKey });
        });
        if (!metadataEntry) {
          try {
            metadataEntry = await cacheMetadataService.get(cacheKey);
          } catch (error) {
            logger.warn('Failed to load cache metadata for memory hit', { error: error instanceof Error ? error.message : String(error), cacheKey });
          }
        }
        const hydratedUrl = effectiveWatermark
          ? await ensureWatermarkedPreview(
              cachedFromMemory,
              requestId,
              metadataEntry?.storage_path ? storageClient : undefined,
              metadataEntry?.storage_path ?? undefined
            )
          : cachedFromMemory;
        if (cacheKey) {
          const ttlForEntry = metadataEntry?.ttl_expires_at ? Math.max(Date.parse(metadataEntry.ttl_expires_at) - Date.now(), 1000) : ttlMs;
          memoryCache.set(cacheKey, hydratedUrl, ttlForEntry);
        }
        return await recordPreviewSuccess(hydratedUrl, cacheStatus);
      }

      // Check storage cache SECOND
      try {
        if (!metadataEntry) {
          metadataEntry = await cacheMetadataService.get(cacheKey);
        }
        if (metadataEntry && metadataEntry.preview_url && !isExpired(metadataEntry.ttl_expires_at)) {
          cacheStatus = 'hit';
          const ttlRemaining = Date.parse(metadataEntry.ttl_expires_at) - Date.now();
          if (ttlRemaining > 0) {
            memoryCache.set(cacheKey, metadataEntry.preview_url, ttlRemaining);
          }
          logger.info('Cache hit (storage) - skipping normalization', {
            cacheKey,
            inputScheme
          });
          cacheMetadataService.recordHit(cacheKey).catch((error) => {
            logger.warn('Failed to record cache hit', { error: error?.message ?? 'unknown', cacheKey });
          });
          const hydratedUrl = effectiveWatermark
            ? await ensureWatermarkedPreview(metadataEntry.preview_url, requestId, storageClient, metadataEntry.storage_path ?? undefined)
            : metadataEntry.preview_url;
          if (cacheKey) {
            memoryCache.set(cacheKey, hydratedUrl, ttlMs);
          }
          return await recordPreviewSuccess(hydratedUrl, cacheStatus);
        } else if (metadataEntry && metadataEntry.preview_url) {
          logger.info('Cache entry expired, regenerating', { cacheKey });
        }
      } catch (error) {
        logger.warn('Cache metadata lookup failed', { error: error instanceof Error ? error.message : String(error), cacheKey });
      }
    }

    // CACHE MISS: Now normalize the image (only happens on misses)
    logger.info('Cache miss, normalizing input', {
      inputScheme,
      cacheKey,
      cacheStatus
    });
    const normalizationStart = Date.now();
    const normalizedImageUrl = await normalizeImageInput(imageUrl);
    const normalizationDurationMs = Date.now() - normalizationStart;
    logger.info('Normalization complete', {
      requestId,
      normalizationDurationMs,
      wasAlreadyDataUri: imageUrl.startsWith('data:')
    });

    const persistGeneratedPreview = async (rawOutput: string): Promise<string> => {
      let processedOutput = rawOutput;

      if (effectiveWatermark) {
        try {
          const { buffer, contentType } = await loadImageBuffer(rawOutput);
          const watermarkedBuffer = await WatermarkService.createWatermarkedImage(buffer, requestId, true);
          processedOutput = bufferToDataUrl(watermarkedBuffer, contentType);
        } catch (error) {
          logger.warn('[watermark] Failed to apply server watermark, falling back to raw output', {
            requestId,
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }

      let finalPreviewUrl = processedOutput;

      if (cacheAllowedForRequest && cacheKey) {
        try {
          const storagePath = computeStoragePath(styleMetadata.styleId, normalizedAspectRatio, normalizedQuality, imageDigest);
          const ttlExpiresAt = new Date(Date.now() + ttlMs).toISOString();

          if (effectiveWatermark) {
            // For free/anonymous users: Upload BOTH versions
            // 1. Watermarked version to public bucket (for display)
            const watermarkedUpload = await storageClient.uploadFromUrl(processedOutput, storagePath, {}, true);
            finalPreviewUrl = watermarkedUpload.publicUrl;

            // 2. Clean version to premium bucket (for premium downloads)
            await storageClient.uploadFromUrl(rawOutput, storagePath, {}, false);

            logger.info('Dual-upload complete: watermarked (public) + clean (premium)', {
              requestId,
              watermarkedUrl: watermarkedUpload.publicUrl,
              storagePath
            });

            await cacheMetadataService.upsert({
              cacheKey,
              styleId: styleMetadata.styleId,
              styleVersion: styleMetadata.styleVersion,
              imageDigest,
              aspectRatio: normalizedAspectRatio,
              quality: normalizedQuality,
              watermark: effectiveWatermark,
              storagePath: watermarkedUpload.storagePath,
              previewUrl: watermarkedUpload.publicUrl,
              ttlExpiresAt,
              sourceRequestId: requestId
            });

            memoryCache.set(cacheKey, watermarkedUpload.publicUrl, ttlMs);
          } else {
            // For premium users: Upload clean version only to premium bucket
            const uploadResult = await storageClient.uploadFromUrl(rawOutput, storagePath, {}, false);
            finalPreviewUrl = uploadResult.publicUrl;

            await cacheMetadataService.upsert({
              cacheKey,
              styleId: styleMetadata.styleId,
              styleVersion: styleMetadata.styleVersion,
              imageDigest,
              aspectRatio: normalizedAspectRatio,
              quality: normalizedQuality,
              watermark: effectiveWatermark,
              storagePath: uploadResult.storagePath,
              previewUrl: uploadResult.publicUrl,
              ttlExpiresAt,
              sourceRequestId: requestId
            });

            memoryCache.set(cacheKey, uploadResult.publicUrl, ttlMs);

            logger.info('Premium upload complete: clean version only', {
              requestId,
              bucket: 'premium',
              storagePath
            });
          }

          cacheStatus = 'hit';
        } catch (error) {
          logger.warn('Failed to cache preview output', { error: error instanceof Error ? error.message : String(error), cacheKey, requestId });
        }
      } else if (!cacheAllowedForRequest) {
        cacheStatus = cacheBypass ? 'bypass' : cacheStatus;
      }

      return finalPreviewUrl;
    };

    if (asyncEnabled && (!webhookBaseUrl || !webhookSecret)) {
      logger.warn('Async preview enabled but webhook configuration is incomplete. Falling back to synchronous mode.', {
        hasBaseUrl: Boolean(webhookBaseUrl),
        hasSecret: Boolean(webhookSecret)
      });
    }

    if (asyncEnabled && webhookBaseUrl && webhookSecret) {
      const webhookUrl = `${webhookBaseUrl.replace(/\/$/, '')}/functions/v1/generate-style-preview/webhook?token=${webhookSecret}`;

      // Map quality to SeeDream size parameter
      const seedreamSize = normalizedQuality === 'high' ? '4K' :
                          normalizedQuality === 'low' ? '1K' : '2K';

      const createBody = {
        input: {
          prompt: stylePrompt,
          image_input: [normalizedImageUrl],
          aspect_ratio: normalizedAspectRatio,
          size: seedreamSize,
          max_images: 1,
          request_id: requestId
        },
        webhook: webhookUrl,
        webhook_events_filter: ['completed', 'failed', 'canceled']
      } as const;

      const asyncResp = await fetch('https://api.replicate.com/v1/models/bytedance/seedream-4/predictions', {
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
        return await recordPreviewFailure('generation_failed', `SeeDream API request failed: ${asyncResp.status} - ${errTxt}`, 503);
      }

      const asyncData = await asyncResp.json();

      if (asyncData?.status === 'succeeded' && asyncData?.output) {
        const immediateOutput = Array.isArray(asyncData.output) ? asyncData.output[0] : asyncData.output;
        const finalPreviewUrl = await persistGeneratedPreview(immediateOutput);

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
          watermark: effectiveWatermark,
          cache_allowed: cacheAllowedForRequest,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'request_id' });

        logger.info('Replicate returned immediate result', { requestId, cacheStatus });
        return await recordPreviewSuccess(finalPreviewUrl, cacheStatus);
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
        watermark: effectiveWatermark,
        cache_allowed: cacheAllowedForRequest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'request_id' });

      logger.info('Queued preview generation via webhook', {
        requestId,
        status: asyncData?.status ?? 'processing',
        cacheAllowedForRequest
      });

      return respond(
        JSON.stringify({
          requestId,
          status: asyncData?.status ?? 'processing',
          requires_watermark: entitlementContext?.requiresWatermark ?? effectiveWatermark,
          remainingTokens: entitlementContext?.remainingBefore ?? null,
          tier: entitlementContext?.tierLabel,
          priority: entitlementContext?.priority ?? 'normal'
        }),
        202
      );
    }

    const replicateService = new ReplicateService(replicateApiToken);
    const replicateStart = Date.now();

    logger.info('Generating preview via Replicate (SeeDream 4.0)', {
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
          watermark: effectiveWatermark,
          cache_allowed: cacheAllowedForRequest,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'request_id' });
      }

      logger.info('Replicate generation success', { requestId, replicateDurationMs, cacheStatus });
      return await recordPreviewSuccess(finalPreviewUrl, cacheStatus);
    }

    logger.error('SeeDream generation failed', { error: result.error, requestId });

    if (fallbackEnabled) {
      logger.warn('Attempting GPT-Image-1 fallback', { requestId });
      const fallbackStart = Date.now();
      const fallbackResult = await replicateService.generateImageToImageWithGpt(
        normalizedImageUrl,
        stylePrompt,
        normalizedAspectRatio,
        normalizedQuality,
        openAiFallbackKey
      );
      const fallbackDurationMs = Date.now() - fallbackStart;

      if (fallbackResult.ok && fallbackResult.output) {
        const fallbackOutput = Array.isArray(fallbackResult.output) ? fallbackResult.output[0] : fallbackResult.output;
        const finalPreviewUrl = await persistGeneratedPreview(fallbackOutput);

        logger.info('GPT-Image-1 fallback succeeded', {
          requestId,
          fallbackDurationMs,
          cacheStatus
        });

        return await recordPreviewSuccess(finalPreviewUrl, cacheStatus);
      }

      logger.error('GPT-Image-1 fallback failed', {
        requestId,
        error: fallbackResult.error,
        technicalError: fallbackResult.technicalError
      });
    }

    return await recordPreviewFailure('generation_failed', result.error || 'AI service is temporarily unavailable. Please try again.', 503);
  } catch (error) {
    logger.error('Unhandled error in preview generation', { error: error instanceof Error ? error.message : String(error), requestId });
    return await recordPreviewFailure('internal_error', 'Internal server error. Please try again.', 500);
  }
});
const bufferToDataUrl = (buffer: ArrayBuffer, contentType: string): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${contentType};base64,${base64}`;
};

const loadImageBuffer = async (source: string): Promise<{ buffer: ArrayBuffer; contentType: string }> => {
  if (source.startsWith('data:image/')) {
    const [header, data] = source.split(',');
    if (!data) {
      throw new Error('Invalid data URL supplied for watermarking');
    }
    const match = header.match(/^data:(.+);base64$/);
    const contentType = match?.[1] ?? 'image/jpeg';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { buffer: bytes.buffer, contentType };
  }

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error(`Failed to fetch preview asset for watermarking: ${response.status}`);
  }
  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const buffer = await response.arrayBuffer();
  return { buffer, contentType };
};

const extractStoragePath = (sourceUrl: string): string | null => {
  try {
    const url = new URL(sourceUrl);
    const marker = `/storage/v1/object/public/${cacheBucket.replace(/\//g, '/')}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch (_error) {
    return null;
  }
};

const ensureWatermarkedPreview = async (
  sourceUrl: string,
  sessionId: string,
  storageClient?: PreviewStorageClient,
  storagePath?: string
): Promise<string> => {
  try {
    const { buffer, contentType } = await loadImageBuffer(sourceUrl);
    const watermarkedBuffer = await WatermarkService.createWatermarkedImage(buffer, sessionId, true);

    if (storageClient) {
      const targetPath = storagePath ?? extractStoragePath(sourceUrl);
      if (targetPath) {
        const uploadResult = await storageClient.uploadFromBuffer(watermarkedBuffer, targetPath, {
          contentType
        });
        return uploadResult.publicUrl;
      }
    }

    return bufferToDataUrl(watermarkedBuffer, contentType);
  } catch (error) {
    console.warn('[watermark] Failed to enforce watermark on cached preview', {
      sessionId,
      message: error instanceof Error ? error.message : String(error)
    });
    return sourceUrl;
  }
};
