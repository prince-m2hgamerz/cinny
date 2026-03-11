import React from 'react';
import { Icon, Icons } from 'folds';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { SidebarAvatar, SidebarItem, SidebarItemTooltip } from '../../../components/sidebar';
import { useAdminSelected } from '../../../hooks/router/useAdminSelected';
import { useClientConfig } from '../../../hooks/useClientConfig';
import { useMatrixClient } from '../../../hooks/useMatrixClient';
import { ScreenSize, useScreenSizeContext } from '../../../hooks/useScreenSize';
import { useNavToActivePathAtom } from '../../../state/hooks/navToActivePath';
import { getAdminPath, joinPathComponent } from '../../pathUtils';

const DEFAULT_ADMIN_USERS = ['@m2h:vgram.m2hio.in'];

export function AdminTab() {
  const mx = useMatrixClient();
  const { adminPanel } = useClientConfig();
  const navigate = useNavigate();
  const screenSize = useScreenSizeContext();
  const navToActivePath = useAtomValue(useNavToActivePathAtom());

  const userId = mx.getUserId();
  const allowedUserIds =
    adminPanel?.allowedUserIds && adminPanel.allowedUserIds.length > 0
      ? adminPanel.allowedUserIds
      : DEFAULT_ADMIN_USERS;
  const enabled = adminPanel?.enabled !== false;
  const isAllowed = !!userId && allowedUserIds.includes(userId);

  const adminSelected = useAdminSelected();

  if (!enabled || !isAllowed) return null;

  const handleAdminClick = () => {
    if (screenSize !== ScreenSize.Mobile) {
      const activePath = navToActivePath.get('admin');
      if (activePath) {
        navigate(joinPathComponent(activePath));
        return;
      }
    }

    navigate(getAdminPath());
  };

  return (
    <SidebarItem active={adminSelected}>
      <SidebarItemTooltip tooltip="Admin Panel">
        {(triggerRef) => (
          <SidebarAvatar as="button" ref={triggerRef} outlined onClick={handleAdminClick}>
            <Icon src={Icons.ShieldLock} filled={adminSelected} />
          </SidebarAvatar>
        )}
      </SidebarItemTooltip>
    </SidebarItem>
  );
}
