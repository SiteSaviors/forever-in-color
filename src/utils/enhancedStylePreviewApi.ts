
import { supabase } from "@/integrations/supabase/client";
import { createPreview } from "./previewOperations";

export interface TimeoutConfig {
  fast: number;      // 15 seconds for preview generation
  normal: number;    // 30 seconds for regular operations
  extended: number;  // 60 seconds for large files
}

export interface ApiCallOptions {
  timeout?: keyof TimeoutConfig;
  retries?: number;
  onProgress?: (status: string) => void;
  onTimeout?: () => void;
}

export class EnhancedStylePreviewApi {
  private static readonly TIMEOUTS: TimeoutConfig = {
    fast: 15000,     // 15 seconds
    normal: 30000,   // 30 seconds  
    extended: 60000  // 60 seconds
  };

  private static readonly MAX_RETRIES = 2;
  private static readonly RETRY_DELAYS = [2000, 5000]; // 2s, 5s

  /**
   * Generate style preview with timeout handling and graceful degradation
   */
  static async generateStylePreview(
    imageUrl: string, 
    style: string, 
    photoId: string, 
    aspectRatio: string = "1:1",
    options: {
      watermark?: boolean;
      quality?: 'preview' | 'final';
      sessionId?: string;
    } = {},
    apiOptions: ApiCallOptions = {}
  ): Promise<string> {
    console.log('🎨 Enhanced style preview generation starting...');
    
    const {
      timeout = 'normal',
      retries = this.MAX_RETRIES,
      onProgress,
      onTimeout
    } = apiOptions;

    // Determine timeout based on file size and operation
    const timeoutMs = this.TIMEOUTS[timeout];
    const isLargeFile = imageUrl.length > 500000; // ~500KB base64
    const actualTimeout = isLargeFile ? this.TIMEOUTS.extended : timeoutMs;

    console.log(`⏱️ Using timeout: ${actualTimeout}ms for ${isLargeFile ? 'large' : 'normal'} file`);

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        onProgress?.(`Generating preview... (attempt ${attempt + 1}/${retries + 1})`);
        
        const result = await this.attemptGeneration(
          imageUrl, 
          style, 
          photoId, 
          aspectRatio, 
          options, 
          actualTimeout
        );
        
        console.log('✅ Style preview generated successfully');
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Generation attempt ${attempt + 1} failed:`, error);
        
        // Handle specific error types
        if (this.isTimeoutError(error)) {
          onTimeout?.();
          
          // Try with extended timeout on retry
          if (attempt < retries) {
            console.log('🔄 Retrying with extended timeout...');
            await this.delay(this.RETRY_DELAYS[Math.min(attempt, this.RETRY_DELAYS.length - 1)]);
            continue;
          }
        }
        
        // Don't retry on validation errors
        if (this.isNonRetryableError(error)) {
          break;
        }
        
        // Wait before retrying
        if (attempt < retries) {
          const delay = this.RETRY_DELAYS[Math.min(attempt, this.RETRY_DELAYS.length - 1)];
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.delay(delay);
        }
      }
    }
    
    // If all attempts failed, try fallback strategies
    console.log('🚨 All generation attempts failed, trying fallback...');
    return this.handleFallback(imageUrl, style, lastError);
  }

  /**
   * Attempt generation with timeout
   */
  private static async attemptGeneration(
    imageUrl: string,
    style: string,
    photoId: string,
    aspectRatio: string,
    options: any,
    timeoutMs: number
  ): Promise<string> {
    // Check authentication status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const isAuthenticated = session && !sessionError;

    console.log('🔐 Authentication status:', isAuthenticated ? 'authenticated' : 'not authenticated');

    // Generate session ID for watermarking if not provided
    const sessionId = options.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare the request body
    const requestBody = { 
      imageUrl, 
      style,
      photoId,
      isAuthenticated,
      aspectRatio,
      watermark: options.watermark !== false,
      quality: options.quality || 'preview',
      sessionId
    };

    console.log('📤 Calling edge function with timeout:', timeoutMs);

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`TIMEOUT: Request exceeded ${timeoutMs}ms`));
      }, timeoutMs);
    });

    // Create generation promise
    const generationPromise = supabase.functions.invoke('generate-style-preview', {
      body: requestBody
    });

    // Race between generation and timeout
    const { data, error } = await Promise.race([
      generationPromise,
      timeoutPromise
    ]);

    if (error) {
      console.error('🔥 Edge function error:', error);
      throw new Error(error.message || 'Generation failed');
    }

    if (!data?.preview_url) {
      throw new Error('No preview URL returned from service');
    }

    // Store the preview if user is authenticated
    if (isAuthenticated) {
      try {
        await createPreview(photoId, style, data.preview_url);
      } catch (storeError) {
        console.warn('⚠️ Could not store preview:', storeError);
        // Continue anyway, just don't store
      }
    }
    
    return data.preview_url;
  }

  /**
   * Handle fallback when all attempts fail
   */
  private static async handleFallback(
    imageUrl: string, 
    style: string, 
    error: Error | null
  ): Promise<string> {
    console.log('🆘 Implementing fallback strategy...');
    
    // For now, return the original image as fallback
    // In production, you might want to:
    // 1. Queue the request for later processing
    // 2. Return a "processing" placeholder
    // 3. Send to a backup service
    
    const errorMessage = error?.message || 'Unknown error';
    
    if (this.isTimeoutError(error)) {
      throw new Error('Generation is taking longer than expected. Please try again or contact support if the issue persists.');
    }
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      throw new Error('Service is experiencing high demand. Please wait a moment and try again.');
    }
    
    if (errorMessage.includes('service unavailable') || errorMessage.includes('503')) {
      throw new Error('Our AI service is temporarily unavailable. Please try again in a few minutes.');
    }
    
    throw new Error('Unable to generate preview at this time. Please try again or contact support.');
  }

  /**
   * Check if error is a timeout
   */
  private static isTimeoutError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('timeout') || 
           message.includes('timed out') ||
           message.includes('exceeded');
  }

  /**
   * Check if error should not be retried
   */
  private static isNonRetryableError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('invalid') || 
           message.includes('unsupported') || 
           message.includes('corrupted') ||
           message.includes('too large') ||
           message.includes('400');
  }

  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate final image without watermark (post-purchase)
   */
  static async generateFinalImage(
    imageUrl: string, 
    style: string, 
    photoId: string, 
    aspectRatio: string = "1:1",
    sessionId?: string
  ): Promise<string> {
    return this.generateStylePreview(
      imageUrl, 
      style, 
      photoId, 
      aspectRatio, 
      {
        watermark: false,
        quality: 'final',
        sessionId
      },
      {
        timeout: 'extended', // Use extended timeout for final generation
        retries: 3,          // More retries for paid content
        onProgress: (status) => console.log('📸 Final generation:', status)
      }
    );
  }

  /**
   * Health check for the generation service
   */
  static async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      // Simple health check call
      const { error } = await Promise.race([
        supabase.functions.invoke('generate-style-preview', {
          body: { healthCheck: true }
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Health check timeout')), 5000);
        })
      ]);
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        return { status: 'degraded', responseTime };
      }
      
      return { 
        status: responseTime > 3000 ? 'degraded' : 'healthy', 
        responseTime 
      };
    } catch {
      return { status: 'down', responseTime: Date.now() - startTime };
    }
  }
}

// Export with backward compatibility
export const generateStylePreview = EnhancedStylePreviewApi.generateStylePreview;
export const generateFinalImage = EnhancedStylePreviewApi.generateFinalImage;
