import React, { MouseEventHandler, forwardRef, useMemo, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Icon,
  IconButton,
  Icons,
  Input,
  Menu,
  MenuItem,
  PopOut,
  RectCords,
  Text,
  config,
  toRem,
} from 'folds';
import { useVirtualizer } from '@tanstack/react-virtual';
import FocusTrap from 'focus-trap-react';
import { useNavigate } from 'react-router-dom';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { factoryRoomIdByActivity } from '../../../utils/sort';
import {
  NavButton,
  NavCategory,
  NavCategoryHeader,
  NavEmptyCenter,
  NavEmptyLayout,
  NavItem,
  NavItemContent,
} from '../../../components/nav';
import { getDirectCreatePath, getDirectRoomPath } from '../../pathUtils';
import { getCanonicalAliasOrRoomId } from '../../../utils/matrix';
import { useSelectedRoom } from '../../../hooks/router/useSelectedRoom';
import { VirtualTile } from '../../../components/virtualizer';
import { RoomNavCategoryButton, RoomNavItem } from '../../../features/room-nav';
import { makeNavCategoryId } from '../../../state/closedNavCategories';
import { roomToUnreadAtom } from '../../../state/room/roomToUnread';
import { useCategoryHandler } from '../../../hooks/useCategoryHandler';
import { useNavToActivePathMapper } from '../../../hooks/useNavToActivePathMapper';
import { useDirectRooms } from './useDirectRooms';
import { PageNav, PageNavContent, PageNavHeader } from '../../../components/page';
import { useClosedNavCategoriesAtom } from '../../../state/hooks/closedNavCategories';
import { useRoomsUnread } from '../../../state/hooks/unread';
import { markAsRead } from '../../../utils/notifications';
import { stopPropagation } from '../../../utils/keyboard';
import { useSetting } from '../../../state/hooks/settings';
import { settingsAtom } from '../../../state/settings';
import {
  getRoomNotificationMode,
  useRoomsNotificationPreferencesContext,
} from '../../../hooks/useRoomsNotificationPreferences';
import { useDirectCreateSelected } from '../../../hooks/router/useDirectSelected';
import { ScreenSize, useScreenSizeContext } from '../../../hooks/useScreenSize';
import classNames from 'classnames';
import * as css from './Direct.css';

type DirectMenuProps = {
  requestClose: () => void;
};
const DirectMenu = forwardRef<HTMLDivElement, DirectMenuProps>(({ requestClose }, ref) => {
  const mx = useMatrixClient();
  const [hideActivity] = useSetting(settingsAtom, 'hideActivity');
  const orphanRooms = useDirectRooms();
  const unread = useRoomsUnread(orphanRooms, roomToUnreadAtom);

  const handleMarkAsRead = () => {
    if (!unread) return;
    orphanRooms.forEach((rId) => markAsRead(mx, rId, hideActivity));
    requestClose();
  };

  return (
    <Menu ref={ref} style={{ maxWidth: toRem(160), width: '100vw' }}>
      <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
        <MenuItem
          onClick={handleMarkAsRead}
          size="300"
          after={<Icon size="100" src={Icons.CheckTwice} />}
          radii="300"
          aria-disabled={!unread}
        >
          <Text style={{ flexGrow: 1 }} as="span" size="T300" truncate>
            Mark as Read
          </Text>
        </MenuItem>
      </Box>
    </Menu>
  );
});

function DirectHeader() {
  const [menuAnchor, setMenuAnchor] = useState<RectCords>();

  const handleOpenMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    const cords = evt.currentTarget.getBoundingClientRect();
    setMenuAnchor((currentState) => {
      if (currentState) return undefined;
      return cords;
    });
  };

  return (
    <>
      <PageNavHeader className={css.DirectPageHeader}>
        <Box alignItems="Center" grow="Yes" gap="300">
          <Box grow="Yes">
            <Text size="H4" truncate>
              Direct Messages
            </Text>
          </Box>
          <Box>
            <IconButton aria-pressed={!!menuAnchor} variant="Background" onClick={handleOpenMenu}>
              <Icon src={Icons.VerticalDots} size="200" />
            </IconButton>
          </Box>
        </Box>
      </PageNavHeader>
      <PopOut
        anchor={menuAnchor}
        position="Bottom"
        align="End"
        offset={6}
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
            <DirectMenu requestClose={() => setMenuAnchor(undefined)} />
          </FocusTrap>
        }
      />
    </>
  );
}

function DirectEmpty() {
  const navigate = useNavigate();

  return (
    <NavEmptyCenter>
      <NavEmptyLayout
        icon={<Icon size="600" src={Icons.Mention} />}
        title={
          <Text size="H5" align="Center">
            No Direct Messages
          </Text>
        }
        content={
          <Text size="T300" align="Center">
            You do not have any direct messages yet.
          </Text>
        }
        options={
          <Button variant="Secondary" size="300" onClick={() => navigate(getDirectCreatePath())}>
            <Text size="B300" truncate>
              Direct Message
            </Text>
          </Button>
        }
      />
    </NavEmptyCenter>
  );
}

const DEFAULT_CATEGORY_ID = makeNavCategoryId('direct', 'direct');
export function Direct() {
  const mx = useMatrixClient();
  useNavToActivePathMapper('direct');
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const directs = useDirectRooms();
  const notificationPreferences = useRoomsNotificationPreferencesContext();
  const roomToUnread = useAtomValue(roomToUnreadAtom);
  const navigate = useNavigate();
  const screenSize = useScreenSizeContext();
  const isMobile = screenSize === ScreenSize.Mobile;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Personal' | 'Groups' | 'Channels'>('All');

  const createDirectSelected = useDirectCreateSelected();

  const selectedRoomId = useSelectedRoom();
  const noRoomToDisplay = directs.length === 0;
  const [closedCategories, setClosedCategories] = useAtom(useClosedNavCategoriesAtom());

  const filteredDirects = useMemo(() => {
    const items = Array.from(directs).sort(factoryRoomIdByActivity(mx));
    if (closedCategories.has(DEFAULT_CATEGORY_ID)) {
      const filtered = items.filter((rId) => roomToUnread.has(rId) || rId === selectedRoomId);
      return filtered;
    }
    return items;
  }, [mx, directs, closedCategories, roomToUnread, selectedRoomId]);

  const unreadRooms = useMemo(
    () => filteredDirects.filter((roomId) => (roomToUnread.get(roomId)?.total ?? 0) > 0),
    [filteredDirects, roomToUnread]
  );

  const groupRooms = useMemo(
    () =>
      filteredDirects.filter((roomId) => {
        const room = mx.getRoom(roomId);
        const count = room?.getJoinedMemberCount?.() ?? 0;
        return count > 2;
      }),
    [filteredDirects, mx]
  );

  const channelRooms = useMemo(
    () =>
      filteredDirects.filter((roomId) => {
        const room = mx.getRoom(roomId);
        return room?.getJoinRule?.() === 'public';
      }),
    [filteredDirects, mx]
  );

  const filterCounts = {
    All: filteredDirects.length,
    Unread: unreadRooms.length,
    Personal: filteredDirects.length,
    Groups: groupRooms.length,
    Channels: channelRooms.length,
  };

  const tabFilteredDirects = useMemo(() => {
    if (activeFilter === 'Unread') {
      return unreadRooms;
    }
    if (activeFilter === 'Groups') {
      return groupRooms;
    }
    if (activeFilter === 'Channels') {
      return channelRooms;
    }
    return filteredDirects;
  }, [activeFilter, filteredDirects, mx, unreadRooms]);

  const searchTerm = searchQuery.trim().toLowerCase();
  const searchedDirects = useMemo(() => {
    if (!searchTerm) return tabFilteredDirects;
    return tabFilteredDirects.filter((roomId) => {
      const room = mx.getRoom(roomId);
      const name = room?.name ?? '';
      const alias = room?.getCanonicalAlias?.() ?? '';
      return (
        name.toLowerCase().includes(searchTerm) ||
        alias.toLowerCase().includes(searchTerm) ||
        roomId.toLowerCase().includes(searchTerm)
      );
    });
  }, [mx, searchTerm, tabFilteredDirects]);

  const noSearchResults = searchTerm.length > 0 && searchedDirects.length === 0;
  const noFilterResults = searchTerm.length === 0 && tabFilteredDirects.length === 0;

  const virtualizer = useVirtualizer({
    count: searchedDirects.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 84,
    overscan: 10,
  });

  const handleCategoryClick = useCategoryHandler(setClosedCategories, (categoryId) =>
    closedCategories.has(categoryId)
  );

  return (
    <PageNav className={css.DirectPageNav}>
      {isMobile ? (
        <Box className={css.DirectMobileHeader}>
          <Text className={css.DirectTitle}>VChat</Text>
          <IconButton variant="Background" fill="None" aria-label="Options">
            <Icon src={Icons.VerticalDots} size="200" />
          </IconButton>
        </Box>
      ) : (
        <DirectHeader />
      )}
      <Box className={css.DirectSearchWrap}>
        <Input
          ref={searchInputRef}
          className={css.DirectSearchInput}
          value={searchQuery}
          onChange={(evt) => setSearchQuery(evt.target.value)}
          placeholder="Search Chats"
          size="400"
          variant="Background"
          outlined={false}
          radii="Pill"
          before={<Icon src={Icons.Search} size="100" className={css.DirectSearchIcon} />}
          after={
            searchQuery.trim().length > 0 ? (
              <IconButton
                size="300"
                radii="Pill"
                variant="Background"
                fill="None"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
              >
                <Icon src={Icons.Cross} size="100" className={css.DirectSearchIcon} />
              </IconButton>
            ) : undefined
          }
        />
      </Box>
      {isMobile && (
        <Box className={css.DirectFilters}>
          {(['All', 'Unread', 'Personal', 'Groups', 'Channels'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            const count = filterCounts[filter];
            return (
              <Box
                as="button"
                type="button"
                key={filter}
                className={classNames(
                  css.DirectFilterButton,
                  isActive && css.DirectFilterButtonActive
                )}
                onClick={() => setActiveFilter(filter)}
              >
                <Text as="span" size="B300">
                  {filter}
                </Text>
                {count > 0 && (
                  <Badge size="200" variant="Secondary" fill="Solid" radii="Pill">
                    <Text as="span" size="L400">
                      {count}
                    </Text>
                  </Badge>
                )}
              </Box>
            );
          })}
        </Box>
      )}
      {noRoomToDisplay ? (
        <DirectEmpty />
      ) : (
        <PageNavContent scrollRef={scrollRef}>
          {isMobile && (
            <Box className={css.DirectArchivedCard}>
              <Box className={css.DirectArchivedRow}>
                <Avatar size="300" radii="Pill">
                  <Icon src={Icons.Inbox} size="200" />
                </Avatar>
                <Box direction="Column" gap="50">
                  <Text className={css.DirectArchivedTitle}>Archived Chats</Text>
                  <Text className={css.DirectArchivedSubtitle} truncate>
                    Chats you've archived will appear here.
                  </Text>
                </Box>
                <Badge size="200" variant="Secondary" fill="Soft" radii="Pill">
                  <Text as="span" size="L400">
                    {Math.min(filterCounts.All, 9)}
                  </Text>
                </Badge>
              </Box>
            </Box>
          )}
          {noSearchResults || noFilterResults ? (
            <NavEmptyCenter>
              <NavEmptyLayout
                icon={<Icon size="600" src={Icons.Search} />}
                title={
                  <Text size="H5" align="Center">
                    {noFilterResults ? 'No chats here' : 'No matches'}
                  </Text>
                }
                content={
                  <Text size="T300" align="Center">
                    {noFilterResults
                      ? 'Try a different filter to see chats.'
                      : 'Try a different name or Matrix ID.'}
                  </Text>
                }
              />
            </NavEmptyCenter>
          ) : (
            <Box direction="Column" gap="300">
              {!isMobile && (
                <NavCategory>
                  <NavItem variant="Background" radii="400" aria-selected={createDirectSelected}>
                    <NavButton onClick={() => navigate(getDirectCreatePath())}>
                      <NavItemContent>
                        <Box as="span" grow="Yes" alignItems="Center" gap="200">
                          <Avatar size="200" radii="400">
                            <Icon src={Icons.Plus} size="100" />
                          </Avatar>
                          <Box as="span" grow="Yes">
                            <Text as="span" size="Inherit" truncate>
                              Create Chat
                            </Text>
                          </Box>
                        </Box>
                      </NavItemContent>
                    </NavButton>
                  </NavItem>
                </NavCategory>
              )}
              <NavCategory>
                <NavCategoryHeader>
                  <RoomNavCategoryButton
                    closed={closedCategories.has(DEFAULT_CATEGORY_ID)}
                    data-category-id={DEFAULT_CATEGORY_ID}
                    onClick={handleCategoryClick}
                  >
                    Chats
                  </RoomNavCategoryButton>
                </NavCategoryHeader>
                <div
                  style={{
                    position: 'relative',
                    height: virtualizer.getTotalSize(),
                  }}
                >
                  {virtualizer.getVirtualItems().map((vItem) => {
                    const roomId = searchedDirects[vItem.index];
                    const room = mx.getRoom(roomId);
                    if (!room) return null;
                    const selected = selectedRoomId === roomId;

                    return (
                      <VirtualTile
                        virtualItem={vItem}
                        key={vItem.index}
                        ref={virtualizer.measureElement}
                      >
                        <RoomNavItem
                          room={room}
                          selected={selected}
                          showAvatar
                          direct
                          linkPath={getDirectRoomPath(getCanonicalAliasOrRoomId(mx, roomId))}
                          notificationMode={getRoomNotificationMode(
                            notificationPreferences,
                            room.roomId
                          )}
                        />
                      </VirtualTile>
                    );
                  })}
                </div>
              </NavCategory>
            </Box>
          )}
        </PageNavContent>
      )}
      {isMobile && (
        <>
          <IconButton
            className={css.DirectFab}
            variant="Primary"
            radii="Pill"
            onClick={() => navigate(getDirectCreatePath())}
            aria-label="New chat"
          >
            <Icon src={Icons.Plus} />
          </IconButton>
        </>
      )}
    </PageNav>
  );
}
