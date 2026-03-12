import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Text } from 'folds';
import { useMatrixClient } from '../hooks/useMatrixClient';
import { usePremiumStatus } from '../hooks/usePremium';
import { PREMIUM_PATH } from '../pages/paths';
import { PremiumBadge } from './PremiumBadge';
import * as css from './PremiumBanner.css';

export function PremiumBanner() {
  const mx = useMatrixClient();
  const navigate = useNavigate();
  const userId = mx.getUserId();
  const premium = usePremiumStatus(userId);

  return (
    <Box className={css.PremiumBanner} alignItems="Center">
      <div className={css.PremiumBannerGlow} />
      <Box alignItems="Center" gap="200">
        <span className={css.PremiumBannerBadge}>
          <PremiumBadge size="200" title="Premium" />
        </span>
        <Box direction="Column" gap="50">
          <Text size="L400">VChat Premium</Text>
          <Text size="T200" priority="300">
            {premium.active ? 'Premium is active on this account.' : 'Unlock premium features.'}
          </Text>
        </Box>
      </Box>
      <Button
        size="300"
        variant={premium.active ? 'Secondary' : 'Primary'}
        fill={premium.active ? 'Soft' : 'Solid'}
        radii="Pill"
        onClick={() => navigate(PREMIUM_PATH)}
      >
        <Text size="B300">{premium.active ? 'Manage' : 'Upgrade'}</Text>
      </Button>
    </Box>
  );
}
