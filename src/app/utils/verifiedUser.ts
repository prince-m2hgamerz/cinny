import { Room } from 'matrix-js-sdk';
import type { UserIdentityConfig, UserIdentityTagTone } from '../hooks/useClientConfig';
import { guessDmRoomUserId } from './matrix';

export type UserIdentityMeta = {
  verified?: boolean;
  tag?: string;
  tagTone?: UserIdentityTagTone;
  badgeTitle?: string;
};

export const USER_IDENTITIES_EVENT_TYPE = 'org.vchat.user_identities';

export type UserIdentityOverridesEventContent = {
  version?: number;
  updatedAt?: string;
  updatedBy?: string;
  identities?: UserIdentityConfig[];
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

const USER_IDENTITIES_STORAGE_KEY = 'vchat.userIdentities';

const isTagTone = (value: unknown): value is UserIdentityTagTone =>
  value === 'critical' ||
  value === 'blue' ||
  value === 'green' ||
  value === 'gold' ||
  value === 'gray';

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

export const normalizeIdentityConfig = (
  identity: UserIdentityConfig
): UserIdentityConfig | undefined => {
  if (typeof identity.userId !== 'string') return undefined;
  const userId = identity.userId.trim();
  if (userId === '') return undefined;

  const tag = typeof identity.tag === 'string' ? identity.tag.trim() : undefined;
  const badgeTitle =
    typeof identity.badgeTitle === 'string' ? identity.badgeTitle.trim() : undefined;
  const tagTone = isTagTone(identity.tagTone) ? identity.tagTone : 'critical';

  return {
    userId,
    verified: identity.verified ?? true,
    tag,
    tagTone,
    badgeTitle,
  };
};

export const normalizeIdentityList = (value: unknown): UserIdentityConfig[] => {
  if (!Array.isArray(value)) return [];
  const identityMap = new Map<string, UserIdentityConfig>();
  value.forEach((entry) => {
    const normalized = normalizeIdentityConfig(entry as UserIdentityConfig);
    if (!normalized) return;
    identityMap.set(normalized.userId, normalized);
  });
  return Array.from(identityMap.values()).sort((a, b) => a.userId.localeCompare(b.userId));
};

export const extractUserIdentityListFromContent = (
  content: unknown
): UserIdentityConfig[] | null => {
  if (Array.isArray(content)) return normalizeIdentityList(content);
  if (!content || typeof content !== 'object') return null;
  const identities =
    (content as UserIdentityOverridesEventContent).identities ??
    (content as { users?: unknown }).users;
  if (identities === undefined) return null;
  return normalizeIdentityList(identities);
};

export const loadUserIdentityOverrides = (): UserIdentityConfig[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_IDENTITIES_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return normalizeIdentityList(data);
  } catch {
    return [];
  }
};

export const saveUserIdentityOverrides = (identities: UserIdentityConfig[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(USER_IDENTITIES_STORAGE_KEY, JSON.stringify(identities, null, 2));
};

export const createUserIdentityMap = (
  userIdentities?: UserIdentityConfig[],
  overrides?: UserIdentityConfig[] | null
): Record<string, UserIdentityMeta> => {
  const identityMap: Record<string, UserIdentityMeta> = {};

  if (userIdentities === undefined) {
    Object.entries(DEFAULT_USER_IDENTITIES).forEach(([userId, meta]) => {
      identityMap[userId] = normalizeMeta(meta);
    });
  }

  userIdentities?.forEach((identity) => {
    const normalized = normalizeIdentityConfig(identity);
    if (!normalized) return;
    identityMap[normalized.userId] = normalizeMeta(normalized);
  });

  const resolvedOverrides = overrides ?? loadUserIdentityOverrides();
  resolvedOverrides.forEach((identity) => {
    const normalized = normalizeIdentityConfig(identity);
    if (!normalized) return;
    identityMap[normalized.userId] = normalizeMeta(normalized);
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
