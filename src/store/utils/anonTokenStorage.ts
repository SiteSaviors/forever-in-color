export const loadAnonTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('wt_anon_token');
  } catch {
    return null;
  }
};

export const persistAnonToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem('wt_anon_token', token);
    } else {
      localStorage.removeItem('wt_anon_token');
    }
  } catch {
    // Ignore storage failures silently
  }
};
