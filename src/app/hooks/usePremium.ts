import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useClientConfig } from './useClientConfig';
import { userIdentityOverridesAtom } from '../state/userIdentities';
import { premiumRequestInboxAtom, premiumRequestStatusAtom, premiumSettingsAtom } from '../state/premium';
import {
  createUserIdentityMap,
  getUserIdentityMeta,
  isPremiumActive,
} from '../utils/verifiedUser';
import {
  DEFAULT_PREMIUM_SETTINGS,
  mergePremiumSettings,
  premiumConfigToSettings,
} from '../utils/premium';

export function usePremiumStatus(userId: string | null | undefined) {
  const { userIdentities } = useClientConfig();
  const overrides = useAtomValue(userIdentityOverridesAtom);
  const identityMap = useMemo(
    () => createUserIdentityMap(userIdentities, overrides),
    [overrides, userIdentities]
  );
  const meta = getUserIdentityMeta(userId, identityMap);
  const active = isPremiumActive(meta);

  return {
    active,
    plan: meta?.premiumPlan,
    until: meta?.premiumUntil,
    since: meta?.premiumSince,
  };
}

export function usePremiumSettings() {
  const { premium } = useClientConfig();
  const override = useAtomValue(premiumSettingsAtom);

  return useMemo(() => {
    const base = premiumConfigToSettings(premium ?? DEFAULT_PREMIUM_SETTINGS);
    return mergePremiumSettings(base, override);
  }, [override, premium]);
}

export function usePremiumRequestStatus(userId: string | null | undefined) {
  const statusMap = useAtomValue(premiumRequestStatusAtom);
  if (!userId) return undefined;
  return statusMap[userId];
}

export function usePremiumRequestInbox() {
  return useAtomValue(premiumRequestInboxAtom);
}
