
import { StylePreviewResponse } from './types.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const createSuccessResponse = (
  styleDescription: string,
  previewUrl: string,
  styleId: number,
  styleName: string,
  note?: string
): Response => {
  const responseData: StylePreviewResponse = {
    success: true,
    styleDescription,
    previewUrl,
    styleId,
    styleName,
    ...(note && { note })
  };

  return new Response(
    JSON.stringify(responseData),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

export const createErrorResponse = (
  error: string,
  status: number,
  details?: string
): Response => {
  const responseData: StylePreviewResponse = {
    success: false,
    error,
    styleDescription: '',
    previewUrl: '',
    styleId: 0,
    styleName: '',
    ...(details && { details })
  };

  return new Response(
    JSON.stringify(responseData),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

export const createCorsResponse = (): Response => {
  return new Response('ok', { headers: corsHeaders });
};
