import { useCallback } from 'react';
import { useAtom } from 'jotai';
import type { Room } from 'matrix-js-sdk';
import { CallType, CallEvent } from 'matrix-js-sdk/lib/webrtc/call';
import { useMatrixClient } from './useMatrixClient';
import { legacyCallAtom } from '../state/legacyCall';

export const useLegacyCall = () => {
  const mx = useMatrixClient();
  const [legacyCall, setLegacyCall] = useAtom(legacyCallAtom);

  const startLegacyCall = useCallback(
    async (room: Room, type: CallType) => {
      if (!mx.supportsVoip()) {
        throw new Error('VoIP is not supported in this browser');
      }

      if (legacyCall?.call) {
        throw new Error('Already in another call');
      }

      const call = mx.createCall(room.roomId);
      if (!call) {
        throw new Error('Failed to start call');
      }

      call.on(CallEvent.Hangup, () => {
        setLegacyCall((current) => (current?.call === call ? null : current));
      });

      setLegacyCall({ call, incoming: false });

      try {
        if (type === CallType.Voice) {
          await call.placeVoiceCall();
        } else {
          await call.placeVideoCall();
        }
      } catch (error) {
        setLegacyCall((current) => (current?.call === call ? null : current));
        throw error;
      }
    },
    [legacyCall, mx, setLegacyCall]
  );

  return {
    legacyCall,
    setLegacyCall,
    startLegacyCall,
  };
};
