import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import {
  CallErrorCode,
  CallEvent,
  CallState,
  CallType,
  MatrixCall,
} from 'matrix-js-sdk/lib/webrtc/call';
import { CallEventHandlerEvent } from 'matrix-js-sdk/lib/webrtc/callEventHandler';
import { Box, Button, Icon, IconButton, Icons, Overlay, OverlayBackdrop, OverlayCenter, Text } from 'folds';
import { useMatrixClient } from '../hooks/useMatrixClient';
import { legacyCallAtom } from '../state/legacyCall';
import { getMemberDisplayName } from '../utils/room';
import { getMxIdLocalPart } from '../utils/matrix';

const getCallStatus = (incoming: boolean, type: CallType, state: CallState): string => {
  if (incoming) {
    return type === CallType.Video ? 'Incoming video call' : 'Incoming voice call';
  }
  switch (state) {
    case CallState.Connected:
      return 'In call';
    case CallState.Ringing:
      return 'Ringing...';
    case CallState.InviteSent:
    case CallState.WaitLocalMedia:
    case CallState.CreateOffer:
    case CallState.CreateAnswer:
    case CallState.Connecting:
      return 'Connecting...';
    case CallState.Ended:
      return 'Call ended';
    default:
      return 'Calling...';
  }
};

function LegacyCallOverlay({
  call,
  incoming,
  onAccept,
  onReject,
  onHangup,
}: {
  call: MatrixCall;
  incoming: boolean;
  onAccept: () => Promise<void>;
  onReject: () => void;
  onHangup: () => void;
}) {
  const mx = useMatrixClient();
  const room = mx.getRoom(call.roomId);
  const opponent = call.getOpponentMember();
  let displayName: string | undefined;
  if (opponent) {
    displayName = room ? getMemberDisplayName(room, opponent.userId) ?? opponent.name : opponent.name;
  }

  const title = useMemo(
    () => displayName ?? room?.name ?? getMxIdLocalPart(call.roomId) ?? call.roomId,
    [call.roomId, displayName, room?.name]
  );

  const [callState, setCallState] = useState(call.state);
  const [micMuted, setMicMuted] = useState(call.isMicrophoneMuted());
  const [videoMuted, setVideoMuted] = useState(call.isLocalVideoMuted());
  const [remoteHasVideo, setRemoteHasVideo] = useState(call.hasRemoteUserMediaVideoTrack);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const updateStreams = useCallback(() => {
    const localStream = call.localUsermediaStream ?? call.localScreensharingStream;
    const remoteStream = call.remoteUsermediaStream ?? call.remoteScreensharingStream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream ?? null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream ?? null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream ?? null;
    }
    setRemoteHasVideo(call.hasRemoteUserMediaVideoTrack);
  }, [call]);

  useEffect(() => {
    updateStreams();

    const handleState = (state: CallState) => setCallState(state);
    const handleFeeds = () => updateStreams();

    call.on(CallEvent.State, handleState);
    call.on(CallEvent.FeedsChanged, handleFeeds);

    return () => {
      call.off(CallEvent.State, handleState);
      call.off(CallEvent.FeedsChanged, handleFeeds);
    };
  }, [call, updateStreams]);

  const statusText = getCallStatus(incoming, call.type, callState);

  const handleToggleMic = async () => {
    const next = !call.isMicrophoneMuted();
    await call.setMicrophoneMuted(next);
    setMicMuted(next);
  };

  const handleToggleVideo = async () => {
    const next = !call.isLocalVideoMuted();
    await call.setLocalVideoMuted(next);
    setVideoMuted(next);
  };

  return (
    <Overlay open backdrop={<OverlayBackdrop />}>
      <OverlayCenter>
        <Box
          direction="Column"
          gap="300"
          style={{
            width: 'min(960px, 92vw)',
            height: 'min(560px, 82vh)',
            padding: 16,
            background: 'var(--bg-surface)',
            borderRadius: 16,
            border: '1px solid var(--bg-surface-border)',
          }}
        >
          <Box alignItems="Center" justifyContent="SpaceBetween" gap="200">
            <Box direction="Column" gap="100">
              <Text size="H4" truncate>
                {title}
              </Text>
              <Text size="T300" priority="300">
                {statusText}
              </Text>
            </Box>
            {!incoming && (
              <Button variant="Critical" fill="Solid" onClick={onHangup} before={<Icon src={Icons.PhoneDown} />}>
                <Text size="B400">End</Text>
              </Button>
            )}
          </Box>

          <Box
            grow="Yes"
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'var(--bg-surface-variant)',
            }}
          >
            {remoteHasVideo ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box grow="Yes" alignItems="Center" justifyContent="Center">
                <Text size="T300" priority="300">
                  Audio call
                </Text>
              </Box>
            )}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={localVideoRef}
              muted
              autoPlay
              playsInline
              style={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                width: 160,
                height: 96,
                borderRadius: 10,
                objectFit: 'cover',
                background: 'var(--bg-surface)',
                display: videoMuted ? 'none' : 'block',
              }}
            />
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio ref={remoteAudioRef} autoPlay />
          </Box>

          {incoming ? (
            <Box alignItems="Center" justifyContent="Center" gap="300">
              <Button variant="Success" fill="Solid" onClick={onAccept} before={<Icon src={Icons.Phone} />}>
                <Text size="B400">Accept</Text>
              </Button>
              <Button variant="Critical" fill="Soft" onClick={onReject} before={<Icon src={Icons.PhoneDown} />}>
                <Text size="B400">Reject</Text>
              </Button>
            </Box>
          ) : (
            <Box alignItems="Center" justifyContent="Center" gap="200">
              <IconButton
                variant={micMuted ? 'Warning' : 'Surface'}
                fill="Soft"
                radii="300"
                size="300"
                onClick={handleToggleMic}
              >
                <Icon size="100" src={micMuted ? Icons.MicMute : Icons.Mic} filled={!micMuted} />
              </IconButton>
              <IconButton
                variant={videoMuted ? 'Surface' : 'Success'}
                fill="Soft"
                radii="300"
                size="300"
                onClick={handleToggleVideo}
              >
                <Icon
                  size="100"
                  src={videoMuted ? Icons.VideoCameraMute : Icons.VideoCamera}
                  filled={!videoMuted}
                />
              </IconButton>
            </Box>
          )}
        </Box>
      </OverlayCenter>
    </Overlay>
  );
}

export function LegacyCallProvider() {
  const mx = useMatrixClient();
  const [legacyCall, setLegacyCall] = useAtom(legacyCallAtom);
  const legacyCallRef = useRef(legacyCall);

  useEffect(() => {
    legacyCallRef.current = legacyCall;
  }, [legacyCall]);

  useEffect(() => {
    const handleIncoming = (call: MatrixCall) => {
      if (!mx.supportsVoip()) {
        call.reject();
        return;
      }
      if (legacyCallRef.current?.call) {
        call.reject();
        return;
      }
      setLegacyCall({ call, incoming: true });
    };

    mx.on(CallEventHandlerEvent.Incoming, handleIncoming);
    return () => {
      mx.off(CallEventHandlerEvent.Incoming, handleIncoming);
    };
  }, [mx, setLegacyCall]);

  useEffect(() => {
    if (!legacyCall?.call) return undefined;

    const handleHangup = () => {
      setLegacyCall((current) => (current?.call === legacyCall.call ? null : current));
    };
    const handleState = (state: CallState) => {
      if (state === CallState.Ended) {
        setLegacyCall((current) => (current?.call === legacyCall.call ? null : current));
      }
    };

    legacyCall.call.on(CallEvent.Hangup, handleHangup);
    legacyCall.call.on(CallEvent.State, handleState);

    return () => {
      legacyCall.call.off(CallEvent.Hangup, handleHangup);
      legacyCall.call.off(CallEvent.State, handleState);
    };
  }, [legacyCall, setLegacyCall]);

  if (!legacyCall) return null;

  const handleAccept = async () => {
    await legacyCall.call.answer(true, legacyCall.call.type === CallType.Video);
    setLegacyCall({ call: legacyCall.call, incoming: false });
  };

  const handleReject = () => {
    legacyCall.call.reject();
    setLegacyCall(null);
  };

  const handleHangup = () => {
    legacyCall.call.hangup(CallErrorCode.UserHangup, false);
    setLegacyCall(null);
  };

  return (
    <LegacyCallOverlay
      call={legacyCall.call}
      incoming={legacyCall.incoming}
      onAccept={handleAccept}
      onReject={handleReject}
      onHangup={handleHangup}
    />
  );
}
