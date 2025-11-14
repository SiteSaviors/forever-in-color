type CreateBillingPortalParams = {
  accessToken: string;
  returnUrl?: string;
};

export type BillingPortalResponse = {
  url: string;
};

export async function createBillingPortalSession({ accessToken, returnUrl }: CreateBillingPortalParams) {
  const response = await fetch('/functions/v1/create-billing-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ returnUrl }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error ?? 'Unable to open billing portal';
    throw new Error(message);
  }

  const data = (await response.json()) as BillingPortalResponse;
  if (!data?.url) {
    throw new Error('billing_portal_missing_url');
  }

  return data;
}
