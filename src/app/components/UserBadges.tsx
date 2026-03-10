import React from 'react';
import { getUserIdentityMeta } from '../utils/verifiedUser';
import { VerifiedBadge } from './VerifiedBadge';
import * as css from './UserBadges.css';

type UserBadgesProps = css.UserRoleTagVariants & {
  userId: string | null | undefined;
  withGap?: boolean;
};

export function UserBadges({ userId, size, withGap }: UserBadgesProps) {
  const meta = getUserIdentityMeta(userId);

  if (!meta) return null;

  return (
    <span className={css.UserBadges} style={withGap ? { marginLeft: '0.25em' } : undefined}>
      <VerifiedBadge size={size} title={meta.tag ? `Verified ${meta.tag}` : 'Verified account'} />
      {meta.tag && (
        <span className={css.UserRoleTag({ size })} title={meta.tag}>
          {meta.tag}
        </span>
      )}
    </span>
  );
}
