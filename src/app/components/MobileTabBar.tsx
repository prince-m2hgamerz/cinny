import React, { MouseEventHandler, useMemo, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Icon,
  Icons,
  Menu,
  PopOut,
  RectCords,
  Text,
  config,
} from 'folds';
import FocusTrap from 'focus-trap-react';
import {
  ADMIN_PATH,
  CREATE_PATH,
  DIRECT_PATH,
  EXPLORE_PATH,
  HOME_PATH,
  INBOX_PATH,
  ROOM_SETTINGS_PATH,
  SPACE_SETTINGS_PATH,
} from '../pages/paths';
import {
  encodeSearchParamValueArray,
  getAdminPath,
  getCreatePath,
  getDirectPath,
  getExploreFeaturedPath,
  getExplorePath,
  getExploreServerPath,
  getHomePath,
  getInboxInvitesPath,
  getInboxNotificationsPath,
  getSpaceLobbyPath,
  getSpacePath,
  joinPathComponent,
  withSearchParam,
} from '../pages/pathUtils';
import { Modal500 } from './Modal500';
import { Settings, SettingsPages } from '../features/settings/Settings';
import { searchModalAtom } from '../state/searchModal';
import { useClientConfig } from '../hooks/useClientConfig';
import { useMatrixClient } from '../hooks/useMatrixClient';
import { getCanonicalAliasOrRoomId, getMxIdServer } from '../utils/matrix';
import { useNavToActivePathAtom } from '../state/hooks/navToActivePath';
import { allInvitesAtom } from '../state/room-list/inviteList';
import { JoinAddressPrompt } from './join-address-prompt';
import { SequenceCard } from './sequence-card';
import { SettingTile } from './setting-tile';
import { stopPropagation } from '../utils/keyboard';
import type { _RoomSearchParams } from '../pages/paths';
import { NavButton, NavItem, NavItemContent } from './nav';
import { useOrphanSpaces } from '../state/hooks/roomList';
import { roomToParentsAtom } from '../state/room/roomToParents';
import { allRoomsAtom } from '../state/room-list/roomList';
import {
  useCrossSigningActive,
} from '../hooks/useCrossSigning';
import {
  useDeviceIds,
  useDeviceList,
  useSplitCurrentDevice,
} from '../hooks/useDeviceList';
import {
  useDeviceVerificationStatus,
  useUnverifiedDeviceCount,
  VerificationStatus,
} from '../hooks/useDeviceVerificationStatus';
import * as css from './MobileTabBar.css';

export function MobileTabBar() {
  const navigate = useNavigate();
  const mx = useMatrixClient();
  const clientConfig = useClientConfig();
  const navToActivePath = useAtomValue(useNavToActivePathAtom());
  const invites = useAtomValue(allInvitesAtom);
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useAtom(searchModalAtom);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [spacesOpen, setSpacesOpen] = useState(false);
  const [joinAddress, setJoinAddress] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<RectCords>();

  const homeActive = !!useMatch({ path: HOME_PATH, end: false });
  const directActive = !!useMatch({ path: DIRECT_PATH, end: false });
  const exploreActive = !!useMatch({ path: EXPLORE_PATH, end: false });
  const createActive = !!useMatch({ path: CREATE_PATH, end: false });
  const inboxActive = !!useMatch({ path: INBOX_PATH, end: false });
  const adminActive = !!useMatch({ path: ADMIN_PATH, end: false });
  const isSpaceRoute =
    !homeActive &&
    !directActive &&
    !exploreActive &&
    !inboxActive &&
    !adminActive &&
    !createActive &&
    !location.pathname.startsWith('/login') &&
    !location.pathname.startsWith('/register') &&
    !location.pathname.startsWith('/reset-password') &&
    !location.pathname.startsWith(ROOM_SETTINGS_PATH) &&
    !location.pathname.startsWith(SPACE_SETTINGS_PATH);

  const userId = mx.getUserId();
  const allowedUserIds =
    clientConfig.adminPanel?.allowedUserIds && clientConfig.adminPanel.allowedUserIds.length > 0
      ? clientConfig.adminPanel.allowedUserIds
      : ['@m2h:vgram.m2hio.in'];
  const adminEnabled = clientConfig.adminPanel?.enabled !== false;
  const adminAllowed = !!userId && allowedUserIds.includes(userId);

  const roomToParents = useAtomValue(roomToParentsAtom);
  const spaceRooms = useOrphanSpaces(mx, allRoomsAtom, roomToParents);

  const crossSigningActive = useCrossSigningActive();
  const crypto = mx.getCrypto();
  const [devices] = useDeviceList();
  const [currentDevice, otherDevices] = useSplitCurrentDevice(devices);
  const verificationStatus = useDeviceVerificationStatus(
    crypto,
    mx.getSafeUserId(),
    currentDevice?.device_id
  );
  const unverified = verificationStatus === VerificationStatus.Unverified;
  const otherDevicesId = useDeviceIds(otherDevices);
  const unverifiedDeviceCount = useUnverifiedDeviceCount(
    crypto,
    mx.getSafeUserId(),
    otherDevicesId
  );
  const hasUnverified =
    crossSigningActive &&
    (unverified || (unverifiedDeviceCount !== undefined && unverifiedDeviceCount > 0));

  const handleHomeClick = () => {
    const activePath = navToActivePath.get('home');
    if (activePath) {
      navigate(joinPathComponent(activePath));
      return;
    }
    navigate(getHomePath());
  };

  const handleDirectClick = () => {
    const activePath = navToActivePath.get('direct');
    if (activePath) {
      navigate(joinPathComponent(activePath));
      return;
    }
    navigate(getDirectPath());
  };

  const handleExploreClick = () => {
    const activePath = navToActivePath.get('explore');
    if (activePath) {
      navigate(joinPathComponent(activePath));
      return;
    }
    if (clientConfig.featuredCommunities?.openAsDefault) {
      navigate(getExploreFeaturedPath());
      return;
    }
    const userServer = userId ? getMxIdServer(userId) : undefined;
    if (userServer) {
      navigate(getExploreServerPath(userServer));
      return;
    }
    navigate(getExplorePath());
  };

  const handleInboxClick = () => {
    const activePath = navToActivePath.get('inbox');
    if (activePath) {
      navigate(joinPathComponent(activePath));
      return;
    }
    navigate(invites.length > 0 ? getInboxInvitesPath() : getInboxNotificationsPath());
  };

  const handleCreateClick: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuAnchor(menuAnchor ? undefined : evt.currentTarget.getBoundingClientRect());
  };

  const handleCreateSpace = () => {
    setMenuAnchor(undefined);
    navigate(getCreatePath());
  };

  const handleJoinWithAddress = () => {
    setMenuAnchor(undefined);
    setJoinAddress(true);
  };

  const handleAdminClick = () => {
    const activePath = navToActivePath.get('admin');
    if (activePath) {
      navigate(joinPathComponent(activePath));
      return;
    }
    navigate(getAdminPath());
  };

  const handleSpacesClick = () => {
    setSpacesOpen(true);
  };

  const handleSpaceNavigate = (spaceId: string) => {
    const spaceAlias = getCanonicalAliasOrRoomId(mx, spaceId);
    const spacePath = getSpacePath(spaceAlias);
    const activePath = navToActivePath.get(spaceId);
    if (activePath && activePath.pathname.startsWith(spacePath)) {
      navigate(joinPathComponent(activePath));
    } else {
      navigate(getSpaceLobbyPath(spaceAlias));
    }
    setSpacesOpen(false);
  };

  const menuItems = useMemo(
    () => [
      {
        key: 'home',
        label: 'Home',
        icon: Icons.Home,
        active: homeActive,
        onClick: handleHomeClick,
      },
      {
        key: 'direct',
        label: 'Direct',
        icon: Icons.User,
        active: directActive,
        onClick: handleDirectClick,
      },
      {
        key: 'spaces',
        label: 'Spaces',
        icon: Icons.Space,
        active: spacesOpen || isSpaceRoute,
        onClick: handleSpacesClick,
      },
      {
        key: 'explore',
        label: 'Explore',
        icon: Icons.Explore,
        active: exploreActive,
        onClick: handleExploreClick,
      },
      {
        key: 'create',
        label: 'Create',
        icon: Icons.Plus,
        active: createActive || !!menuAnchor,
        onClick: handleCreateClick,
      },
      {
        key: 'search',
        label: 'Search',
        icon: Icons.Search,
        active: searchOpen,
        onClick: () => setSearchOpen(true),
      },
      {
        key: 'inbox',
        label: 'Inbox',
        icon: Icons.Inbox,
        active: inboxActive,
        onClick: handleInboxClick,
      },
      ...(hasUnverified
        ? [
            {
              key: 'verify',
              label: 'Verify',
              icon: Icons.ShieldUser,
              active: devicesOpen,
              onClick: () => setDevicesOpen(true),
            },
          ]
        : []),
      ...(adminEnabled && adminAllowed
        ? [
            {
              key: 'admin',
              label: 'Admin',
              icon: Icons.ShieldLock,
              active: adminActive,
              onClick: handleAdminClick,
            },
          ]
        : []),
      {
        key: 'settings',
        label: 'Settings',
        icon: Icons.Setting,
        active: settingsOpen,
        onClick: () => setSettingsOpen(true),
      },
    ],
    [
      adminActive,
      adminAllowed,
      adminEnabled,
      createActive,
      devicesOpen,
      directActive,
      exploreActive,
      handleDirectClick,
      handleExploreClick,
      handleHomeClick,
      handleInboxClick,
      handleCreateClick,
      handleAdminClick,
      handleSpacesClick,
      hasUnverified,
      homeActive,
      inboxActive,
      isSpaceRoute,
      menuAnchor,
      searchOpen,
      spacesOpen,
      settingsOpen,
      setSearchOpen,
    ]
  );

  return (
    <>
      <Box as="nav" className={css.MobileTabBar}>
        {menuItems.map((item) => (
          <Box
            key={item.key}
            as="button"
            type="button"
            className={item.active ? `${css.MobileTabItem} ${css.MobileTabItemActive}` : css.MobileTabItem}
            onClick={item.onClick}
          >
            <Icon src={item.icon} size="200" />
            <Text as="span" size="T200">
              {item.label}
            </Text>
          </Box>
        ))}
      </Box>
      {menuAnchor && (
        <PopOut
          anchor={menuAnchor}
          position="Top"
          align="Center"
          content={
            <FocusTrap
              focusTrapOptions={{
                returnFocusOnDeactivate: false,
                initialFocus: false,
                onDeactivate: () => setMenuAnchor(undefined),
                clickOutsideDeactivates: true,
                isKeyForward: (evt: KeyboardEvent) =>
                  evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
                isKeyBackward: (evt: KeyboardEvent) =>
                  evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
                escapeDeactivates: stopPropagation,
              }}
            >
              <Menu>
                <Box direction="Column">
                  <SequenceCard
                    style={{ padding: config.space.S300 }}
                    variant="Surface"
                    direction="Column"
                    gap="100"
                    radii="0"
                    as="button"
                    type="button"
                    onClick={handleCreateSpace}
                  >
                    <SettingTile before={<Icon size="400" src={Icons.Space} />}>
                      <Text size="H6">Create Space</Text>
                      <Text size="T300" priority="300">
                        Build a space for your community.
                      </Text>
                    </SettingTile>
                  </SequenceCard>
                  <SequenceCard
                    style={{ padding: config.space.S300 }}
                    variant="Surface"
                    direction="Column"
                    gap="100"
                    radii="0"
                    as="button"
                    type="button"
                    onClick={handleJoinWithAddress}
                  >
                    <SettingTile before={<Icon size="400" src={Icons.Link} />}>
                      <Text size="H6">Join with Address</Text>
                      <Text size="T300" priority="300">
                        Become a part of existing community.
                      </Text>
                    </SettingTile>
                  </SequenceCard>
                </Box>
              </Menu>
            </FocusTrap>
          }
        />
      )}
      {spacesOpen && (
        <Modal500 requestClose={() => setSpacesOpen(false)}>
          <Box direction="Column" gap="200" style={{ padding: config.space.S300 }}>
            <Text size="H4">Spaces</Text>
            <Box direction="Column" gap="100">
              {spaceRooms.length === 0 ? (
                <Text size="T300" priority="300">
                  No spaces yet.
                </Text>
              ) : (
                spaceRooms.map((spaceId) => {
                  const room = mx.getRoom(spaceId);
                  const name = room?.name ?? spaceId;
                  return (
                    <NavItem key={spaceId} variant="Background" radii="400">
                      <NavButton onClick={() => handleSpaceNavigate(spaceId)}>
                        <NavItemContent>
                          <Box as="span" grow="Yes" alignItems="Center" gap="200">
                            <Avatar size="200" radii="400">
                              <Icon src={Icons.Space} size="100" />
                            </Avatar>
                            <Box as="span" grow="Yes">
                              <Text as="span" size="T300" truncate>
                                {name}
                              </Text>
                            </Box>
                          </Box>
                        </NavItemContent>
                      </NavButton>
                    </NavItem>
                  );
                })
              )}
            </Box>
          </Box>
        </Modal500>
      )}
      {joinAddress && (
        <JoinAddressPrompt
          onCancel={() => setJoinAddress(false)}
          onOpen={(roomIdOrAlias, viaServers) => {
            setJoinAddress(false);
            const path = getSpacePath(roomIdOrAlias);
            navigate(
              viaServers
                ? withSearchParam<_RoomSearchParams>(path, {
                    viaServers: encodeSearchParamValueArray(viaServers),
                  })
                : path
            );
          }}
        />
      )}
      {settingsOpen && (
        <Modal500 requestClose={() => setSettingsOpen(false)}>
          <Settings requestClose={() => setSettingsOpen(false)} initialPage={SettingsPages.GeneralPage} />
        </Modal500>
      )}
      {devicesOpen && (
        <Modal500 requestClose={() => setDevicesOpen(false)}>
          <Settings requestClose={() => setDevicesOpen(false)} initialPage={SettingsPages.DevicesPage} />
        </Modal500>
      )}
    </>
  );
}
