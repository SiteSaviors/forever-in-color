
export async function logSecurityEvent(
  eventType: string, 
  message: string, 
  req: Request, 
  additionalDetails?: any
) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const securityEvent = {
      event_type: eventType,
      ip_address: clientIP,
      user_agent: userAgent,
      details: additionalDetails || {},
      severity: 'medium',
      timestamp: new Date().toISOString()
    };

    console.error('🚨 SECURITY EVENT:', JSON.stringify(securityEvent, null, 2));
    
    // Could store in database here if needed
    return true;
  } catch (error) {
    console.error('Failed to log security event:', error);
    return false;
  }
}
