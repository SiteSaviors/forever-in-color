# Wondertone Preview Flow (Current)

```mermaid
sequenceDiagram
  participant User
  participant Entitlements
  participant PhotoUploader
  participant useFounderStore
  participant startStylePreview
  participant previewGeneration
  participant SupabaseEdge
  participant Polling

  User->>PhotoUploader: Uploads photo / selects sample
  PhotoUploader->>useFounderStore: setOriginalImage\nsetCroppedImage\nsetOrientation
  PhotoUploader-->>useFounderStore: markCropReady()\nsetPreviewState('original-image')
  User->>Entitlements: hydrateEntitlements (mint anon token or fetch subscription)
  Entitlements-->>useFounderStore: tier, remainingTokens, requiresWatermark
  User->>useFounderStore: Selects a style
  useFounderStore->>startStylePreview: startStylePreview(style)
  startStylePreview->>previewGeneration: generateAndWatermarkPreview(image, style, aspectRatio, idempotencyKey)
  previewGeneration->>SupabaseEdge: POST /functions/v1/generate-style-preview\n(X-Idempotency-Key + Authorization/X-WT-Anon)
  SupabaseEdge->>Entitlements: validate quota / bypass
  Entitlements-->>SupabaseEdge: remainingTokens, watermark flag, priority
  SupabaseEdge-->>previewGeneration: { status: 'complete' | 'processing', previewUrl?, requestId? }
  previewGeneration->>Polling: pollPreviewStatusUntilReady(requestId)
  Polling-->>previewGeneration: previewUrl
  previewGeneration-->>startStylePreview: previewUrl (watermarked if needed)
  startStylePreview-->>useFounderStore: setPreviewState(styleId, { status: 'ready', data, watermarkApplied })
  startStylePreview-->>Entitlements: update remainingTokens / prompt state
  useFounderStore-->>User: CanvasInRoomPreview renders latest preview
```

**Notes**

- Anonymous sessions call `anon-mint` to persist tokens and prompt state; authenticated sessions read `v_entitlements`.
- Supabase edge function enforces quotas, idempotency, and watermark rules; response includes `remainingTokens` and `requires_watermark`.
- Client watermarking only runs when the edge function indicates it is required.
- Orientation changes reuse cached previews when possible; otherwise they trigger `startStylePreview` with an overridden orientation.
