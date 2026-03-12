import { atom } from 'jotai';
import type { PremiumRequest, PremiumRequestStatus, PremiumSettings } from '../utils/premium';

export type PremiumModalState = {
  open: boolean;
  feature?: string;
};

export const premiumModalAtom = atom<PremiumModalState>({
  open: false,
});

export const premiumSettingsAtom = atom<PremiumSettings | null>(null);

export const premiumRequestStatusAtom = atom<Record<string, PremiumRequestStatus>>({});

export const premiumRequestInboxAtom = atom<PremiumRequest[]>([]);
