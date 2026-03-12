import React, { useEffect, useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { Box, Button, Icon, Icons, Text, config } from 'folds';
import { useMatrixClient } from '../hooks/useMatrixClient';
import { getMxIdLocalPart } from '../utils/matrix';
import {
  usePremiumRequestStatus,
  usePremiumSettings,
  usePremiumStatus,
} from '../hooks/usePremium';
import { premiumModalAtom } from '../state/premium';
import { DEFAULT_PREMIUM_FEATURES, type PremiumRequestStatus } from '../utils/premium';
import { fetchPremiumRequestStatus, sendPremiumRequest } from '../utils/premiumRequest';
import { PremiumBadge } from './PremiumBadge';
import * as css from './PremiumUpgrade.css';

type PremiumUpgradeContentProps = {
  variant?: 'page' | 'modal';
};

export function PremiumUpgradeContent({ variant = 'page' }: PremiumUpgradeContentProps) {
  const mx = useMatrixClient();
  const [, setModal] = useAtom(premiumModalAtom);
  const userId = mx.getUserId();
  const settings = usePremiumSettings();
  const premium = usePremiumStatus(userId);
  const requestStatus = usePremiumRequestStatus(userId);
  const [remoteStatus, setRemoteStatus] = useState<PremiumRequestStatus | null>(null);
  const [requestState, setRequestState] = useState<{
    status?: PremiumRequestStatus['status'];
    plan?: PremiumRequestStatus['plan'];
    message?: string;
  }>({});
  const [requestBusy, setRequestBusy] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const features = settings.features && settings.features.length > 0
    ? settings.features
    : DEFAULT_PREMIUM_FEATURES;

  const openUpgrade = () => {
    setModal({ open: true });
  };

  const closeModal = () => {
    if (variant === 'modal') setModal({ open: false });
  };

  const effectiveStatus =
    requestStatus ?? remoteStatus ?? (requestState.status ? requestState : undefined);
  const planLabel = premium.plan ? premium.plan.toUpperCase() : 'FREE';
  const untilLabel = premium.until ? new Date(premium.until).toLocaleDateString() : '—';
  const username = userId ? getMxIdLocalPart(userId) ?? userId : 'You';
  const requestDisabled =
    requestBusy ||
    premium.active ||
    effectiveStatus?.status === 'pending' ||
    effectiveStatus?.status === 'payment_requested';

  const statusMessage = useMemo(() => {
    if (!effectiveStatus) return null;
    if (effectiveStatus.status === 'pending') {
      return 'Request sent. Waiting for admin approval.';
    }
    if (effectiveStatus.status === 'payment_requested') {
      const amount = effectiveStatus.amount ? `${effectiveStatus.amount}` : 'Payment required';
      const note = effectiveStatus.note ? ` - ${effectiveStatus.note}` : '';
      return `Payment requested: ${amount} ${effectiveStatus.currency ?? ''}`.trim() + note;
    }
    if (effectiveStatus.status === 'approved') {
      return 'Premium approved. Enjoy your benefits.';
    }
    if (effectiveStatus.status === 'rejected') {
      return 'Request rejected. Contact admin if needed.';
    }
    return null;
  }, [effectiveStatus]);

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    const loadStatus = async () => {
      try {
        const status = await fetchPremiumRequestStatus(userId);
        if (active) setRemoteStatus(status);
      } catch {
        if (active) setRemoteStatus(null);
      }
    };
    void loadStatus();
    const interval = window.setInterval(loadStatus, 20000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [userId]);

  const submitRequest = async (plan: PremiumRequestStatus['plan']) => {
    if (!userId || !plan) return;
    setRequestBusy(true);
    setRequestError(null);
    try {
      const status = await sendPremiumRequest({ userId, plan });
      setRequestState({ status: status?.status ?? 'pending', plan, message: 'Request sent.' });
      setRemoteStatus(status ?? null);
    } catch (err) {
      setRequestError(
        err instanceof Error ? err.message : 'Unable to send premium request. Try again.'
      );
    } finally {
      setRequestBusy(false);
    }
  };

  return (
    <Box direction="Column" className={css.PremiumContent}>
      <Box className={css.PremiumHero} direction="Column" gap="200">
        <div className={css.PremiumHeroGlow} />
        <Box alignItems="Center" gap="200" className={css.PremiumMetaRow}>
          <span className={css.PremiumHeroBadge}>
            <PremiumBadge size="300" title="VChat Premium" />
          </span>
          <Box direction="Column" gap="50">
            <Text className={css.PremiumHeroTitle}>VChat Premium</Text>
            <Text className={css.PremiumHeroSub}>
              Unlock powerful features with a polished Telegram-style experience.
            </Text>
          </Box>
        </Box>
        <Box direction="Column" gap="50">
          <Text size="T200">Current plan: {planLabel}</Text>
          <Text size="T200">Member: {username}</Text>
          <Text size="T200">Expires: {premium.active ? untilLabel : 'Not active'}</Text>
        </Box>
        <Box className={css.PremiumUpgradeActions}>
          <Button
            variant="Primary"
            radii="Pill"
            size="400"
            onClick={() => {
              const planSection = document.getElementById('premium-plans');
              planSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <Text size="B400">{premium.active ? 'Manage Premium' : 'Choose a Plan'}</Text>
          </Button>
          {variant === 'modal' && (
            <Button variant="Secondary" radii="Pill" size="400" onClick={closeModal}>
              <Text size="B400">Close</Text>
            </Button>
          )}
        </Box>
        {statusMessage && (
          <Text size="T200" priority="300">
            {statusMessage}
          </Text>
        )}
        {requestError && (
          <Text size="T200" style={{ color: '#f87171' }}>
            {requestError}
          </Text>
        )}
      </Box>

      <Box direction="Column" gap="300">
        <Text size="H4" id="premium-plans">
          Choose a plan
        </Text>
        {statusMessage && (
          <Text size="T200" priority="300">
            {statusMessage}
          </Text>
        )}
        <Box className={css.PremiumPlans}>
          <Box className={css.PremiumPlanCard}>
            <Text size="L400">Monthly</Text>
            <Text size="H4">{settings.monthlyPrice ?? '—'}</Text>
            <Text size="T200" priority="300">
              Billed monthly. Cancel anytime.
            </Text>
            <Button
              variant="Secondary"
              radii="Pill"
              size="300"
              disabled={requestDisabled}
              onClick={() => submitRequest('monthly')}
            >
              <Text size="B300">{requestDisabled ? 'Request Pending' : 'Select Monthly'}</Text>
            </Button>
          </Box>
          <Box className={`${css.PremiumPlanCard} ${css.PremiumPlanHighlight}`}>
            {settings.yearlyDiscount && (
              <span className={css.PremiumDiscount}>{settings.yearlyDiscount}</span>
            )}
            <Text size="L400">Yearly</Text>
            <Text size="H4">{settings.yearlyPrice ?? '—'}</Text>
            <Text size="T200" priority="300">
              Best value for power users.
            </Text>
            <Button
              variant="Primary"
              radii="Pill"
              size="300"
              disabled={requestDisabled}
              onClick={() => submitRequest('yearly')}
            >
              <Text size="B300">{requestDisabled ? 'Request Pending' : 'Select Yearly'}</Text>
            </Button>
          </Box>
        </Box>
        <Text size="T200" priority="300">
          Requests go directly to the admin. You will see payment or approval updates here.
        </Text>
      </Box>

      <Box direction="Column" gap="300">
        <Text size="H4">Free vs Premium</Text>
        <Box className={css.PremiumPlans}>
          <Box className={css.PremiumPlanCard}>
            <Text size="L400">Free</Text>
            <Text size="T200" priority="300">
              Core messaging, basic limits, standard emojis.
            </Text>
            <Text size="T200" priority="300">
              No premium badge, fewer pinned chats and folders.
            </Text>
          </Box>
          <Box className={`${css.PremiumPlanCard} ${css.PremiumPlanHighlight}`}>
            <Text size="L400">Premium</Text>
            <Text size="T200" priority="300">
              Premium badge, faster media, more organization tools.
            </Text>
            <Text size="T200" priority="300">
              Animated emojis, custom themes, advanced privacy.
            </Text>
          </Box>
        </Box>
      </Box>

      <Box direction="Column" gap="300">
        <Text size="H4">Premium features</Text>
        <Box className={css.PremiumFeatureGrid}>
          {features.map((feature) => {
            const locked = !premium.active;
            const icon = feature.icon && feature.icon in Icons ? Icons[feature.icon] : Icons.Star;
            return (
              <Box
                key={feature.key}
                className={`${css.PremiumFeatureCard} ${locked ? css.PremiumLocked : ''}`}
                onClick={locked ? openUpgrade : undefined}
                title={locked ? 'Premium required' : undefined}
              >
                <Box
                  alignItems="Center"
                  justifyContent="Center"
                  style={{
                    width: config.size.X300,
                    height: config.size.X300,
                    borderRadius: config.radii.R400,
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  }}
                >
                  <Icon src={icon} size="200" />
                </Box>
                <Box direction="Column" gap="50">
                  <Text size="L400">{feature.title}</Text>
                  {feature.description && (
                    <Text size="T200" priority="300">
                      {feature.description}
                    </Text>
                  )}
                </Box>
                {locked && (
                  <Box alignItems="Center" justifyContent="Center">
                    <Icon src={Icons.Lock} size="100" />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
