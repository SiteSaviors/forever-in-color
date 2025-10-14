const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

type CheckoutTier = 'creator' | 'plus' | 'pro';

export const createCheckoutSession = async (options: {
  tier: CheckoutTier;
  accessToken: string | null;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ url: string }> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration missing');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify({
      tier: options.tier,
      successUrl: options.successUrl,
      cancelUrl: options.cancelUrl,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to create checkout session');
  }

  return response.json() as Promise<{ url: string }>;
};
