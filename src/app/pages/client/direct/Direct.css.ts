import { style } from '@vanilla-extract/css';
import { config, toRem } from 'folds';

export const DirectPageNav = style({
  width: toRem(320),
  minWidth: toRem(260),
  maxWidth: toRem(460),
  resize: 'horizontal',
  overflow: 'auto',
  flexShrink: 0,
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
