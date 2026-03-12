import { useAtomValue, useSetAtom } from 'jotai';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixEvent, RoomEvent, RoomEventHandlerMap } from 'matrix-js-sdk';
import { roomToUnreadAtom, unreadEqual, unreadInfoToUnread } from '../../state/room/roomToUnread';
import LogoSVG from '../../../../public/res/svg/cinny.svg';
import LogoUnreadSVG from '../../../../public/res/svg/cinny-unread.svg';
import LogoHighlightSVG from '../../../../public/res/svg/cinny-highlight.svg';
import NotificationSound from '../../../../public/sound/notification.ogg';
import InviteSound from '../../../../public/sound/invite.ogg';
import { notificationPermission, setFavicon } from '../../utils/dom';
import { useSetting } from '../../state/hooks/settings';
import { settingsAtom } from '../../state/settings';
import { allInvitesAtom } from '../../state/room-list/inviteList';
import { usePreviousValue } from '../../hooks/usePreviousValue';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useClientConfig } from '../../hooks/useClientConfig';
import { getInboxInvitesPath, getInboxNotificationsPath } from '../pathUtils';
import {
  getMemberDisplayName,
  getNotificationType,
  getUnreadInfo,
  isNotificationEvent,
} from '../../utils/room';
import { NotificationType, UnreadInfo } from '../../../types/matrix/room';
import { getMxIdLocalPart, mxcUrlToHttp } from '../../utils/matrix';
import { useSelectedRoom } from '../../hooks/router/useSelectedRoom';
import { useInboxNotificationsSelected } from '../../hooks/router/useInbox';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { useStateEventCallback } from '../../hooks/useStateEventCallback';
import { userIdentityOverridesAtom } from '../../state/userIdentities';
import {
  premiumRequestInboxAtom,
  premiumRequestStatusAtom,
  premiumSettingsAtom,
} from '../../state/premium';
import {
  extractUserIdentityListFromContent,
  loadUserIdentityOverrides,
  saveUserIdentityOverrides,
  USER_IDENTITIES_EVENT_TYPE,
} from '../../utils/verifiedUser';
import {
  loadPremiumSettings,
  normalizePremiumRequest,
  normalizePremiumRequestStatus,
  normalizePremiumSettings,
  PREMIUM_REQUEST_EVENT_TYPE,
  PREMIUM_REQUEST_STATUS_EVENT_TYPE,
  PREMIUM_SETTINGS_EVENT_TYPE,
  savePremiumSettings,
} from '../../utils/premium';

function SystemEmojiFeature() {
  const [twitterEmoji] = useSetting(settingsAtom, 'twitterEmoji');

  if (twitterEmoji) {
    document.documentElement.style.setProperty('--font-emoji', 'Twemoji');
  } else {
    document.documentElement.style.setProperty('--font-emoji', 'Twemoji_DISABLED');
  }

  return null;
}

function PageZoomFeature() {
  const [pageZoom] = useSetting(settingsAtom, 'pageZoom');

  if (pageZoom === 100) {
    document.documentElement.style.removeProperty('font-size');
  } else {
    document.documentElement.style.setProperty('font-size', `calc(1em * ${pageZoom / 100})`);
  }

  return null;
}

function FaviconUpdater() {
  const roomToUnread = useAtomValue(roomToUnreadAtom);

  useEffect(() => {
    let notification = false;
    let highlight = false;
    roomToUnread.forEach((unread) => {
      if (unread.total > 0) {
        notification = true;
      }
      if (unread.highlight > 0) {
        highlight = true;
      }
    });

    if (notification) {
      setFavicon(highlight ? LogoHighlightSVG : LogoUnreadSVG);
    } else {
      setFavicon(LogoSVG);
    }
  }, [roomToUnread]);

  return null;
}

function InviteNotifications() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const invites = useAtomValue(allInvitesAtom);
  const perviousInviteLen = usePreviousValue(invites.length, 0);
  const mx = useMatrixClient();

  const navigate = useNavigate();
  const [showNotifications] = useSetting(settingsAtom, 'showNotifications');
  const [notificationSound] = useSetting(settingsAtom, 'isNotificationSounds');

  const notify = useCallback(
    (count: number) => {
      const noti = new window.Notification('Invitation', {
        icon: LogoSVG,
        badge: LogoSVG,
        body: `You have ${count} new invitation request.`,
        silent: true,
      });

      noti.onclick = () => {
        if (!window.closed) navigate(getInboxInvitesPath());
        noti.close();
      };
    },
    [navigate]
  );

  const playSound = useCallback(() => {
    const audioElement = audioRef.current;
    audioElement?.play();
  }, []);

  useEffect(() => {
    if (invites.length > perviousInviteLen && mx.getSyncState() === 'SYNCING') {
      if (showNotifications && notificationPermission('granted')) {
        notify(invites.length - perviousInviteLen);
      }

      if (notificationSound) {
        playSound();
      }
    }
  }, [mx, invites, perviousInviteLen, showNotifications, notificationSound, notify, playSound]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio ref={audioRef} style={{ display: 'none' }}>
      <source src={InviteSound} type="audio/ogg" />
    </audio>
  );
}

function MessageNotifications() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const notifRef = useRef<Notification>();
  const unreadCacheRef = useRef<Map<string, UnreadInfo>>(new Map());
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();
  const [showNotifications] = useSetting(settingsAtom, 'showNotifications');
  const [notificationSound] = useSetting(settingsAtom, 'isNotificationSounds');

  const navigate = useNavigate();
  const notificationSelected = useInboxNotificationsSelected();
  const selectedRoomId = useSelectedRoom();

  const notify = useCallback(
    ({
      roomName,
      roomAvatar,
      username,
    }: {
      roomName: string;
      roomAvatar?: string;
      username: string;
      roomId: string;
      eventId: string;
    }) => {
      const noti = new window.Notification(roomName, {
        icon: roomAvatar,
        badge: roomAvatar,
        body: `New inbox notification from ${username}`,
        silent: true,
      });

      noti.onclick = () => {
        if (!window.closed) navigate(getInboxNotificationsPath());
        noti.close();
        notifRef.current = undefined;
      };

      notifRef.current?.close();
      notifRef.current = noti;
    },
    [navigate]
  );

  const playSound = useCallback(() => {
    const audioElement = audioRef.current;
    audioElement?.play();
  }, []);

  useEffect(() => {
    const handleTimelineEvent: RoomEventHandlerMap[RoomEvent.Timeline] = (
      mEvent,
      room,
      toStartOfTimeline,
      removed,
      data
    ) => {
      if (mx.getSyncState() !== 'SYNCING') return;
      if (document.hasFocus() && (selectedRoomId === room?.roomId || notificationSelected)) return;
      if (
        !room ||
        !data.liveEvent ||
        room.isSpaceRoom() ||
        !isNotificationEvent(mEvent) ||
        getNotificationType(mx, room.roomId) === NotificationType.Mute
      ) {
        return;
      }

      const sender = mEvent.getSender();
      const eventId = mEvent.getId();
      if (!sender || !eventId || mEvent.getSender() === mx.getUserId()) return;
      const unreadInfo = getUnreadInfo(room);
      const cachedUnreadInfo = unreadCacheRef.current.get(room.roomId);
      unreadCacheRef.current.set(room.roomId, unreadInfo);

      if (unreadInfo.total === 0) return;
      if (
        cachedUnreadInfo &&
        unreadEqual(unreadInfoToUnread(cachedUnreadInfo), unreadInfoToUnread(unreadInfo))
      ) {
        return;
      }

      if (showNotifications && notificationPermission('granted')) {
        const avatarMxc =
          room.getAvatarFallbackMember()?.getMxcAvatarUrl() ?? room.getMxcAvatarUrl();
        notify({
          roomName: room.name ?? 'Unknown',
          roomAvatar: avatarMxc
            ? mxcUrlToHttp(mx, avatarMxc, useAuthentication, 96, 96, 'crop') ?? undefined
            : undefined,
          username: getMemberDisplayName(room, sender) ?? getMxIdLocalPart(sender) ?? sender,
          roomId: room.roomId,
          eventId,
        });
      }

      if (notificationSound) {
        playSound();
      }
    };
    mx.on(RoomEvent.Timeline, handleTimelineEvent);
    return () => {
      mx.removeListener(RoomEvent.Timeline, handleTimelineEvent);
    };
  }, [
    mx,
    notificationSound,
    notificationSelected,
    showNotifications,
    playSound,
    notify,
    selectedRoomId,
    useAuthentication,
  ]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio ref={audioRef} style={{ display: 'none' }}>
      <source src={NotificationSound} type="audio/ogg" />
    </audio>
  );
}

function UserIdentitySync() {
  const mx = useMatrixClient();
  const { adminPanel } = useClientConfig();
  const setOverrides = useSetAtom(userIdentityOverridesAtom);
  const identityRoomRef = adminPanel?.identityRoom?.trim() ?? '#vchat:vgram.m2hio.in';
  const [identityRoomId, setIdentityRoomId] = useState<string | null>(null);
  const identityRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    setOverrides(loadUserIdentityOverrides());
  }, [setOverrides]);

  useEffect(() => {
    identityRoomIdRef.current = identityRoomId;
  }, [identityRoomId]);

  useEffect(() => {
    let active = true;
    const resolveRoomId = async () => {
      if (!identityRoomRef) {
        if (active) setIdentityRoomId(null);
        return;
      }
      if (identityRoomRef.startsWith('!')) {
        if (active) setIdentityRoomId(identityRoomRef);
        return;
      }
      if (!identityRoomRef.startsWith('#')) {
        if (active) setIdentityRoomId(null);
        return;
      }
      try {
        const result = await mx.getRoomIdForAlias(identityRoomRef);
        if (active) setIdentityRoomId(result.room_id);
      } catch {
        if (active) setIdentityRoomId(null);
      }
    };
    resolveRoomId();
    return () => {
      active = false;
    };
  }, [identityRoomRef, mx]);

  const applyOverrides = useCallback(
    (event: MatrixEvent) => {
      const identities = extractUserIdentityListFromContent(event.getContent());
      if (identities === null) return;
      setOverrides(identities);
      saveUserIdentityOverrides(identities);
    },
    [setOverrides]
  );

  useEffect(() => {
    if (!identityRoomId) return;
    const room = mx.getRoom(identityRoomId);
    const stateEvent = room?.currentState.getStateEvents(USER_IDENTITIES_EVENT_TYPE, '');
    if (stateEvent) applyOverrides(stateEvent);
  }, [applyOverrides, identityRoomId, mx]);

  const handleStateEvent = useCallback(
    (event: MatrixEvent) => {
      if (event.getType() !== USER_IDENTITIES_EVENT_TYPE) return;
      if (!identityRoomIdRef.current) return;
      if (event.getRoomId() !== identityRoomIdRef.current) return;
      applyOverrides(event);
    },
    [applyOverrides]
  );

  useStateEventCallback(mx, handleStateEvent);

  return null;
}

function PremiumSettingsSync() {
  const mx = useMatrixClient();
  const { adminPanel, premium } = useClientConfig();
  const setPremiumSettings = useSetAtom(premiumSettingsAtom);
  const identityRoomRef =
    premium?.identityRoom?.trim() ??
    adminPanel?.identityRoom?.trim() ??
    '#vchat:vgram.m2hio.in';
  const [identityRoomId, setIdentityRoomId] = useState<string | null>(null);
  const identityRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    setPremiumSettings(loadPremiumSettings());
  }, [setPremiumSettings]);

  useEffect(() => {
    identityRoomIdRef.current = identityRoomId;
  }, [identityRoomId]);

  useEffect(() => {
    let active = true;
    const resolveRoomId = async () => {
      if (!identityRoomRef) {
        if (active) setIdentityRoomId(null);
        return;
      }
      if (identityRoomRef.startsWith('!')) {
        if (active) setIdentityRoomId(identityRoomRef);
        return;
      }
      if (!identityRoomRef.startsWith('#')) {
        if (active) setIdentityRoomId(null);
        return;
      }
      try {
        const result = await mx.getRoomIdForAlias(identityRoomRef);
        if (active) setIdentityRoomId(result.room_id);
      } catch {
        if (active) setIdentityRoomId(null);
      }
    };
    resolveRoomId();
    return () => {
      active = false;
    };
  }, [identityRoomRef, mx]);

  const applySettings = useCallback(
    (event: MatrixEvent) => {
      const normalized = normalizePremiumSettings(event.getContent());
      if (!normalized) return;
      setPremiumSettings(normalized);
      savePremiumSettings(normalized);
    },
    [setPremiumSettings]
  );

  useEffect(() => {
    if (!identityRoomId) return;
    const room = mx.getRoom(identityRoomId);
    const stateEvent = room?.currentState.getStateEvents(PREMIUM_SETTINGS_EVENT_TYPE, '');
    if (stateEvent) applySettings(stateEvent);
  }, [applySettings, identityRoomId, mx]);

  const handleStateEvent = useCallback(
    (event: MatrixEvent) => {
      if (event.getType() !== PREMIUM_SETTINGS_EVENT_TYPE) return;
      if (!identityRoomIdRef.current) return;
      if (event.getRoomId() !== identityRoomIdRef.current) return;
      applySettings(event);
    },
    [applySettings]
  );

  useStateEventCallback(mx, handleStateEvent);

  return null;
}

function PremiumRequestSync() {
  const mx = useMatrixClient();
  const { adminPanel, premium } = useClientConfig();
  const setStatusMap = useSetAtom(premiumRequestStatusAtom);
  const setInbox = useSetAtom(premiumRequestInboxAtom);
  const identityRoomRef =
    premium?.identityRoom?.trim() ??
    adminPanel?.identityRoom?.trim() ??
    '#vchat:vgram.m2hio.in';
  const [identityRoomId, setIdentityRoomId] = useState<string | null>(null);
  const identityRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    identityRoomIdRef.current = identityRoomId;
  }, [identityRoomId]);

  useEffect(() => {
    let active = true;
    const resolveRoomId = async () => {
      if (!identityRoomRef) {
        if (active) setIdentityRoomId(null);
        return;
      }
      if (identityRoomRef.startsWith('!')) {
        if (active) setIdentityRoomId(identityRoomRef);
        return;
      }
      if (!identityRoomRef.startsWith('#')) {
        if (active) setIdentityRoomId(null);
        return;
      }
      try {
        const result = await mx.getRoomIdForAlias(identityRoomRef);
        if (active) setIdentityRoomId(result.room_id);
      } catch {
        if (active) setIdentityRoomId(null);
      }
    };
    resolveRoomId();
    return () => {
      active = false;
    };
  }, [identityRoomRef, mx]);

  useEffect(() => {
    if (!identityRoomId) return;
    const room = mx.getRoom(identityRoomId);
    const stateEvents = room?.currentState.getStateEvents(PREMIUM_REQUEST_STATUS_EVENT_TYPE);
    if (!stateEvents) return;
    const events = Array.isArray(stateEvents) ? stateEvents : [stateEvents];
    const nextMap: Record<string, NonNullable<ReturnType<typeof normalizePremiumRequestStatus>>> =
      {};
    events.forEach((event) => {
      const status = normalizePremiumRequestStatus(event.getContent(), event.getStateKey());
      if (status) nextMap[status.userId] = status;
    });
    setStatusMap(nextMap);

    const timelineEvents = room.getLiveTimeline().getEvents();
    if (timelineEvents.length > 0) {
      setInbox((current) => {
        const known = new Set(current.map((item) => item.eventId));
        const next = [...current];
        timelineEvents.forEach((event) => {
          if (event.getType() !== PREMIUM_REQUEST_EVENT_TYPE) return;
          const request = normalizePremiumRequest(
            event.getContent(),
            event.getSender() ?? undefined,
            event.getId() ?? undefined
          );
          if (!request || (request.eventId && known.has(request.eventId))) return;
          next.unshift(request);
        });
        return next.slice(0, 100);
      });
    }
  }, [identityRoomId, mx, setInbox, setStatusMap]);

  const handleStatusEvent = useCallback(
    (event: MatrixEvent) => {
      if (event.getType() !== PREMIUM_REQUEST_STATUS_EVENT_TYPE) return;
      if (!identityRoomIdRef.current) return;
      if (event.getRoomId() !== identityRoomIdRef.current) return;
      const status = normalizePremiumRequestStatus(event.getContent(), event.getStateKey());
      if (!status) return;
      setStatusMap((current) => ({ ...current, [status.userId]: status }));
    },
    [setStatusMap]
  );

  useStateEventCallback(mx, handleStatusEvent);

  useEffect(() => {
    const handleTimelineEvent: RoomEventHandlerMap[RoomEvent.Timeline] = (
      event,
      room,
      toStartOfTimeline,
      removed,
      data
    ) => {
      if (!data.liveEvent) return;
      if (event.getType() !== PREMIUM_REQUEST_EVENT_TYPE) return;
      if (!identityRoomIdRef.current || event.getRoomId() !== identityRoomIdRef.current) return;
      const request = normalizePremiumRequest(
        event.getContent(),
        event.getSender() ?? undefined,
        event.getId() ?? undefined
      );
      if (!request) return;
      setInbox((current) => {
        if (request.eventId && current.some((item) => item.eventId === request.eventId)) {
          return current;
        }
        return [request, ...current].slice(0, 100);
      });
    };
    mx.on(RoomEvent.Timeline, handleTimelineEvent);
    return () => {
      mx.removeListener(RoomEvent.Timeline, handleTimelineEvent);
    };
  }, [mx, setInbox]);

  return null;
}

type ClientNonUIFeaturesProps = {
  children: ReactNode;
};

export function ClientNonUIFeatures({ children }: ClientNonUIFeaturesProps) {
  return (
    <>
      <SystemEmojiFeature />
      <PageZoomFeature />
      <FaviconUpdater />
      <InviteNotifications />
      <MessageNotifications />
      <UserIdentitySync />
      <PremiumSettingsSync />
      <PremiumRequestSync />
      {children}
    </>
  );
}
