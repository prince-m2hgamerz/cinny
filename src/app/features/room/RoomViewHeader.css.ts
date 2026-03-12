import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const RoomHeader = style({
  minHeight: toRem(60),
  paddingTop: config.space.S150,
  paddingBottom: config.space.S150,
  backdropFilter: 'blur(8px)',
  backgroundColor: color.Background.Container,
  borderBottom: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: 'none',
});

export const HeaderTopic = style({
  ':hover': {
    cursor: 'pointer',
    opacity: config.opacity.P500,
    textDecoration: 'underline',
  },
});
