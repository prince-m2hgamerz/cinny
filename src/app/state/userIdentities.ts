import { atom } from 'jotai';
import type { UserIdentityConfig } from '../hooks/useClientConfig';

export const userIdentityOverridesAtom = atom<UserIdentityConfig[]>([]);
