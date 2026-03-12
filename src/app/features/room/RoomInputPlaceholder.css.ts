import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const RoomInputPlaceholder = style({
  minHeight: toRem(48),
  backgroundColor: color.Surface.Container,
  color: color.SurfaceVariant.OnContainer,
  boxShadow: `inset 0 0 0 ${config.borderWidth.B300} ${color.SurfaceVariant.ContainerLine}`,
  borderRadius: config.radii.R500,
  selectors: {
    '&:focus-within': {
      boxShadow: `0 0 0 ${config.borderWidth.B400} ${color.Primary.Main}`,
    },
  },
});
