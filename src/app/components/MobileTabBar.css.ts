import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const MobileTabBar = style({
  position: 'fixed',
  left: toRem(12),
  right: toRem(12),
  bottom: toRem(12),
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S100,
  padding: `${toRem(10)} ${toRem(12)}`,
  paddingBottom: `max(${toRem(10)}, env(safe-area-inset-bottom))`,
  minHeight: toRem(62),
  background: 'rgba(255, 255, 255, 0.35)',
  border: `1px solid rgba(15, 23, 42, 0.08)`,
  borderRadius: toRem(24),
  boxShadow: `0 ${toRem(10)} ${toRem(24)} rgba(15, 23, 42, 0.18)`,
  backdropFilter: 'blur(24px) saturate(1.4)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  isolation: 'isolate',
  zIndex: 30,
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '&::before': {
      content: '',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 60%)',
      pointerEvents: 'none',
    },
    '.dark-theme &': {
      background: 'rgba(12, 14, 18, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: `0 ${toRem(12)} ${toRem(28)} rgba(0, 0, 0, 0.5)`,
    },
    '.dark-theme &::before': {
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 65%)',
    },
    '.butter-theme &': {
      background: 'rgba(18, 16, 12, 0.62)',
      border: '1px solid rgba(255, 255, 255, 0.07)',
      boxShadow: `0 ${toRem(12)} ${toRem(28)} rgba(0, 0, 0, 0.45)`,
    },
    '.butter-theme &::before': {
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 65%)',
    },
  },
  '@media': {
    'screen and (max-width: 420px)': {
      left: toRem(8),
      right: toRem(8),
      bottom: toRem(8),
      gap: config.space.S50,
      padding: `${toRem(8)} ${toRem(10)}`,
      borderRadius: toRem(20),
    },
    'screen and (max-width: 360px)': {
      left: toRem(6),
      right: toRem(6),
      bottom: toRem(6),
      padding: `${toRem(6)} ${toRem(8)}`,
      borderRadius: toRem(18),
    },
  },
});

export const MobileTabItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: toRem(4),
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(10),
  lineHeight: toRem(12),
  fontWeight: config.fontWeight.W600,
  opacity: 0.74,
  cursor: 'pointer',
  minWidth: toRem(54),
  flex: '0 0 auto',
  padding: `${toRem(6)} ${toRem(8)}`,
  borderRadius: toRem(14),
  transition: 'background-color 160ms ease, color 160ms ease, opacity 160ms ease, transform 160ms ease',
  selectors: {
    'button&': {
      border: 'none',
      background: 'transparent',
    },
    '&:hover': {
      backgroundColor: 'rgba(42, 125, 225, 0.12)',
      opacity: 1,
    },
    '.dark-theme &:hover': {
      backgroundColor: 'rgba(42, 125, 225, 0.2)',
    },
    '.butter-theme &:hover': {
      backgroundColor: 'rgba(42, 125, 225, 0.18)',
    },
  },
  '@media': {
    'screen and (max-width: 420px)': {
      minWidth: toRem(48),
      fontSize: toRem(9),
    },
    'screen and (max-width: 360px)': {
      minWidth: toRem(44),
      fontSize: toRem(8.5),
    },
  },
});

export const MobileTabItemActive = style({
  color: color.Primary.Main,
  opacity: 1,
  backgroundColor: 'rgba(42, 125, 225, 0.22)',
  boxShadow: 'inset 0 0 0 1px rgba(42, 125, 225, 0.32)',
  transform: 'translateY(-1px)',
  selectors: {
    '.dark-theme &': {
      backgroundColor: 'rgba(42, 125, 225, 0.3)',
    },
    '.butter-theme &': {
      backgroundColor: 'rgba(42, 125, 225, 0.26)',
    },
  },
});
