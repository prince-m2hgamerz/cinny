import React, { useMemo } from 'react';
import { useClientConfig } from '../hooks/useClientConfig';
import { createUserIdentityMap, getUserIdentityMeta } from '../utils/verifiedUser';
import { VerifiedBadge } from './VerifiedBadge';
import * as css from './UserBadges.css';

type UserBadgesProps = Pick<css.UserRoleTagVariants, 'size'> & {
  userId: string | null | undefined;
  withGap?: boolean;
};

export function UserBadges({ userId, size, withGap }: UserBadgesProps) {
  const { userIdentities } = useClientConfig();
  const identityMap = useMemo(() => createUserIdentityMap(userIdentities), [userIdentities]);
  const meta = getUserIdentityMeta(userId, identityMap);

  if (!meta || (!meta.verified && !meta.tag)) return null;

  return (
    <span className={css.UserBadges} style={withGap ? { marginLeft: '0.25em' } : undefined}>
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
