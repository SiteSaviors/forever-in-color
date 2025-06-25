
import { validateImageFile, FileValidationResult } from './fileValidation';

export interface EnhancedValidationResult extends FileValidationResult {
  fileSize: number;
  fileName: string;
  suggestedAction?: 'compress' | 'convert' | 'retry' | 'contact_support';
  estimatedProcessingTime?: number;
}

export class EnhancedFileValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
  private static readonly SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Enhanced validation with better error messages and suggestions
   */
  static async validateWithEnhancements(file: File): Promise<EnhancedValidationResult> {
    console.log(`🔍 Enhanced validation for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Basic validation first
    const basicValidation = await validateImageFile(file);
    
    const result: EnhancedValidationResult = {
      ...basicValidation,
      fileSize: file.size,
      fileName: file.name
    };

    // Add enhanced checks and suggestions
    if (!result.isValid) {
      result.suggestedAction = this.getSuggestedAction(file, result.error);
      return result;
    }

    // Check for large files that might cause issues
    if (file.size > this.LARGE_FILE_THRESHOLD) {
      result.warnings = result.warnings || [];
      result.warnings.push(`Large file detected (${(file.size / 1024 / 1024).toFixed(1)}MB). Processing may take longer.`);
      result.estimatedProcessingTime = Math.ceil(file.size / (1024 * 1024)) * 2; // ~2 seconds per MB
    }

    // Check file type support
    if (!this.SUPPORTED_TYPES.includes(file.type.toLowerCase())) {
      result.warnings = result.warnings || [];
      result.warnings.push(`File type ${file.type} may have limited support. JPEG, PNG, and WebP are recommended.`);
      result.suggestedAction = 'convert';
    }

    console.log(`✅ Enhanced validation completed for ${file.name}`);
    return result;
  }

  /**
   * Get suggested action based on validation error
   */
  private static getSuggestedAction(file: File, error?: string): 'compress' | 'convert' | 'retry' | 'contact_support' {
    if (!error) return 'retry';

    if (error.includes('size too large') || error.includes('10MB')) {
      return 'compress';
    }
    
    if (error.includes('Invalid file type') || error.includes('format')) {
      return 'convert';
    }
    
    if (error.includes('corrupted') || error.includes('signature')) {
      return 'retry';
    }

    return 'contact_support';
  }

  /**
   * Check if file size is acceptable for processing
   */
  static isFileSizeAcceptable(fileSize: number): boolean {
    return fileSize <= this.MAX_FILE_SIZE;
  }

  /**
   * Get user-friendly file size message
   */
  static getFileSizeMessage(fileSize: number): string {
    const sizeMB = fileSize / 1024 / 1024;
    
    if (sizeMB > 10) {
      return `File is ${sizeMB.toFixed(1)}MB. Please compress to under 10MB.`;
    } else if (sizeMB > 5) {
      return `Large file (${sizeMB.toFixed(1)}MB) - processing may take longer.`;
    }
    
    return `File size: ${sizeMB.toFixed(1)}MB`;
  }
}

/**
 * Network-aware file processing with retry logic
 */
export class NetworkAwareFileProcessor {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAYS = [1000, 2000, 4000]; // Progressive delays

  /**
   * Process file with network resilience
   */
  static async processWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 ${context} - Attempt ${attempt + 1}/${this.MAX_RETRIES}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ ${context} failed (attempt ${attempt + 1}):`, error);
        
        // Don't retry on validation errors
        if (this.isNonRetryableError(error)) {
          break;
        }
        
        // Wait before retrying (except on last attempt)
        if (attempt < this.MAX_RETRIES - 1) {
          await this.delay(this.RETRY_DELAYS[attempt]);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check if error should not be retried
   */
  private static isNonRetryableError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return message.includes('invalid') || 
           message.includes('unsupported') || 
           message.includes('corrupted') ||
           message.includes('too large');
  }

  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check network connection
   */
  static async checkNetworkConnection(): Promise<boolean> {
    try {
      // Try to fetch a small resource to check connectivity
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
