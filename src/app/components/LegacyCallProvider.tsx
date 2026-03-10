import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import {
  CallDirection,
  CallErrorCode,
  CallEvent,
  CallState,
  CallType,
  MatrixCall,
} from 'matrix-js-sdk/lib/webrtc/call';
import { CallFeedEvent } from 'matrix-js-sdk/lib/webrtc/callFeed';
import type { CallFeed } from 'matrix-js-sdk/lib/webrtc/callFeed';
import { CallEventHandlerEvent } from 'matrix-js-sdk/lib/webrtc/callEventHandler';
import { Box, Button, Icon, IconButton, Icons, Overlay, OverlayBackdrop, OverlayCenter, Text } from 'folds';
import { useMatrixClient } from '../hooks/useMatrixClient';
import { useSetting } from '../state/hooks/settings';
import { settingsAtom } from '../state/settings';
import { legacyCallAtom } from '../state/legacyCall';
import { getMemberDisplayName } from '../utils/room';
import { getMxIdLocalPart } from '../utils/matrix';
import InviteSound from '../../../public/sound/invite.ogg';
import NotificationSound from '../../../public/sound/notification.ogg';
import * as css from './LegacyCallProvider.css';

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
  const [notificationSound] = useSetting(settingsAtom, 'isNotificationSounds');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const incomingSoundRef = useRef<HTMLAudioElement>(null);
  const outgoingSoundRef = useRef<HTMLAudioElement>(null);
  const feedListenersRef = useRef<CallFeed[]>([]);

  const updateStreams = useCallback(() => {
    const localFeed = call.localUsermediaFeed ?? call.localScreensharingFeed;
    const remoteFeed = call.remoteUsermediaFeed ?? call.remoteScreensharingFeed;
    const localStream = localFeed?.stream ?? call.localUsermediaStream ?? call.localScreensharingStream;
    const remoteStream = remoteFeed?.stream ?? call.remoteUsermediaStream ?? call.remoteScreensharingStream;

    if (localVideoRef.current) {
      localVideoRef.current.muted = true;
      localVideoRef.current.srcObject = localStream ?? null;
      localVideoRef.current.autoplay = true;
      localVideoRef.current.playsInline = true;
      if (localStream) {
        localVideoRef.current.play().catch(() => undefined);
      }
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = true;
      remoteVideoRef.current.srcObject = remoteStream ?? null;
      remoteVideoRef.current.autoplay = true;
      remoteVideoRef.current.playsInline = true;
      if (remoteStream) {
        remoteVideoRef.current.play().catch(() => undefined);
      }
    }
    if (remoteAudioRef.current) {
      const hasAudioTrack = (remoteStream?.getAudioTracks() ?? []).length > 0;
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.srcObject = hasAudioTrack ? remoteStream ?? null : null;
      remoteAudioRef.current.autoplay = true;
      if (hasAudioTrack) {
        remoteAudioRef.current.play().catch(() => undefined);
      }
    }

    const remoteHasVideoTrack = (remoteStream?.getVideoTracks() ?? []).length > 0;
    const remoteFeedHasVideo = remoteFeed ? !remoteFeed.isVideoMuted() : false;
    const remoteHasVideoFlag = call.hasRemoteUserMediaVideoTrack;
    setRemoteHasVideo(remoteHasVideoTrack || remoteFeedHasVideo || remoteHasVideoFlag);
  }, [call]);

  useEffect(() => {
    const handleState = (state: CallState) => setCallState(state);
    const handleFeeds = () => {
      updateStreams();
      attachFeedListeners();
    };

    const attachFeedListeners = () => {
      feedListenersRef.current.forEach((feed) => {
        feed.off(CallFeedEvent.NewStream, updateStreams);
        feed.off(CallFeedEvent.MuteStateChanged, updateStreams);
        feed.off(CallFeedEvent.ConnectedChanged, updateStreams);
      });
      const feeds = call.getFeeds();
      feeds.forEach((feed) => {
        feed.on(CallFeedEvent.NewStream, updateStreams);
        feed.on(CallFeedEvent.MuteStateChanged, updateStreams);
        feed.on(CallFeedEvent.ConnectedChanged, updateStreams);
      });
      feedListenersRef.current = feeds;
    };

    updateStreams();
    attachFeedListeners();

    call.on(CallEvent.State, handleState);
    call.on(CallEvent.FeedsChanged, handleFeeds);

    return () => {
      call.off(CallEvent.State, handleState);
      call.off(CallEvent.FeedsChanged, handleFeeds);
      feedListenersRef.current.forEach((feed) => {
        feed.off(CallFeedEvent.NewStream, updateStreams);
        feed.off(CallFeedEvent.MuteStateChanged, updateStreams);
        feed.off(CallFeedEvent.ConnectedChanged, updateStreams);
      });
      feedListenersRef.current = [];
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

  const playSound = useCallback((audio: HTMLAudioElement | null, loop: boolean) => {
    if (!audio) return;
    audio.loop = loop;
    if (!audio.paused) return;
    audio.currentTime = 0;
    audio.play().catch(() => undefined);
  }, []);

  const stopSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  useEffect(() => {
    if (!notificationSound) {
      stopSound(incomingSoundRef.current);
      stopSound(outgoingSoundRef.current);
      return;
    }

    const isIncomingRinging =
      incoming &&
      call.direction === CallDirection.Inbound &&
      callState !== CallState.Connected &&
      callState !== CallState.Ended;
    const isOutgoingRinging =
      call.direction === CallDirection.Outbound &&
      callState !== CallState.Connected &&
      callState !== CallState.Ended;

    if (isIncomingRinging) {
      playSound(incomingSoundRef.current, true);
    } else {
      stopSound(incomingSoundRef.current);
    }

    if (isOutgoingRinging) {
      playSound(outgoingSoundRef.current, true);
    } else {
      stopSound(outgoingSoundRef.current);
    }
  }, [call.direction, callState, incoming, notificationSound, playSound, stopSound]);

  useEffect(() => {
    return () => {
      stopSound(incomingSoundRef.current);
      stopSound(outgoingSoundRef.current);
    };
  }, [stopSound]);

  return (
    <Overlay open backdrop={<OverlayBackdrop />}>
      <OverlayCenter>
        <Box className={css.CallOverlayCard}>
          <Box className={css.HeaderRow}>
            <Box className={css.HeaderMeta}>
              <Text size="H4" truncate className={css.HeaderTitle}>
                {title}
              </Text>
              <Text size="T300" priority="300" className={css.HeaderSubtitle}>
                {statusText}
              </Text>
            </Box>
            {!incoming && (
              <Button
                variant="Critical"
                fill="Solid"
                radii="Pill"
                onClick={onHangup}
                before={<Icon src={Icons.PhoneDown} />}
              >
                <Text size="B400">End</Text>
              </Button>
            )}
          </Box>

          <Box className={css.VideoStage}>
            {remoteHasVideo ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video ref={remoteVideoRef} autoPlay playsInline className={css.RemoteVideo} />
            ) : (
              <Box className={css.NoVideo}>
                <Icon size="500" src={Icons.Mic} />
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
              className={css.LocalPreview}
              style={{ display: videoMuted ? 'none' : 'block' }}
            />
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio ref={remoteAudioRef} autoPlay />
          </Box>

          {incoming ? (
            <Box className={css.FooterRow}>
              <Button
                variant="Success"
                fill="Solid"
                radii="Pill"
                onClick={onAccept}
                before={<Icon src={Icons.Phone} />}
              >
                <Text size="B400">Accept</Text>
              </Button>
              <Button
                variant="Critical"
                fill="Soft"
                radii="Pill"
                onClick={onReject}
                before={<Icon src={Icons.PhoneDown} />}
              >
                <Text size="B400">Reject</Text>
              </Button>
            </Box>
          ) : (
            <Box className={css.FooterRow}>
              <Box className={css.ControlCluster}>
                <IconButton
                  variant={micMuted ? 'Warning' : 'Surface'}
                  fill="Soft"
                  radii="Pill"
                  size="400"
                  onClick={handleToggleMic}
                >
                  <Icon size="100" src={micMuted ? Icons.MicMute : Icons.Mic} filled={!micMuted} />
                </IconButton>
                <IconButton
                  variant={videoMuted ? 'Surface' : 'Success'}
                  fill="Soft"
                  radii="Pill"
                  size="400"
                  onClick={handleToggleVideo}
                >
                  <Icon
                    size="100"
                    src={videoMuted ? Icons.VideoCameraMute : Icons.VideoCamera}
                    filled={!videoMuted}
                  />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </OverlayCenter>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={incomingSoundRef} style={{ display: 'none' }}>
        <source src={InviteSound} type="audio/ogg" />
      </audio>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={outgoingSoundRef} style={{ display: 'none' }}>
        <source src={NotificationSound} type="audio/ogg" />
      </audio>
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
