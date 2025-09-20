
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
 * Validates MIME type against allowed types
 */
export const validateMimeType = (file: File): FileValidationResult => {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Only image files are allowed.`
    };
  }
  return { isValid: true };
};

/**
 * Validates file size
 */
export const validateFileSize = (file: File): FileValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum allowed size is 10MB.`
    };
  }
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File appears to be empty or corrupted.'
    };
  }
  return { isValid: true };
};

/**
 * Validates file signature (magic numbers) to ensure file type matches content
 */
export const validateFileSignature = async (file: File): Promise<FileValidationResult> => {
  try {
    // Read the first 12 bytes to check file signature
    const arrayBuffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    let isValidSignature = false;
    let detectedType = '';

    // Check against known signatures
    for (const [type, signature] of Object.entries(FILE_SIGNATURES)) {
      if (signature.every((byte, index) => bytes[index] === byte)) {
        isValidSignature = true;
        detectedType = type;
        break;
      }
    }

    // Special case for WebP - check for WEBP string at offset 8
    if (!isValidSignature && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      const webpCheck = await file.slice(8, 12).arrayBuffer();
      const webpBytes = new Uint8Array(webpCheck);
      if (webpBytes[0] === 0x57 && webpBytes[1] === 0x45 && webpBytes[2] === 0x42 && webpBytes[3] === 0x50) {
        isValidSignature = true;
        detectedType = 'webp';
      }
    }

    if (!isValidSignature) {
      return {
        isValid: false,
        error: 'File signature does not match expected image format. The file may be corrupted or not a valid image.'
      };
    }

    // Cross-check MIME type with detected signature
    const mimeToSignature: Record<string, string[]> = {
      'image/jpeg': ['jpeg'],
      'image/jpg': ['jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'image/bmp': ['bmp'],
      'image/tiff': ['tiff', 'tiffBE'],
    };

    const expectedSignatures = mimeToSignature[file.type.toLowerCase()];
    if (expectedSignatures && !expectedSignatures.includes(detectedType)) {
      return {
        isValid: false,
        error: `File type mismatch: File claims to be ${file.type} but signature indicates ${detectedType}.`
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Unable to validate file signature. File may be corrupted.'
    };
  }
};

/**
 * Scans file content for potentially malicious patterns
 */
export const scanForMaliciousContent = async (file: File): Promise<FileValidationResult> => {
  try {
    // For images, we'll scan the first and last portions as metadata can contain malicious code
    const fileSize = file.size;
    const chunkSize = Math.min(8192, Math.floor(fileSize / 4)); // Scan up to 8KB or 1/4 of file

    const warnings: string[] = [];

    // Check beginning of file
    const beginBuffer = await file.slice(0, chunkSize).arrayBuffer();
    const beginText = new TextDecoder('utf-8', { fatal: false }).decode(beginBuffer);

    // Check end of file  
    const endBuffer = await file.slice(Math.max(0, fileSize - chunkSize)).arrayBuffer();
    const endText = new TextDecoder('utf-8', { fatal: false }).decode(endBuffer);

    const contentToScan = beginText + endText;

    // Scan for malicious patterns
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(contentToScan)) {
        warnings.push(`Potentially suspicious content pattern detected: ${pattern.source}`);
      }
    }

    // Check for unusual executable signatures that might be embedded
    const executableSignatures = [
      [0x4D, 0x5A], // PE executable
      [0x7F, 0x45, 0x4C, 0x46], // ELF executable
      [0xCA, 0xFE, 0xBA, 0xBE], // Mach-O executable
    ];

    const bytes = new Uint8Array(beginBuffer);
    for (const signature of executableSignatures) {
      if (signature.every((byte, index) => bytes[index] === byte)) {
        return {
          isValid: false,
          error: 'File contains executable code signatures and may be malicious.'
        };
      }
    }

    // Check for excessively long metadata that might indicate payload injection
    if (contentToScan.length > chunkSize && contentToScan.match(/[a-zA-Z0-9+/]{100,}/)) {
      warnings.push('File contains unusually long encoded data that may indicate hidden content.');
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Unable to scan file content for security issues.'
    };
  }
};

/**
 * Comprehensive file validation that runs all checks
 */
export const validateImageFile = async (file: File): Promise<FileValidationResult> => {

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

  return {
    isValid: true,
    warnings: contentResult.warnings
  };
};
