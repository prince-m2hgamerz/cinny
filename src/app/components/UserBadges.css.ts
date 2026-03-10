import { createVar, style } from '@vanilla-extract/css';
import { recipe, RecipeVariants } from '@vanilla-extract/recipes';
import { config } from 'folds';

const tagHeight = createVar();
const tagPaddingX = createVar();
const tagFontSize = createVar();

export const UserBadges = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: config.space.S100,
  flexWrap: 'wrap',
  verticalAlign: 'middle',
});

export const UserRoleTag = recipe({
  base: {
    vars: {
      [tagHeight]: '18px',
      [tagPaddingX]: config.space.S100,
      [tagFontSize]: '10px',
    },
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: tagHeight,
    paddingInline: tagPaddingX,
    borderRadius: '999px',
    background: 'linear-gradient(180deg, #ff6767 0%, #d93030 100%)',
    boxShadow: '0 2px 8px rgba(217,48,48,0.28)',
    color: '#fff',
    fontSize: tagFontSize,
    fontWeight: config.fontWeight.W700,
    letterSpacing: '0.06em',
    lineHeight: 1,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  variants: {
    size: {
      '100': {
        vars: {
          [tagHeight]: '14px',
          [tagPaddingX]: '4px',
          [tagFontSize]: '8px',
        },
      },
      '200': {
        vars: {
          [tagHeight]: '18px',
          [tagPaddingX]: config.space.S100,
          [tagFontSize]: '10px',
        },
      },
      '300': {
        vars: {
          [tagHeight]: '22px',
          [tagPaddingX]: '8px',
          [tagFontSize]: '11px',
        },
      },
    },
  },
  defaultVariants: {
    size: '200',
  },
});

export type UserRoleTagVariants = RecipeVariants<typeof UserRoleTag>;
