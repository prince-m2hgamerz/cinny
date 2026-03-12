import { style, globalStyle } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const DirectPageNav = style({
  width: toRem(320),
  minWidth: toRem(260),
  maxWidth: toRem(460),
  resize: 'horizontal',
  overflow: 'auto',
  flexShrink: 0,
  position: 'relative',
  '@media': {
    'screen and (max-width: 720px)': {
      width: '100%',
      minWidth: 'unset',
      maxWidth: 'unset',
      resize: 'none',
      overflow: 'hidden',
    },
  },
});

export const DirectPageHeader = style({
  paddingTop: config.space.S100,
  paddingBottom: config.space.S100,
});

export const DirectSearchWrap = style({
  padding: `${config.space.S200} ${config.space.S300} ${config.space.S100}`,
  borderBottom: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  backgroundColor: color.Surface.Container,
  position: 'sticky',
  top: 0,
  zIndex: 2,
  '@media': {
    'screen and (min-width: 721px)': {
      padding: `${config.space.S250} ${config.space.S400} ${config.space.S200}`,
    },
    'screen and (max-width: 720px)': {
      padding: `${config.space.S200} ${config.space.S200} ${config.space.S150}`,
    },
  },
});

export const DirectSearchInput = style({
  width: '100%',
  backgroundColor: color.SurfaceVariant.Container,
  boxShadow: `inset 0 0 0 ${config.borderWidth.B300} ${color.SurfaceVariant.ContainerLine}`,
  transition: 'box-shadow 120ms ease, background-color 120ms ease',
  selectors: {
    '&:focus-within': {
      backgroundColor: color.Surface.Container,
      boxShadow: `inset 0 0 0 ${config.borderWidth.B400} ${color.Primary.Main}`,
    },
  },
});

globalStyle(`${DirectSearchInput} input`, {
  fontSize: toRem(13.5),
  letterSpacing: '0.005em',
});

export const DirectSearchIcon = style({
  opacity: 0.7,
});

export const DirectMobileHeader = style({
  padding: `${config.space.S200} ${config.space.S200} 0`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const DirectTitle = style({
  fontSize: toRem(20),
  fontWeight: config.fontWeight.W600,
  letterSpacing: '0.01em',
});

export const DirectFilters = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S100,
  padding: `0 ${config.space.S200} ${config.space.S200}`,
  overflowX: 'auto',
  scrollbarWidth: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const DirectFilterButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: config.space.S100,
  padding: `${config.space.S100} ${config.space.S200}`,
  borderRadius: config.radii.R500,
  backgroundColor: color.SurfaceVariant.Container,
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(12),
  fontWeight: config.fontWeight.W600,
  border: `${config.borderWidth.B300} solid transparent`,
  cursor: 'pointer',
  transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease',
  selectors: {
    'button&': {
      border: `${config.borderWidth.B300} solid transparent`,
      outline: 'none',
    },
    '&:hover': {
      backgroundColor: color.SurfaceVariant.ContainerHover,
    },
  },
});

export const DirectFilterButtonActive = style({
  backgroundColor: color.Primary.Container,
  color: color.Primary.OnContainer,
  borderColor: color.Primary.Container,
});

export const DirectArchivedCard = style({
  margin: 0,
  padding: `${config.space.S200} ${config.space.S300}`,
  borderRadius: 0,
  backgroundColor: color.Surface.Container,
  borderBottom: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: 'none',
});

export const DirectArchivedRow = style({
  display: 'grid',
  gridTemplateColumns: `${toRem(44)} minmax(0, 1fr) auto`,
  gap: config.space.S200,
  alignItems: 'center',
});

export const DirectArchivedTitle = style({
  fontWeight: config.fontWeight.W600,
  fontSize: toRem(13.5),
});

export const DirectArchivedSubtitle = style({
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(12),
  opacity: 0.8,
});

export const DirectFab = style({
  position: 'fixed',
  right: config.space.S300,
  bottom: `calc(${toRem(96)} + env(safe-area-inset-bottom))`,
  width: toRem(52),
  height: toRem(52),
  borderRadius: config.radii.R500,
  boxShadow: `0 ${toRem(10)} ${toRem(24)} rgba(0, 0, 0, 0.2)`,
  zIndex: 5,
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
    },
  },
});
