// Security event logging utility for monitoring authentication and security events
export interface SecurityEvent {
  event_type: 'auth_failure' | 'rate_limit_violation' | 'suspicious_upload' | 'session_timeout' | 'invalid_origin' | 'malicious_content_detected';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory
  
  private getClientInfo() {
    return {
      ip_address: 'client', // In browser context, we can't get real IP
      user_agent: navigator.userAgent || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  logEvent(event: Omit<SecurityEvent, 'timestamp' | 'ip_address' | 'user_agent'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      ...this.getClientInfo()
    };

    // Add to memory store
    this.events.unshift(securityEvent);
    if (this.events.length > this.maxEvents) {
      this.events.pop();
    }

    // Send to monitoring endpoint if available
    this.sendToMonitoring(securityEvent);

    // Show user-friendly alerts for high severity events
    if (securityEvent.severity === 'high' || securityEvent.severity === 'critical') {
      this.showSecurityAlert(securityEvent);
    }
  }

  private async sendToMonitoring(event: SecurityEvent) {
    try {
      // Store security events locally and batch send them
      const existingEvents = JSON.parse(localStorage.getItem('security_events') || '[]');
      existingEvents.push(event);
      
      // Keep only last 100 events in localStorage
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100);
      }
      
      localStorage.setItem('security_events', JSON.stringify(existingEvents));
    } catch (error) {
      // Failed to store security event
    }
  }

  private showSecurityAlert(event: SecurityEvent) {
    // For high severity events, we could show a toast or modal
    const message = this.getAlertMessage(event);
  }

  private getAlertMessage(event: SecurityEvent): string {
    switch (event.event_type) {
      case 'auth_failure':
        return 'Multiple failed login attempts detected';
      case 'rate_limit_violation':
        return 'Rate limit exceeded - please slow down';
      case 'suspicious_upload':
        return 'Suspicious file upload detected';
      case 'malicious_content_detected':
        return 'Potentially malicious content blocked';
      case 'invalid_origin':
        return 'Request from unauthorized origin';
      default:
        return 'Security event detected';
    }
  }

  getRecentEvents(limit = 50): SecurityEvent[] {
    return this.events.slice(0, limit);
  }

  getEventsByType(eventType: SecurityEvent['event_type'], limit = 20): SecurityEvent[] {
    return this.events.filter(event => event.event_type === eventType).slice(0, limit);
  }

  getSecuritySummary() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentEvents = this.events.filter(
      event => new Date(event.timestamp) > oneHourAgo
    );

    return {
      total_events_last_hour: recentEvents.length,
      auth_failures: recentEvents.filter(e => e.event_type === 'auth_failure').length,
      rate_limit_violations: recentEvents.filter(e => e.event_type === 'rate_limit_violation').length,
      suspicious_uploads: recentEvents.filter(e => e.event_type === 'suspicious_upload').length,
      high_severity_events: recentEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length
    };
  }
}

export const securityLogger = new SecurityLogger();

// Helper functions for common security events
export const logAuthFailure = (email: string, reason: string, userId?: string) => {
  securityLogger.logEvent({
    event_type: 'auth_failure',
    user_id: userId,
    details: { email, reason, attempt_count: getFailedAttemptCount(email) },
    severity: getFailedAttemptCount(email) > 3 ? 'high' : 'medium'
  });
};

export const logRateLimitViolation = (userId: string, endpoint: string, attemptCount: number) => {
  securityLogger.logEvent({
    event_type: 'rate_limit_violation',
    user_id: userId,
    details: { endpoint, attempt_count: attemptCount },
    severity: attemptCount > 10 ? 'high' : 'medium'
  });
};

export const logSuspiciousUpload = (userId: string, fileName: string, reason: string) => {
  securityLogger.logEvent({
    event_type: 'suspicious_upload',
    user_id: userId,
    details: { file_name: fileName, reason },
    severity: 'high'
  });
};

export const logMaliciousContent = (userId: string, contentType: string, reason: string) => {
  securityLogger.logEvent({
    event_type: 'malicious_content_detected',
    user_id: userId,
    details: { content_type: contentType, reason },
    severity: 'critical'
  });
};

export const logInvalidOrigin = (origin: string, userId?: string) => {
  securityLogger.logEvent({
    event_type: 'invalid_origin',
    user_id: userId,
    details: { origin },
    severity: 'high'
  });
};

export const logSessionTimeout = (userId: string, sessionDuration: number) => {
  securityLogger.logEvent({
    event_type: 'session_timeout',
    user_id: userId,
    details: { session_duration_minutes: Math.round(sessionDuration / 60000) },
    severity: 'low'
  });
};

// Track failed authentication attempts
const FAILED_ATTEMPTS_KEY = 'failed_auth_attempts';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const getFailedAttemptCount = (email: string): number => {
  try {
    const attempts = JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}');
    const emailAttempts = attempts[email];
    if (!emailAttempts) return 0;
    
    // Check if lockout period has expired
    if (Date.now() - emailAttempts.lastAttempt > LOCKOUT_DURATION) {
      delete attempts[email];
      localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
      return 0;
    }
    
    return emailAttempts.count || 0;
  } catch {
    return 0;
  }
};

export const incrementFailedAttempts = (email: string): number => {
  try {
    const attempts = JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}');
    const currentCount = getFailedAttemptCount(email);
    const newCount = currentCount + 1;
    
    attempts[email] = {
      count: newCount,
      lastAttempt: Date.now()
    };
    
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
    return newCount;
  } catch {
    return 1;
  }
};

export const clearFailedAttempts = (email: string) => {
  try {
    const attempts = JSON.parse(localStorage.getItem(FAILED_ATTEMPTS_KEY) || '{}');
    delete attempts[email];
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // Silent fail
  }
};

export const isAccountLocked = (email: string): boolean => {
  return getFailedAttemptCount(email) >= MAX_FAILED_ATTEMPTS;
};
