import { Room } from 'matrix-js-sdk';
import React from 'react';
import { Box, Icon, Icons, Text } from 'folds';
import { getMemberDisplayName } from '../../utils/room';
import { getMxIdLocalPart } from '../../utils/matrix';
import { UserBadges } from '../../components/UserBadges';

type MemberSpeakingProps = {
  room: Room;
  speakers: Set<string>;
};
export function MemberSpeaking({ room, speakers }: MemberSpeakingProps) {
  const speakingMembers = Array.from(speakers).map((userId) => ({
    userId,
    name: getMemberDisplayName(room, userId) ?? getMxIdLocalPart(userId) ?? userId,
  }));
  const renderName = (index: number) => {
    const member = speakingMembers[index];
    if (!member) return null;

    return (
      <>
        <b>{member.name}</b>
        <UserBadges userId={member.userId} size="100" withGap />
      </>
    );
  };

  return (
    <Box alignItems="Center" gap="100">
      <Icon size="100" src={Icons.Mic} filled />
      <Text size="T200" truncate>
        {speakingMembers.length === 1 && (
          <>
            {renderName(0)}
            <Text as="span" size="Inherit" priority="300">
              {' is speaking...'}
            </Text>
          </>
        )}
        {speakingMembers.length === 2 && (
          <>
            {renderName(0)}
            <Text as="span" size="Inherit" priority="300">
              {' and '}
            </Text>
            {renderName(1)}
            <Text as="span" size="Inherit" priority="300">
              {' are speaking...'}
            </Text>
          </>
        )}
        {speakingMembers.length === 3 && (
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
              {' are speaking...'}
            </Text>
          </>
        )}
        {speakingMembers.length > 3 && (
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
            <b>{speakingMembers.length - 3} others</b>
            <Text as="span" size="Inherit" priority="300">
              {' are speaking...'}
            </Text>
          </>
        )}
      </Text>
    </Box>
  );
}
