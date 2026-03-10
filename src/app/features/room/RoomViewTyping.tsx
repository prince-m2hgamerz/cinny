import React from 'react';
import { Box, Icon, IconButton, Icons, Text, as } from 'folds';
import { Room } from 'matrix-js-sdk';
import classNames from 'classnames';
import { useSetAtom } from 'jotai';
import { roomIdToTypingMembersAtom } from '../../state/typingMembers';
import { TypingIndicator } from '../../components/typing-indicator';
import { getMemberDisplayName } from '../../utils/room';
import { getMxIdLocalPart } from '../../utils/matrix';
import * as css from './RoomViewTyping.css';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useRoomTypingMember } from '../../hooks/useRoomTypingMembers';
import { UserBadges } from '../../components/UserBadges';

export type RoomViewTypingProps = {
  room: Room;
};
export const RoomViewTyping = as<'div', RoomViewTypingProps>(
  ({ className, room, ...props }, ref) => {
    const setTypingMembers = useSetAtom(roomIdToTypingMembersAtom);
    const mx = useMatrixClient();
    const typingMembers = useRoomTypingMember(room.roomId);

    const typingEntries = typingMembers
      .filter((receipt) => receipt.userId !== mx.getUserId())
      .map((receipt) => ({
        userId: receipt.userId,
        name: getMemberDisplayName(room, receipt.userId) ?? getMxIdLocalPart(receipt.userId),
      }))
      .reverse();

    if (typingEntries.length === 0) {
      return null;
    }

    const renderName = (index: number) => {
      const entry = typingEntries[index];
      if (!entry?.name) return null;

      return (
        <>
          <b>{entry.name}</b>
          <UserBadges userId={entry.userId} size="100" withGap />
        </>
      );
    };

    const handleDropAll = () => {
      // some homeserver does not timeout typing status
      // we have given option so user can drop their typing status
      typingMembers.forEach((receipt) =>
        setTypingMembers({
          type: 'DELETE',
          roomId: room.roomId,
          userId: receipt.userId,
        })
      );
    };

    return (
      <div style={{ position: 'relative' }}>
        <Box
          className={classNames(css.RoomViewTyping, className)}
          alignItems="Center"
          gap="400"
          {...props}
          ref={ref}
        >
          <TypingIndicator />
          <Text className={css.TypingText} size="T300" truncate>
            {typingEntries.length === 1 && (
              <>
                {renderName(0)}
                <Text as="span" size="Inherit" priority="300">
                  {' is typing...'}
                </Text>
              </>
            )}
            {typingEntries.length === 2 && (
              <>
                {renderName(0)}
                <Text as="span" size="Inherit" priority="300">
                  {' and '}
                </Text>
                {renderName(1)}
                <Text as="span" size="Inherit" priority="300">
                  {' are typing...'}
                </Text>
              </>
            )}
            {typingEntries.length === 3 && (
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
                  {' are typing...'}
                </Text>
              </>
            )}
            {typingEntries.length > 3 && (
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
                <b>{typingEntries.length - 3} others</b>
                <Text as="span" size="Inherit" priority="300">
                  {' are typing...'}
                </Text>
              </>
            )}
          </Text>
          <IconButton title="Drop Typing Status" size="300" radii="Pill" onClick={handleDropAll}>
            <Icon size="50" src={Icons.Cross} />
          </IconButton>
        </Box>
      </div>
    );
  }
);
