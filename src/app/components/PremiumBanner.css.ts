import { style } from '@vanilla-extract/css';
import { config, toRem } from 'folds';

export const PremiumBanner = style({
  position: 'relative',
  padding: `${config.space.S300} ${config.space.S400}`,
  borderRadius: config.radii.R500,
  background:
    'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
  border: `1px solid rgba(59, 130, 246, 0.2)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: config.space.S300,
  overflow: 'hidden',
});

export const PremiumBannerGlow = style({
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.25), transparent 45%)',
  pointerEvents: 'none',
});

export const PremiumBannerBadge = style({
  width: toRem(40),
  height: toRem(40),
  borderRadius: toRem(12),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
});
