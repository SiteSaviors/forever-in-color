import { supabaseClient } from './supabaseClient';

interface DownloadCleanImageParams {
  storagePath: string;
  filename: string;
  accessToken: string | null;
}

export async function downloadCleanImage({
  storagePath,
  filename,
  accessToken,
}: DownloadCleanImageParams): Promise<void> {
  if (!accessToken) {
    throw new Error('Authentication required for clean image download');
  }

  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }

  try {
    // Call the get-premium-preview edge function to get a signed URL
    const { data, error } = await supabaseClient.functions.invoke('get-premium-preview', {
      body: { storagePath },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (error) {
      console.error('[premiumDownload] Edge function error:', error);
      throw new Error(error.message || 'Failed to get premium preview');
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned from server');
    }

    // Fetch the image from the signed URL
    const imageResponse = await fetch(data.signedUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    // Convert to blob
    const blob = await imageResponse.blob();

    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('[premiumDownload] Clean image downloaded successfully');
  } catch (error) {
    console.error('[premiumDownload] Download failed:', error);
    throw error;
  }
}
