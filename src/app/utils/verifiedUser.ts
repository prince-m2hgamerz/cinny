import { Room } from 'matrix-js-sdk';
import { guessDmRoomUserId } from './matrix';

export type UserIdentityMeta = {
  tag?: string;
};

const VERIFIED_USERS: Record<string, UserIdentityMeta> = {
  '@m2h:vgram.m2hio.in': {
    tag: 'CEO',
  },
  '@admin:vgram.m2hio.in': {},
  '@verma6307:vgram.m2hio.in': {
    tag: 'Tester',
  },
  '@krish:vgram.m2hio.in': {
    tag: 'Administrator ',
  },
};

export const getUserIdentityMeta = (
  userId: string | null | undefined
): UserIdentityMeta | undefined => {
  if (!userId) return undefined;

  return VERIFIED_USERS[userId];
};

export const isVerifiedUser = (userId: string | null | undefined): boolean =>
  !!getUserIdentityMeta(userId);

export const getDirectRoomTargetUserId = (
  room: Room,
  myUserId: string | null | undefined
): string | undefined => {
  if (!myUserId) return undefined;

  return guessDmRoomUserId(room, myUserId);
};
