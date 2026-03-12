import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';
import { useClientConfig } from '../hooks/useClientConfig';
import { userIdentityOverridesAtom } from '../state/userIdentities';
import {
  createUserIdentityMap,
  getUserIdentityMeta,
  isPremiumActive,
} from '../utils/verifiedUser';
import { PremiumBadge } from './PremiumBadge';
import { VerifiedBadge } from './VerifiedBadge';
import * as css from './UserBadges.css';

type UserBadgesProps = Pick<css.UserRoleTagVariants, 'size'> & {
  userId: string | null | undefined;
  withGap?: boolean;
};

export function UserBadges({ userId, size, withGap }: UserBadgesProps) {
  const { userIdentities } = useClientConfig();
  const overrides = useAtomValue(userIdentityOverridesAtom);
  const identityMap = useMemo(
    () => createUserIdentityMap(userIdentities, overrides),
    [overrides, userIdentities]
  );
  const meta = getUserIdentityMeta(userId, identityMap);

  const premiumActive = isPremiumActive(meta);
  if (!meta || (!meta.verified && !meta.tag && !premiumActive)) return null;

  return (
    <span className={css.UserBadges} style={withGap ? { marginLeft: '0.25em' } : undefined}>
      {premiumActive && <PremiumBadge size={size} title="Premium member" />}
      {meta.verified && (
        <VerifiedBadge
          size={size}
          title={meta.badgeTitle ?? (meta.tag ? `Verified ${meta.tag}` : 'Verified account')}
        />
      )}
      {meta.tag && (
        <span className={css.UserRoleTag({ size, tone: meta.tagTone ?? 'critical' })} title={meta.tag}>
          {meta.tag}
        </span>
      )}
    </span>
  );
}
