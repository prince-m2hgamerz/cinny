import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const WelcomePage = style({
  minHeight: '100%',
});

export const WelcomeHero = style({
  paddingTop: config.space.S300,
});

export const WelcomeActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: config.space.S200,
  justifyContent: 'center',
  marginTop: config.space.S300,
});

export const WelcomeGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: config.space.S300,
  marginTop: config.space.S400,
});

export const WelcomeCard = style({
  padding: config.space.S300,
  borderRadius: config.radii.R400,
  backgroundColor: color.SurfaceVariant.Container,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: `0 ${toRem(12)} ${toRem(24)} rgba(0, 0, 0, 0.08)`,
});
