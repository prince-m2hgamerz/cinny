import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const DirectNavItem = style({
  minHeight: toRem(72),
  borderRadius: config.radii.R400,
  border: `${config.borderWidth.B300} solid transparent`,
  backgroundColor: 'transparent',
  boxShadow: `inset 0 -1px 0 ${color.SurfaceVariant.ContainerLine}`,
  margin: `${config.space.S50} ${config.space.S200}`,
  transition: 'background-color 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
  '@media': {
    'screen and (min-width: 721px)': {
      minHeight: toRem(84),
      margin: `${config.space.S100} ${config.space.S300}`,
    },
    'screen and (max-width: 720px)': {
      minHeight: toRem(78),
      borderRadius: config.radii.R400,
      margin: `${config.space.S50} ${config.space.S150}`,
      backgroundColor: 'transparent',
      boxShadow: `inset 0 -1px 0 ${color.SurfaceVariant.ContainerLine}`,
    },
  },
  selectors: {
    '&[aria-selected=true]': {
      backgroundColor: color.SurfaceVariant.Container,
      borderColor: color.SurfaceVariant.ContainerLine,
      boxShadow: `inset ${toRem(3)} 0 0 ${color.Primary.Main}, inset 0 -1px 0 ${color.SurfaceVariant.ContainerLine}`,
    },
    '&:hover, &:focus-visible': {
      backgroundColor: color.SurfaceVariant.ContainerHover,
      borderColor: color.SurfaceVariant.ContainerLine,
    },
    '&[data-hover=true]': {
      backgroundColor: color.SurfaceVariant.ContainerHover,
      borderColor: color.SurfaceVariant.ContainerLine,
    },
  },
});

export const DirectNavContent = style({
  paddingTop: config.space.S200,
  paddingBottom: config.space.S200,
  paddingLeft: config.space.S300,
  paddingRight: config.space.S300,
  alignItems: 'stretch',
  '@media': {
    'screen and (max-width: 720px)': {
      paddingLeft: config.space.S300,
      paddingRight: config.space.S300,
    },
    'screen and (min-width: 721px)': {
      paddingLeft: config.space.S400,
      paddingRight: config.space.S400,
      paddingTop: config.space.S250,
      paddingBottom: config.space.S250,
    },
  },
});

export const DirectRow = style({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: `${toRem(52)} minmax(0, 1fr)`,
  gap: config.space.S200,
  alignItems: 'center',
  minWidth: 0,
  '@media': {
    'screen and (min-width: 721px)': {
      gridTemplateColumns: `${toRem(56)} minmax(0, 1fr)`,
      gap: config.space.S300,
    },
  },
});

export const DirectText = style({
  display: 'grid',
  gridTemplateRows: 'auto auto',
  gap: config.space.S100,
  minWidth: 0,
  '@media': {
    'screen and (min-width: 721px)': {
      gap: config.space.S200,
    },
  },
});

export const DirectTopRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: config.space.S150,
  alignItems: 'start',
  minWidth: 0,
  '@media': {
    'screen and (min-width: 721px)': {
      gap: config.space.S200,
    },
  },
});

export const DirectBottomRow = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: config.space.S150,
  alignItems: 'center',
  minWidth: 0,
  '@media': {
    'screen and (min-width: 721px)': {
      gap: config.space.S250,
    },
  },
});

export const DirectName = style({
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  columnGap: config.space.S100,
  rowGap: config.space.S50,
  minWidth: 0,
  '@media': {
    'screen and (max-width: 720px)': {
      flexWrap: 'nowrap',
      rowGap: 0,
      columnGap: config.space.S100,
    },
  },
});

export const DirectNameText = style({
  minWidth: 0,
  flex: '0 1 auto',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.25,
  fontWeight: config.fontWeight.W600,
  '@media': {
    'screen and (min-width: 721px)': {
      fontSize: toRem(15),
      letterSpacing: '0.005em',
    },
  },
});

export const DirectTime = style({
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(12),
  whiteSpace: 'nowrap',
  justifySelf: 'end',
  marginLeft: config.space.S100,
  opacity: 0.8,
  '@media': {
    'screen and (min-width: 721px)': {
      fontSize: toRem(12),
      letterSpacing: '0.01em',
    },
  },
});

export const DirectPreview = style({
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(13),
  lineHeight: 1.25,
  opacity: 0.68,
  '@media': {
    'screen and (min-width: 721px)': {
      fontSize: toRem(13),
    },
  },
});

export const DirectPreviewText = style({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '@media': {
    'screen and (min-width: 721px)': {
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      whiteSpace: 'normal',
      maxWidth: '100%',
    },
  },
});

export const DirectPreviewUnread = style({
  color: color.Surface.OnContainer,
  fontWeight: config.fontWeight.W600,
});

export const DirectTyping = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S100,
  color: color.Primary.Main,
  fontSize: toRem(13),
});

export const DirectMeta = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: config.space.S100,
  flexShrink: 0,
});
