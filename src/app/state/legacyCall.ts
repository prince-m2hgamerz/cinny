import { atom } from 'jotai';
import type { MatrixCall } from 'matrix-js-sdk/lib/webrtc/call';

export type LegacyCallState = {
  call: MatrixCall;
  incoming: boolean;
};

export const legacyCallAtom = atom<LegacyCallState | null>(null);
