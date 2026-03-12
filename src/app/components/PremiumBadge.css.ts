import { createVar, keyframes, style } from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';
import { config } from 'folds';

const badgeSize = createVar();

const shimmer = keyframes({
  '0%': {
    transform: 'translateY(0) scale(1)',
    filter: 'drop-shadow(0 0 0 rgba(59, 130, 246, 0.3))',
  },
  '50%': {
    transform: 'translateY(-1px) scale(1.02)',
    filter: 'drop-shadow(0 4px 10px rgba(59, 130, 246, 0.4))',
  },
  '100%': {
    transform: 'translateY(0) scale(1)',
    filter: 'drop-shadow(0 0 0 rgba(59, 130, 246, 0.3))',
  },
});

export const PremiumBadge = recipe({
  base: {
    vars: {
      [badgeSize]: config.size.X200,
    },
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    width: badgeSize,
    height: badgeSize,
    minWidth: badgeSize,
    minHeight: badgeSize,
    flexShrink: 0,
    transformOrigin: '50% 50%',
    animation: `${shimmer} 3.2s ease-in-out infinite`,
    willChange: 'transform, filter',
  },
  variants: {
    size: {
      '100': {
        vars: {
          [badgeSize]: config.size.X100,
        },
      },
      '200': {
        vars: {
          [badgeSize]: config.size.X200,
        },
      },
      '300': {
        vars: {
          [badgeSize]: config.size.X300,
        },
      },
    },
  },
  defaultVariants: {
    size: '200',
  },
});

export const Icon = style({
  width: '100%',
  height: '100%',
  display: 'block',
});

export type PremiumBadgeVariants = RecipeVariants<typeof PremiumBadge>;
