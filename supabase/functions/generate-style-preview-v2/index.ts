// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { handleCorsPreflightRequest, createCorsResponse } from "../generate-style-preview/corsUtils.ts";
import { validateRequest } from "../generate-style-preview/requestValidator.ts";
import { createSuccessResponse, createErrorResponse } from "../generate-style-preview/responseUtils.ts";
import { StylePromptService } from "../generate-style-preview/stylePromptService.ts";
import { PromptEnhancer } from "../generate-style-preview/replicate/promptEnhancer.ts";

// Minimal v2: single create call (no polling), webhook for completion, optional GET /status
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return handleCorsPreflightRequest();

  const url = new URL(req.url);
  const pathname = url.pathname;

  // Route: POST /webhook (Replicate callback)
  if (req.method === "POST" && pathname.endsWith("/webhook")) {
    try {
      const secret = Deno.env.get("V2_WEBHOOK_SECRET");
      const token = url.searchParams.get("token");
      if (!secret || token !== secret) {
        return createCorsResponse(JSON.stringify({ ok: false, error: "unauthorized" }), 401);
      }

      const body = await req.json();
      const predictionId = body?.id as string | undefined;
      const status = body?.status as string | undefined;
      const input = body?.input || {};
      const requestId = input?.request_id as string | undefined;
      let output = body?.output as string | string[] | undefined;
      if (Array.isArray(output)) output = output[0];
      const errorMsg = body?.error as string | undefined;

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseServiceKey);

      // Idempotent upsert by requestId or predictionId
      const upsertPayload: Record<string, unknown> = {
        request_id: requestId ?? null,
        prediction_id: predictionId ?? null,
        status: status ?? "unknown",
        preview_url: output ?? null,
        error: errorMsg ?? null,
        updated_at: new Date().toISOString(),
      };

      await sb.from("previews_status").upsert(upsertPayload, { onConflict: "request_id" });
      return createCorsResponse(JSON.stringify({ ok: true }), 200);
    } catch (_e) {
      return createCorsResponse(JSON.stringify({ ok: false, error: "webhook_error" }), 500);
    }
  }

  // Route: GET /status?requestId=...
  if (req.method === "GET" && pathname.endsWith("/status")) {
    const requestId = url.searchParams.get("requestId");
    if (!requestId) return createCorsResponse(JSON.stringify({ error: "missing_requestId" }), 400);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await sb
      .from("previews_status")
      .select("request_id,status,preview_url,error,prediction_id,updated_at")
      .eq("request_id", requestId)
      .single();
    if (error) return createCorsResponse(JSON.stringify({ error: "not_found" }), 404);
    return createCorsResponse(JSON.stringify(data), 200);
  }

  // Route: POST / (create prediction)
  if (req.method !== "POST") {
    return createCorsResponse(
      JSON.stringify(createErrorResponse("method_not_allowed", "Method not allowed")),
      405,
    );
  }

  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const body = await req.json();
    const validation = validateRequest(body);
    if (!validation.isValid) {
      return createCorsResponse(
        JSON.stringify(createErrorResponse("invalid_request", validation.error!)),
        400,
      );
    }

    const { imageUrl, style, aspectRatio, quality } = validation.data!;

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const replicateApiToken = Deno.env.get("REPLICATE_API_TOKEN");
    if (!openaiApiKey || !replicateApiToken) {
      return createCorsResponse(
        JSON.stringify(createErrorResponse("configuration_error", "AI service configuration error")),
        500,
      );
    }

    // Supabase for prompts + status row
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseServiceKey);
    const stylePromptService = new StylePromptService(sb);

    let stylePrompt: string;
    try {
      const fetched = await stylePromptService.getStylePrompt(style);
      stylePrompt = fetched || `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;
    } catch {
      stylePrompt = `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;
    }

    const enhancedPrompt = PromptEnhancer.enhanceForIdentityPreservation(stylePrompt);

    // Build webhook URL
    const base = Deno.env.get("V2_WEBHOOK_BASE_URL");
    const secret = Deno.env.get("V2_WEBHOOK_SECRET");
    if (!base || !secret) {
      return createCorsResponse(
        JSON.stringify(createErrorResponse("configuration_error", "Webhook not configured")),
        500,
      );
    }
    const webhookUrl = `${base.replace(/\/$/, "")}/functions/v1/generate-style-preview-v2/webhook?token=${secret}`;

    // Create prediction (no Prefer: wait)
    const createBody = {
      input: {
        prompt: enhancedPrompt,
        input_images: [imageUrl],
        openai_api_key: openaiApiKey,
        aspect_ratio: aspectRatio,
        quality: quality,
        request_id: requestId,
      },
      webhook: webhookUrl,
      webhook_events_filter: ["completed", "failed", "canceled"],
    } as const;

    const resp = await fetch("https://api.replicate.com/v1/models/openai/gpt-image-1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${replicateApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createBody),
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      return createCorsResponse(
        JSON.stringify(createErrorResponse("generation_failed", `GPT-Image-1 API request failed: ${resp.status} - ${errTxt}`)),
        503,
      );
    }

    const data = await resp.json();

    // If immediate success (rare), finalize now and persist
    if (data?.status === "succeeded" && data?.output) {
      let out = data.output as string | string[];
      if (Array.isArray(out)) out = out[0];
      await sb.from("previews_status").upsert({
        request_id: requestId,
        prediction_id: data?.id ?? null,
        status: "succeeded",
        preview_url: out,
        error: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "request_id" });
      const duration = Date.now() - startTime;
      return createCorsResponse(JSON.stringify(createSuccessResponse(out as string, requestId, duration)), 200);
    }

    // Otherwise, store processing state and return 202 with requestId
    await sb.from("previews_status").upsert({
      request_id: requestId,
      prediction_id: data?.id ?? null,
      status: data?.status ?? "processing",
      preview_url: null,
      error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "request_id" });

    return createCorsResponse(JSON.stringify({ requestId, status: data?.status ?? "processing" }), 202);
  } catch (_error) {
    return createCorsResponse(
      JSON.stringify(createErrorResponse("internal_error", "Internal server error. Please try again.")),
      500,
    );
  }
});
