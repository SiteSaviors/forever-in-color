
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
    
    const _securityEvent = {
      event_type: eventType,
      ip_address: clientIP,
      user_agent: userAgent,
      details: additionalDetails || {},
      severity: 'medium',
      timestamp: new Date().toISOString()
    };

    
    
    // Could store in database here if needed
    return true;
  } catch (error) {
    return false;
  }
}
