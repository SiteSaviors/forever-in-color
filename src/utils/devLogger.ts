type LogLevel = 'log' | 'warn' | 'error';

type DevLogOptions = {
  /**
   * Additional field names that should be masked before logging.
   */
  maskKeys?: string[];
};

const DEFAULT_SENSITIVE_KEYS = [
  'access_token',
  'refresh_token',
  'authorization',
  'token',
  'email',
];

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TOKEN_LIKE_REGEX = /^[a-z0-9._=-]+$/i;

const maskString = (value: string): string => {
  if (value.length <= 6) {
    return '*'.repeat(value.length);
  }
  const head = value.slice(0, 3);
  const tail = value.slice(-3);
  return `${head}***${tail}`;
};

const maskEmail = (value: string): string => {
  const [localPart, domain] = value.split('@');
  if (!domain || localPart.length === 0) {
    return maskString(value);
  }
  const firstChar = localPart[0];
  const maskedLocal = `${firstChar}${'*'.repeat(Math.max(localPart.length - 1, 1))}`;
  return `${maskedLocal}@${domain}`;
};

const shouldMaskString = (value: string, keyName?: string, maskKeys?: Set<string>) => {
  if (maskKeys?.has((keyName ?? '').toLowerCase())) {
    return true;
  }
  if (EMAIL_REGEX.test(value)) {
    return true;
  }
  if (value.length >= 12 && TOKEN_LIKE_REGEX.test(value)) {
    return true;
  }
  return false;
};

const sanitizeValue = (value: unknown, keyName?: string, maskKeys?: Set<string>): unknown => {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    if (shouldMaskString(value, keyName, maskKeys)) {
      return EMAIL_REGEX.test(value) ? maskEmail(value) : maskString(value);
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, undefined, maskKeys));
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
      childKey,
      sanitizeValue(childValue, childKey, maskKeys),
    ]);
    return Object.fromEntries(entries);
  }

  return value;
};

const devLogInternal = (
  level: LogLevel,
  scope: string,
  message: string,
  data?: unknown,
  options?: DevLogOptions
) => {
  if (!import.meta.env.DEV) {
    return;
  }

  const maskKeys = new Set(
    [...DEFAULT_SENSITIVE_KEYS, ...(options?.maskKeys ?? [])].map((key) => key.toLowerCase())
  );

  if (typeof data === 'undefined') {
    console[level](`[${scope}] ${message}`);
    return;
  }

  const sanitized = sanitizeValue(data, undefined, maskKeys);
  console[level](`[${scope}] ${message}`, sanitized);
};

export const devLog = (scope: string, message: string, data?: unknown, options?: DevLogOptions) =>
  devLogInternal('log', scope, message, data, options);

export const devWarn = (scope: string, message: string, data?: unknown, options?: DevLogOptions) =>
  devLogInternal('warn', scope, message, data, options);

export const devError = (scope: string, message: string, data?: unknown, options?: DevLogOptions) =>
  devLogInternal('error', scope, message, data, options);
