import React from 'react';
import { useAtom } from 'jotai';
import FocusTrap from 'focus-trap-react';
import {
  Modal,
  Overlay,
  OverlayBackdrop,
  OverlayCenter,
  Box,
  IconButton,
  Icon,
  Icons,
  Scroll,
} from 'folds';
import { premiumModalAtom } from '../state/premium';
import { stopPropagation } from '../utils/keyboard';
import { PremiumUpgradeContent } from './PremiumUpgradeContent';

export function PremiumModalRenderer() {
  const [modal, setModal] = useAtom(premiumModalAtom);

  if (!modal.open) return null;

  return (
    <Overlay open backdrop={<OverlayBackdrop />}>
      <OverlayCenter>
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            onDeactivate: () => setModal({ open: false }),
            clickOutsideDeactivates: true,
            escapeDeactivates: stopPropagation,
          }}
        >
          <Modal size="500" variant="Surface">
            <Box direction="Column" style={{ maxHeight: '80vh' }}>
              <Box
                justifyContent="SpaceBetween"
                alignItems="Center"
                style={{ padding: '16px 20px 0' }}
              >
                <Box />
                <IconButton
                  size="300"
                  variant="Surface"
                  radii="300"
                  onClick={() => setModal({ open: false })}
                >
                  <Icon src={Icons.Cross} />
                </IconButton>
              </Box>
              <Scroll size="0" hideTrack>
                <Box direction="Column" gap="300" style={{ padding: '0 20px 20px' }}>
                  <PremiumUpgradeContent variant="modal" />
                </Box>
              </Scroll>
            </Box>
          </Modal>
        </FocusTrap>
      </OverlayCenter>
    </Overlay>
  );
}
