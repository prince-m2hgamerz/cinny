import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
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
import { userIdentityOverridesAtom } from '../../../state/userIdentities';
import {
  normalizeIdentityList,
  saveUserIdentityOverrides,
  USER_IDENTITIES_EVENT_TYPE,
} from '../../../utils/verifiedUser';
import type { UserIdentityConfig, UserIdentityTagTone } from '../../../hooks/useClientConfig';
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
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [identityRoomId, setIdentityRoomId] = useState<string | null>(null);
  const [identityRoomError, setIdentityRoomError] = useState<string | null>(null);

  const tagTones: UserIdentityTagTone[] = ['critical', 'blue', 'green', 'gold', 'gray'];

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
    } catch {
      setError(
        'Failed to publish badge updates. Make sure you are joined to the identity room and have permission to send state events.'
      );
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
    const entry: UserIdentityConfig = {
      userId: userIdValue,
      verified: form.verified ?? true,
      tag: form.tag?.trim() ?? '',
      tagTone,
      badgeTitle: form.badgeTitle?.trim() ?? '',
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
    });
    setError(null);
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
          <>
            <SequenceCard
              className={css.AdminToolsCard}
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
            <div className={css.AdminFrameWrap}>
              <iframe className={css.AdminFrame} title="Admin Panel" src={adminUrl} />
            </div>
          </>
        )}
      </PageContent>
    </Page>
  );
}
