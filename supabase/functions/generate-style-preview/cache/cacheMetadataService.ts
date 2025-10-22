import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export interface CacheMetadataRecord {
  cache_key: string;
  style_id: number;
  style_version: string;
  image_digest: string;
  aspect_ratio: string;
  quality: string;
  watermark: boolean;
  storage_path: string;
  preview_url: string;
  ttl_expires_at: string;
  created_at: string;
  last_accessed_at: string | null;
  hit_count: number;
  source_request_id: string | null;
  created_by_user_id: string | null;
  tier: string | null;
}

export interface CreateCacheEntryInput {
  cacheKey: string;
  styleId: number;
  styleVersion: string;
  imageDigest: string;
  aspectRatio: string;
  quality: string;
  watermark: boolean;
  storagePath: string;
  previewUrl: string;
  ttlExpiresAt: string;
  sourceRequestId: string;
  createdByUserId?: string | null;
  tier?: string | null;
}

export class CacheMetadataService {
  constructor(private readonly supabase: SupabaseClient) {}

  async get(cacheKey: string): Promise<CacheMetadataRecord | null> {
    const { data, error } = await this.supabase
      .from('preview_cache_entries')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === 'PGRST123' || error?.message?.includes('Results contain 0 rows')) {
        return null;
      }
      throw error;
    }

    return data as CacheMetadataRecord;
  }

  async upsert(entry: CreateCacheEntryInput): Promise<void> {
    const payload = {
      cache_key: entry.cacheKey,
      style_id: entry.styleId,
      style_version: entry.styleVersion,
      image_digest: entry.imageDigest,
      aspect_ratio: entry.aspectRatio,
      quality: entry.quality,
      watermark: entry.watermark,
      storage_path: entry.storagePath,
      preview_url: entry.previewUrl,
      ttl_expires_at: entry.ttlExpiresAt,
      source_request_id: entry.sourceRequestId,
      created_by_user_id: entry.createdByUserId ?? null,
      tier: entry.tier ?? null,
      last_accessed_at: new Date().toISOString(),
      hit_count: 1
    };

    const { error } = await this.supabase
      .from('preview_cache_entries')
      .upsert(payload, { onConflict: 'cache_key' });

    if (error) {
      throw error;
    }
  }

  async recordHit(cacheKey: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_preview_cache_hit', {
      p_cache_key: cacheKey
    });

    if (error) {
      throw error;
    }
  }
}
