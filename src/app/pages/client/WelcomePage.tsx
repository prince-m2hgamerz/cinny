import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Icon, Icons, Text } from 'folds';
import { Page, PageContent, PageContentCenter, PageHero, PageHeroSection } from '../../components/page';
import { SequenceCard } from '../../components/sequence-card';
import { getDirectCreatePath, getExplorePath } from '../pathUtils';
import * as css from './WelcomePage.css';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <Page className={css.WelcomePage}>
      <PageContent>
        <PageContentCenter>
          <Box direction="Column" gap="400">
            <PageHeroSection className={css.WelcomeHero}>
              <PageHero
                icon={<Icon size="600" src={Icons.Message} />}
                title="Welcome to VChat"
                subTitle="A clean, Telegram-inspired Matrix client for fast, familiar messaging."
              />
              <Box className={css.WelcomeActions}>
                <Button size="400" radii="300" variant="Primary" onClick={() => navigate(getDirectCreatePath())}>
                  <Text size="B400">Start a chat</Text>
                </Button>
                <Button size="400" radii="300" variant="Secondary" onClick={() => navigate(getExplorePath())}>
                  <Text size="B400">Explore rooms</Text>
                </Button>
              </Box>
            </PageHeroSection>

            <Box className={css.WelcomeGrid}>
              <SequenceCard className={css.WelcomeCard} variant="SurfaceVariant">
                <Box direction="Column" gap="100">
                  <Text size="L400">Find people fast</Text>
                  <Text size="T200" priority="300">
                    Use the search box in your chat list to jump to people or rooms instantly.
                  </Text>
                </Box>
              </SequenceCard>
              <SequenceCard className={css.WelcomeCard} variant="SurfaceVariant">
                <Box direction="Column" gap="100">
                  <Text size="L400">Start messaging</Text>
                  <Text size="T200" priority="300">
                    Create a new chat with the plus button and begin typing right away.
                  </Text>
                </Box>
              </SequenceCard>
              <SequenceCard className={css.WelcomeCard} variant="SurfaceVariant">
                <Box direction="Column" gap="100">
                  <Text size="L400">Stay in sync</Text>
                  <Text size="T200" priority="300">
                    Your conversations stay synced across devices, just like Telegram.
                  </Text>
                </Box>
              </SequenceCard>
            </Box>
          </Box>
        </PageContentCenter>
      </PageContent>
    </Page>
  );
}
