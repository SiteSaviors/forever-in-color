import { ENABLE_AUTH_GOOGLE, ENABLE_AUTH_MICROSOFT, ENABLE_AUTH_FACEBOOK } from '@/config/featureFlags';
import type { LucideIcon } from 'lucide-react';

export type ProviderId = 'google' | 'microsoft' | 'facebook';

type OAuthProviderIconVariant =
  | {
      iconType: 'asset';
      iconSrc: string;
    }
  | {
      iconType: 'lucide';
      icon: LucideIcon;
    };

export type OAuthProviderConfig = {
  id: ProviderId;
  supabaseId: ProviderId;
  label: string;
  cta: string;
  buttonTheme: 'light' | 'dark';
  enabled: boolean;
} & OAuthProviderIconVariant;

const PROVIDER_ICON_SOURCES: Record<ProviderId, string> = {
  google: '/Auth-Logos/Google-logo.svg',
  microsoft: '/Auth-Logos/Microsoft-logo.svg',
  facebook: '/Auth-Logos/Facebook-logo.svg',
};

export const OAUTH_PROVIDERS: readonly OAuthProviderConfig[] = [
  {
    id: 'google',
    supabaseId: 'google',
    label: 'Google',
    cta: 'Sign Up with Google',
    iconType: 'asset',
    iconSrc: PROVIDER_ICON_SOURCES.google,
    buttonTheme: 'light',
    enabled: ENABLE_AUTH_GOOGLE,
  },
  {
    id: 'microsoft',
    supabaseId: 'microsoft',
    label: 'Microsoft',
    cta: 'Sign Up with Microsoft',
    iconType: 'asset',
    iconSrc: PROVIDER_ICON_SOURCES.microsoft,
    buttonTheme: 'light',
    enabled: ENABLE_AUTH_MICROSOFT,
  },
  {
    id: 'facebook',
    supabaseId: 'facebook',
    label: 'Facebook',
    cta: 'Sign Up with Facebook',
    iconType: 'asset',
    iconSrc: PROVIDER_ICON_SOURCES.facebook,
    buttonTheme: 'light',
    enabled: ENABLE_AUTH_FACEBOOK,
  },
];
export const getEnabledProviders = (): OAuthProviderConfig[] =>
  OAUTH_PROVIDERS.filter((provider) => provider.enabled);
