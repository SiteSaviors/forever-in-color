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
    headers: (() => {
      const authToken = options.accessToken ?? SUPABASE_ANON_KEY ?? null;
      return {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };
    })(),
    credentials: options.accessToken ? 'include' : 'omit',
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

export type OrderLineItem = {
  name: string;
  description?: string;
  amount: number;
  quantity?: number;
};

export const createOrderCheckoutSession = async (options: {
  items: OrderLineItem[];
  accessToken: string | null;
  customerEmail?: string | null;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ url: string; sessionId: string }> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration missing');
  }

  if (!options.items || options.items.length === 0) {
    throw new Error('At least one order item is required');
  }

  const payload = {
    currency: options.currency ?? 'usd',
    customerEmail: options.customerEmail ?? undefined,
    items: options.items.map((item) => ({
      ...item,
      amount: Math.round(item.amount),
    })),
    successUrl: options.successUrl,
    cancelUrl: options.cancelUrl,
  };

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
    method: 'POST',
    headers: (() => {
      const authToken = options.accessToken ?? SUPABASE_ANON_KEY ?? null;
      return {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      };
    })(),
    credentials: options.accessToken ? 'include' : 'omit',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || 'Failed to create order checkout session');
  }

  return response.json() as Promise<{ url: string; sessionId: string }>;
};
