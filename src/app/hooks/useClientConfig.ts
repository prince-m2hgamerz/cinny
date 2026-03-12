import { createContext, useContext } from 'react';
import type { IconName } from 'folds';

export type HashRouterConfig = {
  enabled?: boolean;
  basename?: string;
};

export type UserIdentityTagTone = 'critical' | 'blue' | 'green' | 'gold' | 'gray';

export type UserIdentityConfig = {
  userId: string;
  verified?: boolean;
  tag?: string;
  tagTone?: UserIdentityTagTone;
  badgeTitle?: string;
  premium?: boolean;
  premiumPlan?: PremiumPlan;
  premiumUntil?: string;
  premiumSince?: string;
};

export type PremiumPlan = 'monthly' | 'yearly' | 'lifetime' | 'trial';

export type PremiumFeatureConfig = {
  key: string;
  title: string;
  description?: string;
  icon?: IconName;
};

export type PremiumConfig = {
  enabled?: boolean;
  monthlyPrice?: string;
  yearlyPrice?: string;
  yearlyDiscount?: string;
  features?: PremiumFeatureConfig[];
  identityRoom?: string;
};

export type AdminPanelConfig = {
  enabled?: boolean;
  url?: string;
  allowedUserIds?: string[];
  identityRoom?: string;
};

export type ClientConfig = {
  defaultHomeserver?: number;
  homeserverList?: string[];
  allowCustomHomeservers?: boolean;

  featuredCommunities?: {
    openAsDefault?: boolean;
    spaces?: string[];
    rooms?: string[];
    servers?: string[];
  };

  hashRouter?: HashRouterConfig;
  userIdentities?: UserIdentityConfig[];
  adminPanel?: AdminPanelConfig;
  premium?: PremiumConfig;
};

const ClientConfigContext = createContext<ClientConfig | null>(null);

export const ClientConfigProvider = ClientConfigContext.Provider;

export function useClientConfig(): ClientConfig {
  const config = useContext(ClientConfigContext);
  if (!config) throw new Error('Client config are not provided!');
  return config;
}

export const clientDefaultServer = (clientConfig: ClientConfig): string =>
  clientConfig.homeserverList?.[clientConfig.defaultHomeserver ?? 0] ?? 'vgram.m2hio.in';

export const clientAllowedServer = (clientConfig: ClientConfig, server: string): boolean => {
  const { homeserverList, allowCustomHomeservers } = clientConfig;

  if (allowCustomHomeservers) return true;

  return homeserverList?.includes(server) === true;
};
