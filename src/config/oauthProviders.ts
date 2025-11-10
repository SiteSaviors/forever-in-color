import { ENABLE_AUTH_GOOGLE, ENABLE_AUTH_MICROSOFT, ENABLE_AUTH_FACEBOOK } from '@/config/featureFlags';
import type { LucideIcon } from 'lucide-react';
import { Chrome, MonitorSmartphone, Users } from 'lucide-react';

export type ProviderId = 'google' | 'microsoft' | 'facebook';

export type OAuthProviderConfig = {
  id: ProviderId;
  supabaseId: ProviderId;
  label: string;
  cta: string;
  icon: LucideIcon;
  buttonTheme: 'light' | 'dark';
  enabled: boolean;
};

export const OAUTH_PROVIDERS: readonly OAuthProviderConfig[] = [
  {
    id: 'google',
    supabaseId: 'google',
    label: 'Google',
    cta: 'Continue with Google',
    icon: Chrome,
    buttonTheme: 'light',
    enabled: ENABLE_AUTH_GOOGLE,
  },
  {
    id: 'microsoft',
    supabaseId: 'microsoft',
    label: 'Microsoft',
    cta: 'Continue with Microsoft',
    icon: MonitorSmartphone,
    buttonTheme: 'light',
    enabled: ENABLE_AUTH_MICROSOFT,
  },
  {
    id: 'facebook',
    supabaseId: 'facebook',
    label: 'Facebook',
    cta: 'Continue with Facebook',
    icon: Users,
    buttonTheme: 'light',
    enabled: ENABLE_AUTH_FACEBOOK,
  },
];
export const getEnabledProviders = (): OAuthProviderConfig[] =>
  OAUTH_PROVIDERS.filter((provider) => provider.enabled);
