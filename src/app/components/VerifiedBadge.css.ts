import { createVar, keyframes, style } from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';
import { config } from 'folds';

const badgeSize = createVar();

const float = keyframes({
  '0%': {
    transform: 'translateY(0)',
  },
  '50%': {
    transform: 'translateY(-1px)',
  },
  '100%': {
    transform: 'translateY(0)',
  },
});

export const VerifiedBadge = recipe({
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
    animation: `${float} 2.8s ease-in-out infinite`,
    willChange: 'transform',
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

export type VerifiedBadgeVariants = RecipeVariants<typeof VerifiedBadge>;
