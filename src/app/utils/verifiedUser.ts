import { Room } from 'matrix-js-sdk';
import type { UserIdentityConfig, UserIdentityTagTone } from '../hooks/useClientConfig';
import { guessDmRoomUserId } from './matrix';

export type UserIdentityMeta = {
  verified?: boolean;
  tag?: string;
  tagTone?: UserIdentityTagTone;
  badgeTitle?: string;
};

const DEFAULT_USER_IDENTITIES: Record<string, UserIdentityMeta> = {
  '@m2h:vgram.m2hio.in': {
    verified: true,
    tag: 'CEO',
    tagTone: 'critical',
    badgeTitle: 'Verified CEO',
  },
  '@admin:vgram.m2hio.in': {
    verified: true,
    tag: 'ADMIN',
    tagTone: 'blue',
    badgeTitle: 'Verified admin',
  },
  '@verma6307:vgram.m2hio.in': {
    verified: true,
    tag: 'Tester',
    tagTone: 'green',
    badgeTitle: 'Verified tester',
  },
  '@krish:vgram.m2hio.in': {
    verified: true,
    tag: 'Administrator',
    tagTone: 'gold',
    badgeTitle: 'Verified administrator',
  },
};

const normalizeMeta = (meta: UserIdentityMeta): UserIdentityMeta => {
  const tag = typeof meta.tag === 'string' && meta.tag.trim() ? meta.tag.trim() : undefined;
  const badgeTitle =
    typeof meta.badgeTitle === 'string' && meta.badgeTitle.trim()
      ? meta.badgeTitle.trim()
      : undefined;

  return {
    verified: meta.verified ?? true,
    tag,
    tagTone: meta.tagTone ?? 'critical',
    badgeTitle,
  };
};

export const createUserIdentityMap = (
  userIdentities?: UserIdentityConfig[]
): Record<string, UserIdentityMeta> => {
  const identityMap: Record<string, UserIdentityMeta> = {};

  if (userIdentities === undefined) {
    Object.entries(DEFAULT_USER_IDENTITIES).forEach(([userId, meta]) => {
      identityMap[userId] = normalizeMeta(meta);
    });
  }

  userIdentities?.forEach((identity) => {
    if (typeof identity.userId !== 'string') return;

    const userId = identity.userId.trim();
    if (userId === '') return;

    identityMap[userId] = normalizeMeta(identity);
  });

  return identityMap;
};

export const getUserIdentityMeta = (
  userId: string | null | undefined,
  identityMap: Record<string, UserIdentityMeta> = DEFAULT_USER_IDENTITIES
): UserIdentityMeta | undefined => {
  if (!userId) return undefined;

  return identityMap[userId];
};

export const isVerifiedUser = (
  userId: string | null | undefined,
  identityMap: Record<string, UserIdentityMeta> = DEFAULT_USER_IDENTITIES
): boolean => !!getUserIdentityMeta(userId, identityMap)?.verified;

export const getDirectRoomTargetUserId = (
  room: Room,
  myUserId: string | null | undefined
): string | undefined => {
  if (!myUserId) return undefined;

  return guessDmRoomUserId(room, myUserId);
};
