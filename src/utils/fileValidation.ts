
// File validation utilities for secure image uploads
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

// Known file signatures (magic numbers) for image types
const FILE_SIGNATURES = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46],
  webp: [0x52, 0x49, 0x46, 0x46],  // RIFF header for WebP
  bmp: [0x42, 0x4D],
  tiff: [0x49, 0x49, 0x2A, 0x00], // Little-endian TIFF
  tiffBE: [0x4D, 0x4D, 0x00, 0x2A], // Big-endian TIFF
};

// Allowed MIME types for images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp', 
  'image/bmp',
  'image/tiff',
  'image/heic',
  'image/heif'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Suspicious patterns that might indicate malicious content
const MALICIOUS_PATTERNS = [
  // Script tags
  /<script[\s\S]*?<\/script>/gi,
  // PHP tags
  /<\?php[\s\S]*?\?>/gi,
  // JSP tags
  /<%[\s\S]*?%>/gi,
  // ASP tags
  /<%[\s\S]*?%>/gi,
  // SQL injection patterns
  /(union|select|insert|update|delete|drop|create|alter)\s+/gi,
  // XSS patterns
  /(javascript:|vbscript:|data:text\/html)/gi,
];

/**
 * Comprehensive file validation that runs all checks
 */
export const validateImageFile = async (file: File): Promise<FileValidationResult> => {
  console.log('Starting comprehensive file validation for:', file.name);

  // Step 1: Basic validations
  const mimeResult = validateMimeType(file);
  if (!mimeResult.isValid) {
    return mimeResult;
  }

  const sizeResult = validateFileSize(file);
  if (!sizeResult.isValid) {
    return sizeResult;
  }

  // Step 2: File signature validation
  const signatureResult = await validateFileSignature(file);
  if (!signatureResult.isValid) {
    return signatureResult;
  }

  // Step 3: Malicious content scanning
  const contentResult = await scanForMaliciousContent(file);
  if (!contentResult.isValid) {
    return contentResult;
  }

  console.log('File validation completed successfully');
  
  return {
    isValid: true,
    warnings: contentResult.warnings
  };
};
