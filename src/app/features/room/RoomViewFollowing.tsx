import React, { useState } from 'react';
import {
  Box,
  Icon,
  Icons,
  Modal,
  Overlay,
  OverlayBackdrop,
  OverlayCenter,
  Text,
  as,
  config,
} from 'folds';
import { Room } from 'matrix-js-sdk';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';

import { getMemberDisplayName } from '../../utils/room';
import { getMxIdLocalPart } from '../../utils/matrix';
import * as css from './RoomViewFollowing.css';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useRoomLatestRenderedEvent } from '../../hooks/useRoomLatestRenderedEvent';
import { useRoomEventReaders } from '../../hooks/useRoomEventReaders';
import { EventReaders } from '../../components/event-readers';
import { stopPropagation } from '../../utils/keyboard';
import { UserBadges } from '../../components/UserBadges';

export function RoomViewFollowingPlaceholder() {
  return <div className={css.RoomViewFollowingPlaceholder} />;
}

export type RoomViewFollowingProps = {
  room: Room;
};
export const RoomViewFollowing = as<'div', RoomViewFollowingProps>(
  ({ className, room, ...props }, ref) => {
    const mx = useMatrixClient();
    const [open, setOpen] = useState(false);
    const latestEvent = useRoomLatestRenderedEvent(room);
    const latestEventReaders = useRoomEventReaders(room, latestEvent?.getId());
    const readerEntries = latestEventReaders
      .filter((readerId) => readerId !== mx.getUserId())
      .map((readerId) => ({
        userId: readerId,
        name: getMemberDisplayName(room, readerId) ?? getMxIdLocalPart(readerId) ?? readerId,
      }));

    const eventId = latestEvent?.getId();
    const renderName = (index: number) => {
      const entry = readerEntries[index];
      if (!entry) return null;

      return (
        <>
          <b>{entry.name}</b>
          <UserBadges userId={entry.userId} size="100" withGap />
        </>
      );
    };

    return (
      <>
        {eventId && (
          <Overlay open={open} backdrop={<OverlayBackdrop />}>
            <OverlayCenter>
              <FocusTrap
                focusTrapOptions={{
                  initialFocus: false,
                  onDeactivate: () => setOpen(false),
                  clickOutsideDeactivates: true,
                  escapeDeactivates: stopPropagation,
                }}
              >
                <Modal variant="Surface" size="300">
                  <EventReaders room={room} eventId={eventId} requestClose={() => setOpen(false)} />
                </Modal>
              </FocusTrap>
            </OverlayCenter>
          </Overlay>
        )}
        <Box
          as={readerEntries.length > 0 ? 'button' : 'div'}
          onClick={readerEntries.length > 0 ? () => setOpen(true) : undefined}
          className={classNames(
            css.RoomViewFollowing({ clickable: readerEntries.length > 0 }),
            className
          )}
          alignItems="Center"
          justifyContent="End"
          gap="200"
          {...props}
          ref={ref}
        >
          {readerEntries.length > 0 && (
            <>
              <Icon style={{ opacity: config.opacity.P300 }} size="100" src={Icons.CheckTwice} />
              <Text size="T300" truncate>
                {readerEntries.length === 1 && (
                  <>
                    {renderName(0)}
                    <Text as="span" size="Inherit" priority="300">
                      {' is following the conversation.'}
                    </Text>
                  </>
                )}
                {readerEntries.length === 2 && (
                  <>
                    {renderName(0)}
                    <Text as="span" size="Inherit" priority="300">
                      {' and '}
                    </Text>
                    {renderName(1)}
                    <Text as="span" size="Inherit" priority="300">
                      {' are following the conversation.'}
                    </Text>
                  </>
                )}
                {readerEntries.length === 3 && (
                  <>
                    {renderName(0)}
                    <Text as="span" size="Inherit" priority="300">
                      {', '}
                    </Text>
                    {renderName(1)}
                    <Text as="span" size="Inherit" priority="300">
                      {' and '}
                    </Text>
                    {renderName(2)}
                    <Text as="span" size="Inherit" priority="300">
                      {' are following the conversation.'}
                    </Text>
                  </>
                )}
                {readerEntries.length > 3 && (
                  <>
                    {renderName(0)}
                    <Text as="span" size="Inherit" priority="300">
                      {', '}
                    </Text>
                    {renderName(1)}
                    <Text as="span" size="Inherit" priority="300">
                      {', '}
                    </Text>
                    {renderName(2)}
                    <Text as="span" size="Inherit" priority="300">
                      {' and '}
                    </Text>
                    <b>{readerEntries.length - 3} others</b>
                    <Text as="span" size="Inherit" priority="300">
                      {' are following the conversation.'}
                    </Text>
                  </>
                )}
              </Text>
            </>
          )}
        </Box>
      </>
    );
  }
);
