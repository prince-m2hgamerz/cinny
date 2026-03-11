import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const DirectNavItem = style({
  minHeight: toRem(72),
  borderRadius: 0,
  border: 'none',
  boxShadow: `inset 0 -1px 0 ${color.SurfaceVariant.ContainerLine}`,
  backgroundColor: 'transparent',
  '@media': {
    'screen and (min-width: 721px)': {
      minHeight: toRem(88),
    },
  },
  selectors: {
    '&[aria-selected=true]': {
      backgroundColor: color.SurfaceVariant.Container,
      boxShadow: `inset ${toRem(3)} 0 0 ${color.Primary.Main}, inset 0 -1px 0 ${color.SurfaceVariant.ContainerLine}`,
    },
    '&:hover, &:focus-visible': {
      backgroundColor: color.SurfaceVariant.ContainerHover,
    },
    '&[data-hover=true]': {
      backgroundColor: color.SurfaceVariant.ContainerHover,
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
      paddingLeft: config.space.S250,
      paddingRight: config.space.S250,
    },
    'screen and (min-width: 721px)': {
      paddingLeft: config.space.S400,
      paddingRight: config.space.S400,
    },
  },
});

export const DirectRow = style({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: `${toRem(48)} minmax(0, 1fr)`,
  gap: config.space.S200,
  alignItems: 'center',
  minWidth: 0,
  '@media': {
    'screen and (min-width: 721px)': {
      gridTemplateColumns: `${toRem(52)} minmax(0, 1fr)`,
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
  lineHeight: 1.2,
  '@media': {
    'screen and (min-width: 721px)': {
      fontSize: toRem(14),
      letterSpacing: '0.01em',
    },
  },
});

export const DirectTime = style({
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(12),
  whiteSpace: 'nowrap',
  justifySelf: 'end',
  marginLeft: config.space.S100,
  '@media': {
    'screen and (min-width: 721px)': {
      fontSize: toRem(11.5),
      letterSpacing: '0.02em',
    },
  },
});

export const DirectPreview = style({
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(13),
  lineHeight: 1.25,
  '@media': {
    'screen and (min-width: 721px)': {
      fontSize: toRem(12.5),
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
