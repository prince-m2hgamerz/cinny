import { keyframes, style, globalStyle } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const PremiumHero = style({
  position: 'relative',
  padding: `${config.space.S400} ${config.space.S500}`,
  borderRadius: config.radii.R500,
  background:
    'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(79, 124, 255, 0.85) 40%, rgba(167, 139, 250, 0.9) 100%)',
  color: '#fff',
  overflow: 'hidden',
  boxShadow: `0 ${toRem(18)} ${toRem(40)} rgba(37, 99, 235, 0.35)`,
  '@media': {
    'screen and (max-width: 720px)': {
      padding: `${config.space.S400} ${config.space.S400}`,
    },
  },
});

export const PremiumHeroGlow = style({
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 85% 35%, rgba(255,255,255,0.25), transparent 50%)',
  opacity: 0.9,
  pointerEvents: 'none',
});

export const PremiumHeroBadge = style({
  width: toRem(52),
  height: toRem(52),
  borderRadius: toRem(16),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.25)',
});

export const PremiumHeroTitle = style({
  fontSize: toRem(24),
  fontWeight: config.fontWeight.W700,
  '@media': {
    'screen and (max-width: 720px)': {
      fontSize: toRem(20),
    },
  },
});

export const PremiumHeroSub = style({
  fontSize: toRem(14),
  opacity: 0.9,
});

export const PremiumPlans = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: config.space.S300,
  '@media': {
    'screen and (max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const PremiumPlanCard = style({
  padding: config.space.S400,
  borderRadius: config.radii.R500,
  backgroundColor: color.Surface.Container,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: config.shadow.E100,
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S200,
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  '@media': {
    'screen and (max-width: 720px)': {
      padding: config.space.S300,
    },
  },
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: config.shadow.E200,
    },
  },
});

export const PremiumPlanHighlight = style({
  borderColor: color.Primary.Container,
  boxShadow: `0 ${toRem(12)} ${toRem(30)} rgba(59, 130, 246, 0.18)`,
});

export const PremiumDiscount = style({
  alignSelf: 'flex-start',
  padding: `${toRem(2)} ${toRem(8)}`,
  borderRadius: config.radii.R500,
  backgroundColor: color.Primary.Container,
  color: color.Primary.OnContainer,
  fontSize: toRem(11),
  fontWeight: config.fontWeight.W600,
});

export const PremiumFeatureGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: config.space.S300,
  '@media': {
    'screen and (max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const PremiumFeatureCard = style({
  padding: config.space.S300,
  borderRadius: config.radii.R400,
  backgroundColor: color.Surface.Container,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  display: 'flex',
  gap: config.space.S200,
  alignItems: 'flex-start',
  minHeight: toRem(84),
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  '@media': {
    'screen and (max-width: 720px)': {
      padding: config.space.S250,
    },
  },
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: config.shadow.E100,
    },
  },
});

const lockPulse = keyframes({
  '0%': { opacity: 0.6 },
  '50%': { opacity: 1 },
  '100%': { opacity: 0.6 },
});

export const PremiumLocked = style({
  opacity: 0.7,
  cursor: 'pointer',
});

globalStyle(`${PremiumLocked} svg`, {
  animation: `${lockPulse} 1.8s ease-in-out infinite`,
});

export const PremiumMetaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  flexWrap: 'wrap',
});

export const PremiumUpgradeActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  flexWrap: 'wrap',
});

export const PremiumContent = style({
  width: '100%',
  maxWidth: toRem(980),
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S500,
});
