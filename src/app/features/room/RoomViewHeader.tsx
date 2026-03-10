import React, { MouseEventHandler, forwardRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import FocusTrap from 'focus-trap-react';
import {
  Box,
  Avatar,
  Text,
  Overlay,
  OverlayCenter,
  OverlayBackdrop,
  IconButton,
  Icon,
  Icons,
  Tooltip,
  TooltipProvider,
  Menu,
  MenuItem,
  toRem,
  config,
  Line,
  PopOut,
  RectCords,
  Badge,
  Spinner,
} from 'folds';
import { useNavigate } from 'react-router-dom';
import { Room } from 'matrix-js-sdk';
import { CallType } from 'matrix-js-sdk/lib/webrtc/call';
import { useStateEvent } from '../../hooks/useStateEvent';
import { PageHeader } from '../../components/page';
import { RoomAvatar, RoomIcon } from '../../components/room-avatar';
import { UseStateProvider } from '../../components/UseStateProvider';
import { RoomTopicViewer } from '../../components/room-topic-viewer';
import { StateEvent } from '../../../types/matrix/room';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useIsDirectRoom, useRoom } from '../../hooks/useRoom';
import { useSetting } from '../../state/hooks/settings';
import { settingsAtom } from '../../state/settings';
import { useSpaceOptionally } from '../../hooks/useSpace';
import { getHomeSearchPath, getSpaceSearchPath, withSearchParam } from '../../pages/pathUtils';
import { getCanonicalAliasOrRoomId, isRoomAlias, mxcUrlToHttp } from '../../utils/matrix';
import { _SearchPathSearchParams } from '../../pages/paths';
import * as css from './RoomViewHeader.css';
import { useRoomUnread } from '../../state/hooks/unread';
import { usePowerLevelsContext } from '../../hooks/usePowerLevels';
import { markAsRead } from '../../utils/notifications';
import { roomToUnreadAtom } from '../../state/room/roomToUnread';
import { copyToClipboard } from '../../utils/dom';
import { LeaveRoomPrompt } from '../../components/leave-room-prompt';
import { useRoomAvatar, useRoomName, useRoomTopic } from '../../hooks/useRoomMeta';
import { ScreenSize, useScreenSizeContext } from '../../hooks/useScreenSize';
import { stopPropagation } from '../../utils/keyboard';
import { getMatrixToRoom } from '../../plugins/matrix-to';
import { getViaServers } from '../../plugins/via-servers';
import { BackRouteHandler } from '../../components/BackRouteHandler';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { useRoomPinnedEvents } from '../../hooks/useRoomPinnedEvents';
import { RoomPinMenu } from './room-pin-menu';
import { useOpenRoomSettings } from '../../state/hooks/roomSettings';
import { RoomNotificationModeSwitcher } from '../../components/RoomNotificationSwitcher';
import {
  getRoomNotificationMode,
  getRoomNotificationModeIcon,
  useRoomsNotificationPreferencesContext,
} from '../../hooks/useRoomsNotificationPreferences';
import { JumpToTime } from './jump-to-time';
import { useRoomNavigate } from '../../hooks/useRoomNavigate';
import { useRoomCreators } from '../../hooks/useRoomCreators';
import { useRoomPermissions } from '../../hooks/useRoomPermissions';
import { InviteUserPrompt } from '../../components/invite-user-prompt';
import { ContainerColor } from '../../styles/ContainerColor.css';
import { RoomSettingsPage } from '../../state/roomSettings';
import { UserBadges } from '../../components/UserBadges';
import { getDirectRoomTargetUserId } from '../../utils/verifiedUser';
import { ReportDialog } from '../../components/ReportDialog';
import { sendReport } from '../../utils/report';
import { getMemberDisplayName } from '../../utils/room';
import { useCallEmbed, useCallStart } from '../../hooks/useCallEmbed';
import { useCallMembers, useCallSession } from '../../hooks/useCall';
import { useLivekitSupport } from '../../hooks/useLivekitSupport';
import { useCallPreferencesAtom } from '../../state/hooks/callPreferences';
import type { CallPreferences } from '../../state/callPreferences';
import { useLegacyCall } from '../../hooks/useLegacyCall';

type RoomMenuProps = {
  room: Room;
  requestClose: () => void;
  showCallActions?: boolean;
  callDisabledReason?: string;
  onStartVoiceCall?: () => void;
  onStartVideoCall?: () => void;
};
const RoomMenu = forwardRef<HTMLDivElement, RoomMenuProps>(
  (
    {
      room,
      requestClose,
      showCallActions,
      callDisabledReason,
      onStartVoiceCall,
      onStartVideoCall,
    },
    ref
  ) => {
    const mx = useMatrixClient();
    const [hideActivity] = useSetting(settingsAtom, 'hideActivity');
    const unread = useRoomUnread(room.roomId, roomToUnreadAtom);
    const powerLevels = usePowerLevelsContext();
    const creators = useRoomCreators(room);

    const permissions = useRoomPermissions(creators, powerLevels);
    const canInvite = permissions.action('invite', mx.getSafeUserId());
    const notificationPreferences = useRoomsNotificationPreferencesContext();
    const notificationMode = getRoomNotificationMode(notificationPreferences, room.roomId);
    const { navigateRoom } = useRoomNavigate();

    const [invitePrompt, setInvitePrompt] = useState(false);
    const [reportPrompt, setReportPrompt] = useState(false);

    const reporterUserId = mx.getSafeUserId() ?? undefined;
    const reporterDisplayName = reporterUserId
      ? getMemberDisplayName(room, reporterUserId) ?? reporterUserId
      : undefined;

    const handleMarkAsRead = () => {
      markAsRead(mx, room.roomId, hideActivity);
      requestClose();
    };

    const handleInvite = () => {
      setInvitePrompt(true);
    };

    const handleCopyLink = () => {
      const roomIdOrAlias = getCanonicalAliasOrRoomId(mx, room.roomId);
      const viaServers = isRoomAlias(roomIdOrAlias) ? undefined : getViaServers(room);
      copyToClipboard(getMatrixToRoom(roomIdOrAlias, viaServers));
      requestClose();
    };

    const openSettings = useOpenRoomSettings();
    const parentSpace = useSpaceOptionally();
    const handleOpenSettings = () => {
      openSettings(room.roomId, parentSpace?.roomId);
      requestClose();
    };

    const handleStartVoiceCall = () => {
      onStartVoiceCall?.();
      requestClose();
    };

    const handleStartVideoCall = () => {
      onStartVideoCall?.();
      requestClose();
    };

    const handleReportRoom = async ({
      reason,
      details,
    }: {
      reason: string;
      details?: string;
    }) => {
      await sendReport({
        targetType: 'room',
        reason,
        details,
        reporterUserId,
        reporterDisplayName,
        targetId: room.roomId,
        targetName: room.name,
        roomId: room.roomId,
        roomName: room.name,
        spaceId: parentSpace?.roomId,
        spaceName: parentSpace?.name,
      });
    };

    return (
      <Menu ref={ref} style={{ maxWidth: toRem(160), width: '100vw' }}>
        {invitePrompt && (
          <InviteUserPrompt
            room={room}
            requestClose={() => {
              setInvitePrompt(false);
              requestClose();
            }}
          />
        )}
        <Overlay open={reportPrompt} backdrop={<OverlayBackdrop />}>
          <OverlayCenter>
            <ReportDialog
              open={reportPrompt}
              title="Report Room"
              targetLabel="Room"
              helperText="Report this room for review. The report will be forwarded to the moderation channel."
              requestClose={() => setReportPrompt(false)}
              onSubmit={handleReportRoom}
            />
          </OverlayCenter>
        </Overlay>
        <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
          <MenuItem
            onClick={handleMarkAsRead}
            size="300"
            after={<Icon size="100" src={Icons.CheckTwice} />}
            radii="300"
            disabled={!unread}
          >
            <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
              Mark as Read
            </Text>
          </MenuItem>
          <RoomNotificationModeSwitcher roomId={room.roomId} value={notificationMode}>
            {(handleOpen, opened, changing) => (
              <MenuItem
                size="300"
                after={
                  changing ? (
                    <Spinner size="100" variant="Secondary" />
                  ) : (
                    <Icon size="100" src={getRoomNotificationModeIcon(notificationMode)} />
                  )
                }
                radii="300"
                aria-pressed={opened}
                onClick={handleOpen}
              >
                <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
                  Notifications
                </Text>
              </MenuItem>
            )}
          </RoomNotificationModeSwitcher>
        </Box>
        <Line variant="Surface" size="300" />
        <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
          <MenuItem
            onClick={handleInvite}
            variant="Primary"
            fill="None"
            size="300"
            after={<Icon size="100" src={Icons.UserPlus} />}
            radii="300"
            aria-pressed={invitePrompt}
            disabled={!canInvite}
          >
            <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
              Invite
            </Text>
          </MenuItem>
          {showCallActions && (
            <>
              <MenuItem
                onClick={handleStartVoiceCall}
                size="300"
                after={<Icon size="100" src={Icons.Phone} />}
                radii="300"
                disabled={!!callDisabledReason}
              >
                <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
                  Voice Call
                </Text>
              </MenuItem>
              <MenuItem
                onClick={handleStartVideoCall}
                size="300"
                after={<Icon size="100" src={Icons.VideoCamera} />}
                radii="300"
                disabled={!!callDisabledReason}
              >
                <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
                  Video Call
                </Text>
              </MenuItem>
            </>
          )}
          <MenuItem
            onClick={handleCopyLink}
            size="300"
            after={<Icon size="100" src={Icons.Link} />}
            radii="300"
          >
            <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
              Copy Link
            </Text>
          </MenuItem>
          <MenuItem
            onClick={handleOpenSettings}
            size="300"
            after={<Icon size="100" src={Icons.Setting} />}
            radii="300"
          >
            <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
              Room Settings
            </Text>
          </MenuItem>
          <MenuItem
            onClick={() => setReportPrompt(true)}
            variant="Critical"
            fill="None"
            size="300"
            after={<Icon size="100" src={Icons.Warning} />}
            radii="300"
            aria-pressed={reportPrompt}
          >
            <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
              Report Room
            </Text>
          </MenuItem>
          <UseStateProvider initial={false}>
            {(promptJump, setPromptJump) => (
              <>
                <MenuItem
                  onClick={() => setPromptJump(true)}
                  size="300"
                  after={<Icon size="100" src={Icons.RecentClock} />}
                  radii="300"
                  aria-pressed={promptJump}
                >
                  <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
                    Jump to Time
                  </Text>
                </MenuItem>
                {promptJump && (
                  <JumpToTime
                    onSubmit={(eventId) => {
                      setPromptJump(false);
                      navigateRoom(room.roomId, eventId);
                      requestClose();
                    }}
                    onCancel={() => setPromptJump(false)}
                  />
                )}
              </>
            )}
          </UseStateProvider>
        </Box>
        <Line variant="Surface" size="300" />
        <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
          <UseStateProvider initial={false}>
            {(promptLeave, setPromptLeave) => (
              <>
                <MenuItem
                  onClick={() => setPromptLeave(true)}
                  variant="Critical"
                  fill="None"
                  size="300"
                  after={<Icon size="100" src={Icons.ArrowGoLeft} />}
                  radii="300"
                  aria-pressed={promptLeave}
                >
                  <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
                    Leave Room
                  </Text>
                </MenuItem>
                {promptLeave && (
                  <LeaveRoomPrompt
                    roomId={room.roomId}
                    onDone={requestClose}
                    onCancel={() => setPromptLeave(false)}
                  />
                )}
              </>
            )}
          </UseStateProvider>
        </Box>
      </Menu>
    );
  }
);

export function RoomViewHeader({ callView }: { callView?: boolean }) {
  const navigate = useNavigate();
  const mx = useMatrixClient();
  const useAuthentication = useMediaAuthentication();
  const screenSize = useScreenSizeContext();
  const room = useRoom();
  const space = useSpaceOptionally();
  const [menuAnchor, setMenuAnchor] = useState<RectCords>();
  const [pinMenuAnchor, setPinMenuAnchor] = useState<RectCords>();
  const direct = useIsDirectRoom();
  const callEmbed = useCallEmbed();
  const { legacyCall, startLegacyCall } = useLegacyCall();
  const startCall = useCallStart(direct);
  const callPreferences = useAtomValue(useCallPreferencesAtom());
  const livekitSupported = useLivekitSupport();
  const callSession = useCallSession(room);
  const callMembers = useCallMembers(room, callSession);

  const pinnedEvents = useRoomPinnedEvents(room);
  const encryptionEvent = useStateEvent(room, StateEvent.RoomEncryption);
  const encryptedRoom = !!encryptionEvent;
  const avatarMxc = useRoomAvatar(room, direct);
  const name = useRoomName(room);
  const topic = useRoomTopic(room);
  const directUserId = direct ? getDirectRoomTargetUserId(room, mx.getSafeUserId()) : undefined;
  const legacyCallActiveInRoom = legacyCall?.call.roomId === room.roomId;
  const callActiveInRoom = callEmbed?.roomId === room.roomId || legacyCallActiveInRoom;
  const showCallActions = !callView && !room.isCallRoom() && !callActiveInRoom;
  const legacyEligible = direct && (room.getJoinedMemberCount?.() ?? 2) <= 2;
  const canUseLegacy = legacyEligible && mx.supportsVoip();
  const anotherCallActive =
    (!!callEmbed && callEmbed.roomId !== room.roomId) ||
    (!!legacyCall?.call && legacyCall.call.roomId !== room.roomId);
  let callDisabledReason: string | undefined;
  if (anotherCallActive) {
    callDisabledReason = 'Already in another call';
  } else if (canUseLegacy) {
    callDisabledReason = undefined;
  } else if (legacyEligible && !mx.supportsVoip()) {
    callDisabledReason = 'This browser does not support calls';
  } else if (!livekitSupported && callMembers.length === 0) {
    callDisabledReason = 'Your homeserver does not support calling';
  }
  const avatarUrl = avatarMxc
    ? mxcUrlToHttp(mx, avatarMxc, useAuthentication, 96, 96, 'crop') ?? undefined
    : undefined;

  const [peopleDrawer, setPeopleDrawer] = useSetting(settingsAtom, 'isPeopleDrawer');

  const handleSearchClick = () => {
    const searchParams: _SearchPathSearchParams = {
      rooms: room.roomId,
    };
    const path = space
      ? getSpaceSearchPath(getCanonicalAliasOrRoomId(mx, space.roomId))
      : getHomeSearchPath();
    navigate(withSearchParam(path, searchParams));
  };

  const handleOpenMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuAnchor(evt.currentTarget.getBoundingClientRect());
  };

  const handleOpenPinMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setPinMenuAnchor(evt.currentTarget.getBoundingClientRect());
  };

  const openSettings = useOpenRoomSettings();
  const parentSpace = useSpaceOptionally();
  const handleMemberToggle = () => {
    if (callView) {
      openSettings(room.roomId, parentSpace?.roomId, RoomSettingsPage.MembersPage);
      return;
    }
    setPeopleDrawer(!peopleDrawer);
  };

  const handleStartCall = (pref: CallPreferences) => {
    if (callDisabledReason) return;
    startCall(room, pref);
  };

  const handleStartVoiceCall = () => {
    if (canUseLegacy) {
      startLegacyCall(room, CallType.Voice).catch(() => undefined);
      return;
    }
    handleStartCall({ ...callPreferences, video: false });
  };

  const handleStartVideoCall = () => {
    if (canUseLegacy) {
      startLegacyCall(room, CallType.Video).catch(() => undefined);
      return;
    }
    handleStartCall({ ...callPreferences, video: true });
  };

  return (
    <PageHeader
      className={ContainerColor({ variant: 'Surface' })}
      balance={screenSize === ScreenSize.Mobile}
    >
      <Box grow="Yes" gap="300">
        {screenSize === ScreenSize.Mobile && (
          <BackRouteHandler>
            {(onBack) => (
              <Box shrink="No" alignItems="Center">
                <IconButton fill="None" onClick={onBack}>
                  <Icon src={Icons.ArrowLeft} />
                </IconButton>
              </Box>
            )}
          </BackRouteHandler>
        )}
        <Box grow="Yes" alignItems="Center" gap="300">
          {screenSize !== ScreenSize.Mobile && (
            <Avatar size="300">
              <RoomAvatar
                roomId={room.roomId}
                src={avatarUrl}
                alt={name}
                renderFallback={() => (
                  <RoomIcon size="200" joinRule={room.getJoinRule()} roomType={room.getType()} />
                )}
              />
            </Avatar>
          )}
          <Box direction="Column">
            <Box alignItems="Center" gap="100" style={{ minWidth: 0 }}>
              <Text size={topic ? 'H5' : 'H3'} truncate>
                {name}
              </Text>
              <UserBadges userId={directUserId} size="300" />
            </Box>
            {topic && (
              <UseStateProvider initial={false}>
                {(viewTopic, setViewTopic) => (
                  <>
                    <Overlay open={viewTopic} backdrop={<OverlayBackdrop />}>
                      <OverlayCenter>
                        <FocusTrap
                          focusTrapOptions={{
                            initialFocus: false,
                            clickOutsideDeactivates: true,
                            onDeactivate: () => setViewTopic(false),
                            escapeDeactivates: stopPropagation,
                          }}
                        >
                          <RoomTopicViewer
                            name={name}
                            topic={topic}
                            requestClose={() => setViewTopic(false)}
                          />
                        </FocusTrap>
                      </OverlayCenter>
                    </Overlay>
                    <Text
                      as="button"
                      type="button"
                      onClick={() => setViewTopic(true)}
                      className={css.HeaderTopic}
                      size="T200"
                      priority="300"
                      truncate
                    >
                      {topic}
                    </Text>
                  </>
                )}
              </UseStateProvider>
            )}
          </Box>
        </Box>

        <Box shrink="No">
          {!encryptedRoom && (
            <TooltipProvider
              position="Bottom"
              offset={4}
              tooltip={
                <Tooltip>
                  <Text>Search</Text>
                </Tooltip>
              }
            >
              {(triggerRef) => (
                <IconButton fill="None" ref={triggerRef} onClick={handleSearchClick}>
                  <Icon size="400" src={Icons.Search} />
                </IconButton>
              )}
            </TooltipProvider>
          )}
          <TooltipProvider
            position="Bottom"
            offset={4}
            tooltip={
              <Tooltip>
                <Text>Pinned Messages</Text>
              </Tooltip>
            }
          >
            {(triggerRef) => (
              <IconButton
                fill="None"
                style={{ position: 'relative' }}
                onClick={handleOpenPinMenu}
                ref={triggerRef}
                aria-pressed={!!pinMenuAnchor}
              >
                {pinnedEvents.length > 0 && (
                  <Badge
                    style={{
                      position: 'absolute',
                      left: toRem(3),
                      top: toRem(3),
                    }}
                    variant="Secondary"
                    size="400"
                    fill="Solid"
                    radii="Pill"
                  >
                    <Text as="span" size="L400">
                      {pinnedEvents.length}
                    </Text>
                  </Badge>
                )}
                <Icon size="400" src={Icons.Pin} filled={!!pinMenuAnchor} />
              </IconButton>
            )}
          </TooltipProvider>
          <PopOut
            anchor={pinMenuAnchor}
            position="Bottom"
            content={
              <FocusTrap
                focusTrapOptions={{
                  initialFocus: false,
                  returnFocusOnDeactivate: false,
                  onDeactivate: () => setPinMenuAnchor(undefined),
                  clickOutsideDeactivates: true,
                  isKeyForward: (evt: KeyboardEvent) => evt.key === 'ArrowDown',
                  isKeyBackward: (evt: KeyboardEvent) => evt.key === 'ArrowUp',
                  escapeDeactivates: stopPropagation,
                }}
              >
                <RoomPinMenu room={room} requestClose={() => setPinMenuAnchor(undefined)} />
              </FocusTrap>
            }
          />

          {showCallActions && screenSize !== ScreenSize.Mobile && (
            <>
              <TooltipProvider
                position="Bottom"
                offset={4}
                tooltip={
                  <Tooltip>
                    <Text>{callDisabledReason ?? 'Start Voice Call'}</Text>
                  </Tooltip>
                }
              >
                {(triggerRef) => (
                  <IconButton
                    fill="None"
                    ref={triggerRef}
                    onClick={handleStartVoiceCall}
                    disabled={!!callDisabledReason}
                  >
                    <Icon size="400" src={Icons.Phone} />
                  </IconButton>
                )}
              </TooltipProvider>
              <TooltipProvider
                position="Bottom"
                offset={4}
                tooltip={
                  <Tooltip>
                    <Text>{callDisabledReason ?? 'Start Video Call'}</Text>
                  </Tooltip>
                }
              >
                {(triggerRef) => (
                  <IconButton
                    fill="None"
                    ref={triggerRef}
                    onClick={handleStartVideoCall}
                    disabled={!!callDisabledReason}
                  >
                    <Icon size="400" src={Icons.VideoCamera} />
                  </IconButton>
                )}
              </TooltipProvider>
            </>
          )}

          {screenSize === ScreenSize.Desktop && (
            <TooltipProvider
              position="Bottom"
              offset={4}
              tooltip={
                <Tooltip>
                  {callView ? (
                    <Text>Members</Text>
                  ) : (
                    <Text>{peopleDrawer ? 'Hide Members' : 'Show Members'}</Text>
                  )}
                </Tooltip>
              }
            >
              {(triggerRef) => (
                <IconButton fill="None" ref={triggerRef} onClick={handleMemberToggle}>
                  <Icon size="400" src={Icons.User} />
                </IconButton>
              )}
            </TooltipProvider>
          )}

          <TooltipProvider
            position="Bottom"
            align="End"
            offset={4}
            tooltip={
              <Tooltip>
                <Text>More Options</Text>
              </Tooltip>
            }
          >
            {(triggerRef) => (
              <IconButton
                fill="None"
                onClick={handleOpenMenu}
                ref={triggerRef}
                aria-pressed={!!menuAnchor}
              >
                <Icon size="400" src={Icons.VerticalDots} filled={!!menuAnchor} />
              </IconButton>
            )}
          </TooltipProvider>
          <PopOut
            anchor={menuAnchor}
            position="Bottom"
            align="End"
            content={
              <FocusTrap
                focusTrapOptions={{
                  initialFocus: false,
                  returnFocusOnDeactivate: false,
                  onDeactivate: () => setMenuAnchor(undefined),
                  clickOutsideDeactivates: true,
                  isKeyForward: (evt: KeyboardEvent) => evt.key === 'ArrowDown',
                  isKeyBackward: (evt: KeyboardEvent) => evt.key === 'ArrowUp',
                  escapeDeactivates: stopPropagation,
                }}
              >
                <RoomMenu
                  room={room}
                  requestClose={() => setMenuAnchor(undefined)}
                  showCallActions={showCallActions && screenSize === ScreenSize.Mobile}
                  callDisabledReason={callDisabledReason}
                  onStartVoiceCall={handleStartVoiceCall}
                  onStartVideoCall={handleStartVideoCall}
                />
              </FocusTrap>
            }
          />
        </Box>
      </Box>
    </PageHeader>
  );
}
