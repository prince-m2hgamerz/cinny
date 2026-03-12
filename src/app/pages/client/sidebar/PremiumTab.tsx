import React from 'react';
import { Icon, Icons } from 'folds';
import { useNavigate } from 'react-router-dom';
import { SidebarAvatar, SidebarItem, SidebarItemTooltip } from '../../../components/sidebar';
import { PREMIUM_PATH } from '../../paths';

export function PremiumTab() {
  const navigate = useNavigate();

  const handlePremiumClick = () => {
    navigate(PREMIUM_PATH);
  };

  return (
    <SidebarItem active={false}>
      <SidebarItemTooltip tooltip="VChat Premium">
        {(triggerRef) => (
          <SidebarAvatar as="button" ref={triggerRef} outlined onClick={handlePremiumClick}>
            <Icon src={Icons.Star} />
          </SidebarAvatar>
        )}
      </SidebarItemTooltip>
    </SidebarItem>
  );
}
