import React from 'react';
import { Box, Icon, Icons, Scroll, Text } from 'folds';
import { Page, PageContent, PageHeader } from '../../../components/page';
import { PremiumUpgradeContent } from '../../../components/PremiumUpgradeContent';
import { useNavToActivePathMapper } from '../../../hooks/useNavToActivePathMapper';

export function Premium() {
  useNavToActivePathMapper('premium');

  return (
    <Page>
      <PageHeader outlined={false}>
        <Box grow="Yes" alignItems="Center" gap="200">
          <Icon src={Icons.Star} size="100" />
          <Text size="H3" truncate>
            VChat Premium
          </Text>
        </Box>
      </PageHeader>
      <Box grow="Yes">
        <Scroll hideTrack visibility="Hover">
          <PageContent>
            <PremiumUpgradeContent variant="page" />
          </PageContent>
        </Scroll>
      </Box>
    </Page>
  );
}
