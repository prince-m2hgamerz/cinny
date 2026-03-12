import { useAtom } from 'jotai';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Icon, Icons, Input, Switch, Text, color } from 'folds';
import {
  Page,
  PageContent,
  PageContentCenter,
  PageHeader,
  PageHeroEmpty,
} from '../../../components/page';
import { SequenceCard } from '../../../components/sequence-card';
import { useClientConfig } from '../../../hooks/useClientConfig';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { useNavToActivePathMapper } from '../../../hooks/useNavToActivePathMapper';
import { usePremiumSettings } from '../../../hooks/usePremium';
import { premiumSettingsAtom } from '../../../state/premium';
import { userIdentityOverridesAtom } from '../../../state/userIdentities';
import {
  normalizeIdentityList,
  saveUserIdentityOverrides,
  USER_IDENTITIES_EVENT_TYPE,
} from '../../../utils/verifiedUser';
import {
  computePremiumExpiry,
  formatFeatureList,
  parseFeatureList,
  PREMIUM_SETTINGS_EVENT_TYPE,
  savePremiumSettings,
  type PremiumSettings,
} from '../../../utils/premium';
import {
  fetchPremiumRequests,
  updatePremiumRequestStatus,
  type PremiumRequestRecord,
} from '../../../utils/premiumRequest';
import type { PremiumPlan, UserIdentityConfig, UserIdentityTagTone } from '../../../hooks/useClientConfig';
import * as css from './AdminPanel.css';

const DEFAULT_ADMIN_USERS = ['@m2h:vgram.m2hio.in'];

export function AdminPanel() {
  useNavToActivePathMapper('admin');

  const mx = useMatrixClient();
  const { adminPanel } = useClientConfig();
  const userId = mx.getUserId() ?? '';

  const allowedUserIds =
    adminPanel?.allowedUserIds && adminPanel.allowedUserIds.length > 0
      ? adminPanel.allowedUserIds
      : DEFAULT_ADMIN_USERS;
  const enabled = adminPanel?.enabled !== false;
  const adminUrl = adminPanel?.url?.trim() ?? '';
  const identityRoomRef = adminPanel?.identityRoom?.trim() ?? '#vchat:vgram.m2hio.in';

  const isAllowed = userId.length > 0 && allowedUserIds.includes(userId);

  const [overrides, setOverrides] = useAtom(userIdentityOverridesAtom);
  const [form, setForm] = useState<UserIdentityConfig>({
    userId: '',
    verified: true,
    tag: '',
    tagTone: 'critical',
    badgeTitle: '',
    premium: false,
    premiumPlan: 'monthly',
    premiumUntil: '',
    premiumSince: '',
  });
  const premiumDefaults = usePremiumSettings();
  const [, setPremiumSettings] = useAtom(premiumSettingsAtom);
  const [premiumForm, setPremiumForm] = useState({
    monthlyPrice: premiumDefaults.monthlyPrice ?? '',
    yearlyPrice: premiumDefaults.yearlyPrice ?? '',
    yearlyDiscount: premiumDefaults.yearlyDiscount ?? '',
    featuresInput: formatFeatureList(premiumDefaults.features),
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [identityRoomId, setIdentityRoomId] = useState<string | null>(null);
  const [identityRoomError, setIdentityRoomError] = useState<string | null>(null);
  const [requestRows, setRequestRows] = useState<PremiumRequestRecord[]>([]);
  const requestRowsRef = useRef<PremiumRequestRecord[]>([]);
  const [requestDrafts, setRequestDrafts] = useState<
    Record<string, { amount: string; currency: string; note: string }>
  >({});
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestBusyId, setRequestBusyId] = useState<string | null>(null);

  const tagTones: UserIdentityTagTone[] = ['critical', 'blue', 'green', 'gold', 'gray'];
  const premiumPlans: PremiumPlan[] = ['monthly', 'yearly', 'lifetime', 'trial'];

  useEffect(() => {
    setPremiumForm({
      monthlyPrice: premiumDefaults.monthlyPrice ?? '',
      yearlyPrice: premiumDefaults.yearlyPrice ?? '',
      yearlyDiscount: premiumDefaults.yearlyDiscount ?? '',
      featuresInput: formatFeatureList(premiumDefaults.features),
    });
  }, [premiumDefaults]);

  const requestList = useMemo(() => {
    const byUser = new Map<string, PremiumRequestRecord>();
    requestRows.forEach((request) => {
      const existing = byUser.get(request.userId);
      if (!existing) {
        byUser.set(request.userId, request);
        return;
      }
      const existingTime = existing.requestedAt ? new Date(existing.requestedAt).getTime() : 0;
      const nextTime = request.requestedAt ? new Date(request.requestedAt).getTime() : 0;
      if (nextTime > existingTime) byUser.set(request.userId, request);
    });
    return Array.from(byUser.values()).sort((a, b) => {
      const aTime = a.requestedAt ? new Date(a.requestedAt).getTime() : 0;
      const bTime = b.requestedAt ? new Date(b.requestedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [requestRows]);

  useEffect(() => {
    requestRowsRef.current = requestRows;
  }, [requestRows]);

  const getLatestRequestForUser = useCallback((userIdValue: string, list: PremiumRequestRecord[]) => {
    const filtered = list.filter((item) => item.userId === userIdValue);
    if (filtered.length === 0) return undefined;
    return filtered.reduce((latest, current) => {
      const latestTime = latest.requestedAt ? new Date(latest.requestedAt).getTime() : 0;
      const currentTime = current.requestedAt ? new Date(current.requestedAt).getTime() : 0;
      return currentTime > latestTime ? current : latest;
    });
  }, []);

  const getDefaultAmount = useCallback(
    (plan?: PremiumPlan) => {
      if (plan === 'yearly') return premiumDefaults.yearlyPrice ?? '';
      if (plan === 'monthly') return premiumDefaults.monthlyPrice ?? '';
      return premiumDefaults.monthlyPrice ?? '';
    },
    [premiumDefaults.monthlyPrice, premiumDefaults.yearlyPrice]
  );

  const getDraft = useCallback(
    (request: PremiumRequestRecord) => {
      const existing = requestDrafts[request.userId];
      if (existing) return existing;
      return { amount: getDefaultAmount(request.plan), currency: '', note: '' };
    },
    [getDefaultAmount, requestDrafts]
  );

  const updateDraft = useCallback(
    (
      userIdValue: string,
      plan: PremiumPlan | undefined,
      patch: Partial<{ amount: string; currency: string; note: string }>
    ) => {
      setRequestDrafts((current) => {
        const base = current[userIdValue] ?? {
          amount: getDefaultAmount(plan),
          currency: '',
          note: '',
        };
        return { ...current, [userIdValue]: { ...base, ...patch } };
      });
    },
    [getDefaultAmount]
  );

  const refreshRequests = useCallback(async (): Promise<PremiumRequestRecord[] | null> => {
    setRequestLoading(true);
    setRequestError(null);
    try {
      const list = await fetchPremiumRequests();
      setRequestRows(list);
      requestRowsRef.current = list;
      return list;
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Unable to load requests.');
      return null;
    } finally {
      setRequestLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isAllowed) return undefined;
    void refreshRequests();
    const interval = window.setInterval(refreshRequests, 20000);
    return () => window.clearInterval(interval);
  }, [enabled, isAllowed, refreshRequests]);

  useEffect(() => {
    let active = true;
    const resolveRoomId = async () => {
      if (!identityRoomRef) {
        if (active) {
          setIdentityRoomId(null);
          setIdentityRoomError('Identity room is not configured.');
        }
        return;
      }
      if (identityRoomRef.startsWith('!')) {
        if (active) {
          setIdentityRoomId(identityRoomRef);
          setIdentityRoomError(null);
        }
        return;
      }
      if (!identityRoomRef.startsWith('#')) {
        if (active) {
          setIdentityRoomId(null);
          setIdentityRoomError('Identity room must be a room ID or alias.');
        }
        return;
      }
      try {
        const result = await mx.getRoomIdForAlias(identityRoomRef);
        if (!active) return;
        setIdentityRoomId(result.room_id);
        setIdentityRoomError(null);
      } catch {
        if (!active) return;
        setIdentityRoomId(null);
        setIdentityRoomError('Unable to resolve identity room alias.');
      }
    };
    resolveRoomId();
    return () => {
      active = false;
    };
  }, [identityRoomRef, mx]);

  const handleOpenAdmin = () => {
    if (!adminUrl) return;
    window.open(adminUrl, '_blank', 'noopener,noreferrer');
  };

  const updateForm = (patch: Partial<UserIdentityConfig>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const validateUserId = (value: string) => /^@.+:.+$/.test(value);

  const ensureIdentityRoomJoined = async () => {
    if (!identityRoomRef) return;
    try {
      await mx.joinRoom(identityRoomRef);
    } catch {
      // ignore join failures, handled in publish error
    }
  };

  const formatStateEventError = (err: unknown) => {
    const anyErr = err as { errcode?: string; message?: string; data?: { errcode?: string } };
    const code = anyErr?.errcode ?? anyErr?.data?.errcode;
    if (code === 'M_FORBIDDEN') {
      return 'You do not have permission to send state events in the identity room. Give this account a higher power level.';
    }
    return 'Failed to publish badge updates. Make sure you are joined to the identity room and have permission to send state events.';
  };

  const publishOverrides = async (nextOverrides: UserIdentityConfig[]) => {
    if (!identityRoomId) {
      setError(
        identityRoomError ??
          `Join ${identityRoomRef || 'the identity room'} to publish badge updates.`
      );
      return;
    }
    const normalized = normalizeIdentityList(nextOverrides);
    setSaving(true);
    try {
      await mx.sendStateEvent(
        identityRoomId,
        USER_IDENTITIES_EVENT_TYPE,
        {
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: userId || undefined,
          identities: normalized,
        },
        ''
      );
      saveUserIdentityOverrides(normalized);
      setOverrides(normalized);
      setError(null);
    } catch (err) {
      const room = mx.getRoom(identityRoomId);
      if (room?.getMyMembership?.() !== 'join') {
        await ensureIdentityRoomJoined();
        try {
          await mx.sendStateEvent(
            identityRoomId,
            USER_IDENTITIES_EVENT_TYPE,
            {
              version: 1,
              updatedAt: new Date().toISOString(),
              updatedBy: userId || undefined,
              identities: normalized,
            },
            ''
          );
          saveUserIdentityOverrides(normalized);
          setOverrides(normalized);
          setError(null);
          return;
        } catch (retryErr) {
          setError(formatStateEventError(retryErr));
        }
      } else {
        setError(formatStateEventError(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const publishPremiumSettings = async (nextSettings: PremiumSettings) => {
    if (!identityRoomId) {
      setError(
        identityRoomError ??
          `Join ${identityRoomRef || 'the identity room'} to publish premium updates.`
      );
      return;
    }
    setSaving(true);
    try {
      await mx.sendStateEvent(
        identityRoomId,
        PREMIUM_SETTINGS_EVENT_TYPE,
        {
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: userId || undefined,
          ...nextSettings,
        },
        ''
      );
      savePremiumSettings(nextSettings);
      setPremiumSettings(nextSettings);
      setError(null);
    } catch (err) {
      const room = mx.getRoom(identityRoomId);
      if (room?.getMyMembership?.() !== 'join') {
        await ensureIdentityRoomJoined();
        try {
          await mx.sendStateEvent(
            identityRoomId,
            PREMIUM_SETTINGS_EVENT_TYPE,
            {
              version: 1,
              updatedAt: new Date().toISOString(),
              updatedBy: userId || undefined,
              ...nextSettings,
            },
            ''
          );
          savePremiumSettings(nextSettings);
          setPremiumSettings(nextSettings);
          setError(null);
          return;
        } catch (retryErr) {
          setError(formatStateEventError(retryErr));
        }
      } else {
        setError(formatStateEventError(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    const userIdValue = form.userId.trim();
    if (!validateUserId(userIdValue)) {
      setError('Enter a valid Matrix user ID (example: @name:server).');
      return;
    }
    const tagTone = tagTones.includes(form.tagTone ?? 'critical')
      ? form.tagTone
      : 'critical';
    const premiumPlan = premiumPlans.includes(form.premiumPlan ?? 'monthly')
      ? form.premiumPlan
      : 'monthly';
    const entry: UserIdentityConfig = {
      userId: userIdValue,
      verified: form.verified ?? true,
      tag: form.tag?.trim() ?? '',
      tagTone,
      badgeTitle: form.badgeTitle?.trim() ?? '',
      premium: form.premium ?? false,
      premiumPlan,
      premiumUntil: form.premiumUntil?.trim() ?? '',
      premiumSince: form.premiumSince?.trim() ?? '',
    };

    const next = overrides.filter((item) => item.userId !== userIdValue).concat(entry);
    void publishOverrides(next);
  };

  const handleEdit = (entry: UserIdentityConfig) => {
    setForm({
      userId: entry.userId,
      verified: entry.verified ?? true,
      tag: entry.tag ?? '',
      tagTone: entry.tagTone ?? 'critical',
      badgeTitle: entry.badgeTitle ?? '',
      premium: entry.premium ?? false,
      premiumPlan: entry.premiumPlan ?? 'monthly',
      premiumUntil: entry.premiumUntil ?? '',
      premiumSince: entry.premiumSince ?? '',
    });
    setError(null);
  };

  const handleRemove = (userIdToRemove: string) => {
    const next = overrides.filter((item) => item.userId !== userIdToRemove);
    void publishOverrides(next);
  };

  const handleClear = () => {
    void publishOverrides([]);
    setForm({
      userId: '',
      verified: true,
      tag: '',
      tagTone: 'critical',
      badgeTitle: '',
      premium: false,
      premiumPlan: 'monthly',
      premiumUntil: '',
      premiumSince: '',
    });
    setError(null);
  };

  const updatePremiumForm = (patch: Partial<typeof premiumForm>) => {
    setPremiumForm((current) => ({ ...current, ...patch }));
  };

  const handleSavePremiumSettings = () => {
    const featureInput = premiumForm.featuresInput.trim();
    const defaultFeatureInput = formatFeatureList(premiumDefaults.features);
    const nextFeatures =
      featureInput.length === 0 || featureInput === defaultFeatureInput
        ? premiumDefaults.features
        : parseFeatureList(featureInput);
    const nextSettings: PremiumSettings = {
      monthlyPrice: premiumForm.monthlyPrice.trim() || premiumDefaults.monthlyPrice,
      yearlyPrice: premiumForm.yearlyPrice.trim() || premiumDefaults.yearlyPrice,
      yearlyDiscount: premiumForm.yearlyDiscount.trim() || premiumDefaults.yearlyDiscount,
      features: nextFeatures,
    };
    void publishPremiumSettings(nextSettings);
  };

  const handleResetPremiumSettings = () => {
    setPremiumForm({
      monthlyPrice: premiumDefaults.monthlyPrice ?? '',
      yearlyPrice: premiumDefaults.yearlyPrice ?? '',
      yearlyDiscount: premiumDefaults.yearlyDiscount ?? '',
      featuresInput: formatFeatureList(premiumDefaults.features),
    });
  };

  const applyStatusToRows = useCallback((status: PremiumRequestRecord | null) => {
    if (!status) return;
    setRequestRows((current) =>
      current.map((row) =>
        row.userId === status.userId
          ? {
              ...row,
              status: status.status ?? row.status,
              plan: status.plan ?? row.plan,
              amount: status.amount ?? row.amount,
              currency: status.currency ?? row.currency,
              note: status.note ?? row.note,
              updatedAt: status.updatedAt ?? row.updatedAt,
              updatedBy: status.updatedBy ?? row.updatedBy,
            }
          : row
      )
    );
  }, []);

  const handleRequestPayment = async (request: PremiumRequestRecord) => {
    setRequestBusyId(request.userId);
    setRequestError(null);
    try {
      const draft = getDraft(request);
      const status = await updatePremiumRequestStatus({
        userId: request.userId,
        requestId: request.id,
        plan: request.plan,
        status: 'payment_requested',
        amount: draft.amount,
        currency: draft.currency,
        note: draft.note,
        updatedBy: userId || undefined,
      });
      applyStatusToRows(status ? { ...request, ...status } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to request payment.';
      if (message.includes('Request not found')) {
        const list = (await refreshRequests()) ?? requestRowsRef.current;
        const latest = getLatestRequestForUser(request.userId, list);
        if (latest) {
          try {
            const draft = getDraft(latest);
            const status = await updatePremiumRequestStatus({
              userId: latest.userId,
              requestId: latest.id,
              plan: latest.plan,
              status: 'payment_requested',
              amount: draft.amount,
              currency: draft.currency,
              note: draft.note,
              updatedBy: userId || undefined,
            });
            applyStatusToRows(status ? { ...latest, ...status } : null);
            return;
          } catch (retryErr) {
            setRequestError(
              retryErr instanceof Error ? retryErr.message : 'Unable to request payment.'
            );
            return;
          }
        }
      }
      setRequestError(message);
    } finally {
      setRequestBusyId(null);
    }
  };

  const handleApproveRequest = async (request: PremiumRequestRecord) => {
    if (!identityRoomId) {
      setRequestError(
        identityRoomError ??
          `Join ${identityRoomRef || 'the identity room'} to approve premium.`
      );
      return;
    }
    setRequestBusyId(request.userId);
    setRequestError(null);
    try {
      const plan = request.plan ?? 'monthly';
      const existing = overrides.find((entry) => entry.userId === request.userId);
      const now = new Date();
      const computedUntil = computePremiumExpiry(plan, now) ?? '';
      const nextEntry: UserIdentityConfig = {
        userId: request.userId,
        verified: existing?.verified ?? false,
        tag: existing?.tag ?? '',
        tagTone: existing?.tagTone ?? 'critical',
        badgeTitle: existing?.badgeTitle ?? '',
        premium: true,
        premiumPlan: plan,
        premiumSince: existing?.premiumSince ?? now.toISOString(),
        premiumUntil: computedUntil || existing?.premiumUntil || '',
      };
      const next = overrides.filter((entry) => entry.userId !== request.userId).concat(nextEntry);
      await publishOverrides(next);
      const status = await updatePremiumRequestStatus({
        userId: request.userId,
        requestId: request.id,
        plan,
        status: 'approved',
        updatedBy: userId || undefined,
      });
      applyStatusToRows(status ? { ...request, ...status } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to approve request.';
      if (message.includes('Request not found')) {
        const list = (await refreshRequests()) ?? requestRowsRef.current;
        const latest = getLatestRequestForUser(request.userId, list);
        if (latest) {
          try {
            const status = await updatePremiumRequestStatus({
              userId: latest.userId,
              requestId: latest.id,
              plan: latest.plan ?? plan,
              status: 'approved',
              updatedBy: userId || undefined,
            });
            applyStatusToRows(status ? { ...latest, ...status } : null);
            return;
          } catch (retryErr) {
            setRequestError(retryErr instanceof Error ? retryErr.message : 'Unable to approve.');
            return;
          }
        }
      }
      setRequestError(message);
    } finally {
      setRequestBusyId(null);
    }
  };

  const handleRejectRequest = async (request: PremiumRequestRecord) => {
    setRequestBusyId(request.userId);
    setRequestError(null);
    try {
      const status = await updatePremiumRequestStatus({
        userId: request.userId,
        requestId: request.id,
        plan: request.plan,
        status: 'rejected',
        updatedBy: userId || undefined,
      });
      applyStatusToRows(status ? { ...request, ...status } : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reject request.';
      if (message.includes('Request not found')) {
        const list = (await refreshRequests()) ?? requestRowsRef.current;
        const latest = getLatestRequestForUser(request.userId, list);
        if (latest) {
          try {
            const status = await updatePremiumRequestStatus({
              userId: latest.userId,
              requestId: latest.id,
              plan: latest.plan,
              status: 'rejected',
              updatedBy: userId || undefined,
            });
            applyStatusToRows(status ? { ...latest, ...status } : null);
            return;
          } catch (retryErr) {
            setRequestError(retryErr instanceof Error ? retryErr.message : 'Unable to reject.');
            return;
          }
        }
      }
      setRequestError(message);
    } finally {
      setRequestBusyId(null);
    }
  };

  return (
    <Page className={css.AdminPage}>
      <PageHeader balance>
        <Box grow="Yes" alignItems="Center" justifyContent="SpaceBetween" gap="200">
          <Box direction="Column" gap="100">
            <Text size="H4">Admin Panel</Text>
            <Text size="T200" priority="300">
              Admin access for configured users only.
            </Text>
          </Box>
          {adminUrl && isAllowed && (
            <Button
              variant="Secondary"
              size="300"
              radii="300"
              onClick={handleOpenAdmin}
              before={<Icon src={Icons.External} size="100" />}
            >
              <Text size="B300">Open in new tab</Text>
            </Button>
          )}
        </Box>
      </PageHeader>
      <PageContent className={css.AdminContent}>
        {!enabled && (
          <PageContentCenter>
            <PageHeroEmpty>
              <Text size="H4">Admin panel disabled</Text>
              <Text size="T200" align="Center">
                Enable it in config.json to use the embedded panel.
              </Text>
            </PageHeroEmpty>
          </PageContentCenter>
        )}
        {enabled && !isAllowed && (
          <PageContentCenter>
            <PageHeroEmpty>
              <Text size="H4">Not authorized</Text>
              <Text size="T200" align="Center">
                This panel is available only for configured admin accounts.
              </Text>
            </PageHeroEmpty>
          </PageContentCenter>
        )}
        {enabled && isAllowed && !adminUrl && (
          <PageContentCenter>
            <PageHeroEmpty>
              <Text size="H4">Admin URL missing</Text>
              <Text size="T200" align="Center">
                Set adminPanel.url in config.json to load the admin panel.
              </Text>
            </PageHeroEmpty>
          </PageContentCenter>
        )}
        {enabled && isAllowed && adminUrl && (
          <div className={css.AdminLayout}>
            <div className={css.AdminMain}>
            <SequenceCard
              className={`${css.AdminToolsCard} ${css.AdminCardBadges}`}
              variant="SurfaceVariant"
              direction="Column"
              gap="300"
            >
              <Box direction="Column" gap="100">
                <Text size="L400">User Badges & Tags</Text>
                <Text size="T200" priority="300">
                  Add or update a user badge/tag. Changes sync to everyone in the identity room.
                </Text>
                <Text size="T200" priority="300">
                  Identity room: {identityRoomRef || 'Not configured'}
                </Text>
              </Box>
              <Box className={css.AdminForm}>
                <Input
                  placeholder="@user:server"
                  size="400"
                  variant="Background"
                  value={form.userId}
                  onChange={(evt) => updateForm({ userId: evt.target.value })}
                />
                <Input
                  placeholder="Tag (e.g. ADMIN)"
                  size="400"
                  variant="Background"
                  value={form.tag ?? ''}
                  onChange={(evt) => updateForm({ tag: evt.target.value })}
                />
                <Input
                  placeholder="Badge title"
                  size="400"
                  variant="Background"
                  value={form.badgeTitle ?? ''}
                  onChange={(evt) => updateForm({ badgeTitle: evt.target.value })}
                />
                <Box alignItems="Center" gap="100" className={css.AdminSwitch}>
                  <Text size="T300">Premium</Text>
                  <Switch
                    variant="Primary"
                    value={form.premium ?? false}
                    onChange={(value) => updateForm({ premium: value })}
                  />
                </Box>
                <Input
                  placeholder="Premium plan (monthly/yearly/lifetime/trial)"
                  size="400"
                  variant="Background"
                  value={form.premiumPlan ?? 'monthly'}
                  onChange={(evt) => updateForm({ premiumPlan: evt.target.value as PremiumPlan })}
                />
                <Input
                  placeholder="Premium until (YYYY-MM-DD)"
                  size="400"
                  variant="Background"
                  value={form.premiumUntil ?? ''}
                  onChange={(evt) => updateForm({ premiumUntil: evt.target.value })}
                />
                <Input
                  placeholder="Tone (critical/blue/green/gold/gray)"
                  size="400"
                  variant="Background"
                  value={form.tagTone ?? 'critical'}
                  onChange={(evt) =>
                    updateForm({ tagTone: evt.target.value as UserIdentityTagTone })
                  }
                />
                <Box alignItems="Center" gap="100" className={css.AdminSwitch}>
                  <Text size="T300">Verified</Text>
                  <Switch
                    variant="Primary"
                    value={form.verified ?? true}
                    onChange={(value) => updateForm({ verified: value })}
                  />
                </Box>
                <Box alignItems="Center" gap="100">
                  <Button
                    size="300"
                    variant="Primary"
                    radii="300"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Text size="B300">Save</Text>
                  </Button>
                  <Button
                    size="300"
                    variant="Secondary"
                    radii="300"
                    onClick={handleClear}
                    disabled={saving}
                  >
                    <Text size="B300">Clear</Text>
                  </Button>
                </Box>
              </Box>
              {(identityRoomError || error) && (
                <Text size="T200" style={{ color: color.Critical.Main }}>
                  <b>{error ?? identityRoomError}</b>
                </Text>
              )}
              <Box className={css.AdminList} direction="Column" gap="200">
                {overrides.length === 0 ? (
                  <Text size="T200" priority="300">
                    No custom badges yet.
                  </Text>
                ) : (
                  overrides.map((entry) => (
                    <Box key={entry.userId} className={css.AdminListRow}>
                      <Box direction="Column" gap="50" grow="Yes">
                        <Text size="T300">{entry.userId}</Text>
                        <Text size="T200" priority="300">
                          {entry.tag ? `Tag: ${entry.tag}` : 'No tag'}
                          {entry.tagTone ? ` · Tone: ${entry.tagTone}` : ''}
                          {entry.premium ? ` · Premium: ${entry.premiumPlan ?? 'active'}` : ''}
                          {entry.premiumUntil ? ` · Until: ${entry.premiumUntil}` : ''}
                        </Text>
                      </Box>
                      <Box alignItems="Center" gap="100" shrink="No">
                        <Button
                          size="300"
                          variant="Secondary"
                          radii="300"
                          onClick={() => handleEdit(entry)}
                          disabled={saving}
                        >
                          <Text size="B300">Edit</Text>
                        </Button>
                        <Button
                          size="300"
                          variant="Critical"
                          radii="300"
                          onClick={() => handleRemove(entry.userId)}
                          disabled={saving}
                        >
                          <Text size="B300">Remove</Text>
                        </Button>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </SequenceCard>
            <SequenceCard
              className={`${css.AdminToolsCard} ${css.AdminCardSettings}`}
              variant="SurfaceVariant"
              direction="Column"
              gap="300"
            >
              <Box direction="Column" gap="100">
                <Text size="L400">Premium Settings</Text>
                <Text size="T200" priority="300">
                  Update pricing and feature list. Changes sync to everyone in the identity room.
                </Text>
              </Box>
              <Box className={css.AdminForm}>
                <Input
                  placeholder="Monthly price (e.g. ₹299)"
                  size="400"
                  variant="Background"
                  value={premiumForm.monthlyPrice}
                  onChange={(evt) => updatePremiumForm({ monthlyPrice: evt.target.value })}
                />
                <Input
                  placeholder="Yearly price (e.g. ₹2499)"
                  size="400"
                  variant="Background"
                  value={premiumForm.yearlyPrice}
                  onChange={(evt) => updatePremiumForm({ yearlyPrice: evt.target.value })}
                />
                <Input
                  placeholder="Yearly discount label (e.g. Save 30%)"
                  size="400"
                  variant="Background"
                  value={premiumForm.yearlyDiscount}
                  onChange={(evt) => updatePremiumForm({ yearlyDiscount: evt.target.value })}
                />
                <Input
                  placeholder="Premium features (comma separated)"
                  size="400"
                  variant="Background"
                  value={premiumForm.featuresInput}
                  onChange={(evt) => updatePremiumForm({ featuresInput: evt.target.value })}
                />
                <Box alignItems="Center" gap="100">
                  <Button
                    size="300"
                    variant="Primary"
                    radii="300"
                    onClick={handleSavePremiumSettings}
                    disabled={saving}
                  >
                    <Text size="B300">Save</Text>
                  </Button>
                  <Button
                    size="300"
                    variant="Secondary"
                    radii="300"
                    onClick={handleResetPremiumSettings}
                    disabled={saving}
                  >
                    <Text size="B300">Reset</Text>
                  </Button>
                </Box>
              </Box>
            </SequenceCard>
            <SequenceCard
              className={`${css.AdminToolsCard} ${css.AdminCardRequests}`}
              variant="SurfaceVariant"
              direction="Column"
              gap="300"
            >
              <Box direction="Column" gap="100">
                <Text size="L400">Premium Requests</Text>
                <Text size="T200" priority="300">
                  Review upgrade requests, request payment, or approve access.
                </Text>
              </Box>
              <Box alignItems="Center" justifyContent="SpaceBetween" gap="100">
                <Text size="T200" priority="300">
                  {requestLoading ? 'Refreshing requests...' : 'Latest requests'}
                </Text>
                <Button
                  size="300"
                  variant="Secondary"
                  radii="300"
                  onClick={refreshRequests}
                  disabled={requestLoading}
                >
                  <Text size="B300">Refresh</Text>
                </Button>
              </Box>
              {requestError && (
                <Text size="T200" style={{ color: color.Critical.Main }}>
                  <b>{requestError}</b>
                </Text>
              )}
              <Box className={css.AdminRequestList} direction="Column" gap="200">
                {requestList.length === 0 && !requestLoading && (
                  <Text size="T200" priority="300">
                    No premium requests yet.
                  </Text>
                )}
                {requestList.map((request) => {
                  const status = request.status ?? 'pending';
                  const statusLabel =
                    status === 'payment_requested'
                      ? 'Payment requested'
                      : status === 'approved'
                        ? 'Approved'
                        : status === 'rejected'
                          ? 'Rejected'
                          : 'Pending';
                  const statusClass =
                    status === 'approved'
                      ? css.AdminStatusApproved
                      : status === 'rejected'
                        ? css.AdminStatusRejected
                        : status === 'payment_requested'
                          ? css.AdminStatusPayment
                          : css.AdminStatusPending;
                  const draft = getDraft(request);
                  const busy = requestBusyId === request.userId;
                  return (
                    <Box
                      key={`${request.userId}-${request.requestedAt}`}
                      className={css.AdminRequestCard}
                    >
                      <Box className={css.AdminRequestHeader} alignItems="Center" gap="200">
                        <Box direction="Column" gap="50" grow="Yes">
                          <Box alignItems="Center" gap="100" style={{ flexWrap: 'wrap' }}>
                            <Text size="T300">{request.userId}</Text>
                            <span className={`${css.AdminStatus} ${statusClass}`}>
                              {statusLabel}
                            </span>
                            {request.plan && (
                              <span className={css.AdminPlanPill}>
                                {request.plan.toUpperCase()}
                              </span>
                            )}
                          </Box>
                          <Text size="T200" priority="300">
                            Requested:{' '}
                            {request.requestedAt
                              ? new Date(request.requestedAt).toLocaleString()
                              : 'Unknown'}
                          </Text>
                          {request.note && (
                            <Text size="T200" priority="300">
                              Note: {request.note}
                            </Text>
                          )}
                          {(request.amount || request.currency) && (
                            <Text size="T200" priority="300">
                              Payment: {request.amount ?? 'Amount'} {request.currency ?? ''}
                            </Text>
                          )}
                        </Box>
                      </Box>
                      <Box className={css.AdminRequestInputs}>
                        <Input
                          placeholder="Amount"
                          size="300"
                          variant="Background"
                          value={draft.amount}
                          onChange={(evt) =>
                            updateDraft(request.userId, request.plan, {
                              amount: evt.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Currency"
                          size="300"
                          variant="Background"
                          value={draft.currency}
                          onChange={(evt) =>
                            updateDraft(request.userId, request.plan, {
                              currency: evt.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Payment note"
                          size="300"
                          variant="Background"
                          value={draft.note}
                          onChange={(evt) =>
                            updateDraft(request.userId, request.plan, {
                              note: evt.target.value,
                            })
                          }
                        />
                      </Box>
                      <Box className={css.AdminRequestActions} alignItems="Center" gap="100">
                        <Button
                          size="300"
                          variant="Secondary"
                          radii="300"
                          onClick={() => handleRequestPayment(request)}
                          disabled={busy}
                        >
                          <Text size="B300">Request payment</Text>
                        </Button>
                        <Button
                          size="300"
                          variant="Primary"
                          radii="300"
                          onClick={() => handleApproveRequest(request)}
                          disabled={busy}
                        >
                          <Text size="B300">Approve</Text>
                        </Button>
                        <Button
                          size="300"
                          variant="Critical"
                          radii="300"
                          onClick={() => handleRejectRequest(request)}
                          disabled={busy}
                        >
                          <Text size="B300">Reject</Text>
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </SequenceCard>
            </div>
            <div className={`${css.AdminAside} ${css.AdminColumnSticky}`}>
              <SequenceCard
                className={css.AdminToolsCard}
                variant="SurfaceVariant"
                direction="Column"
                gap="200"
              >
                <Box alignItems="Center" justifyContent="SpaceBetween" gap="100">
                  <Text size="L400">Synapse Admin</Text>
                  <Button
                    variant="Secondary"
                    size="300"
                    radii="300"
                    onClick={handleOpenAdmin}
                    before={<Icon src={Icons.External} size="100" />}
                  >
                    <Text size="B300">Open</Text>
                  </Button>
                </Box>
                <Text size="T200" priority="300">
                  Embedded admin console for user and server management.
                </Text>
                <div className={css.AdminFrameWrap}>
                  <iframe className={css.AdminFrame} title="Admin Panel" src={adminUrl} />
                </div>
              </SequenceCard>
            </div>
          </div>
        )}
      </PageContent>
    </Page>
  );
}
