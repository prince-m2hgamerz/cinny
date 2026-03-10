import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const DirectNavItem = style({
  minHeight: toRem(68),
  borderRadius: 0,
  border: 'none',
  boxShadow: `inset 0 -1px 0 ${color.SurfaceVariant.ContainerLine}`,
  backgroundColor: 'transparent',
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
  paddingTop: config.space.S150,
  paddingBottom: config.space.S150,
  paddingLeft: config.space.S250,
  paddingRight: config.space.S250,
  alignItems: 'stretch',
});

export const DirectRow = style({
  width: '100%',
  display: 'grid',
  gridTemplateColumns: `${toRem(44)} 1fr`,
  gap: config.space.S300,
  alignItems: 'center',
  minWidth: 0,
});

export const DirectText = style({
  display: 'grid',
  gridTemplateRows: 'auto auto',
  gap: config.space.S50,
  minWidth: 0,
});

export const DirectTopRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: config.space.S200,
  alignItems: 'start',
  minWidth: 0,
});

export const DirectBottomRow = style({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: config.space.S200,
  alignItems: 'center',
  minWidth: 0,
});

export const DirectName = style({
  display: 'flex',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: config.space.S100,
  minWidth: 0,
});

export const DirectNameText = style({
  minWidth: 0,
  flex: 1,
  whiteSpace: 'normal',
  overflow: 'visible',
  textOverflow: 'clip',
  lineHeight: 1.2,
  '@media': {
    'screen and (max-width: 720px)': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
});

export const DirectTime = style({
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(12),
  whiteSpace: 'nowrap',
});

export const DirectPreview = style({
  color: color.SurfaceVariant.OnContainer,
  fontSize: toRem(13),
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
