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
      [tagHeight]: '16px',
      [tagPaddingX]: '5px',
      [tagFontSize]: '9px',
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
          [tagHeight]: '12px',
          [tagPaddingX]: '3px',
          [tagFontSize]: '7px',
        },
      },
      '200': {
        vars: {
          [tagHeight]: '16px',
          [tagPaddingX]: '5px',
          [tagFontSize]: '9px',
        },
      },
      '300': {
        vars: {
          [tagHeight]: '20px',
          [tagPaddingX]: '7px',
          [tagFontSize]: '10px',
        },
      },
    },
    tone: {
      critical: {
        background: 'linear-gradient(180deg, #ff6767 0%, #d93030 100%)',
        boxShadow: '0 2px 8px rgba(217,48,48,0.28)',
      },
      blue: {
        background: 'linear-gradient(180deg, #5ba9ff 0%, #267dff 100%)',
        boxShadow: '0 2px 8px rgba(38,125,255,0.24)',
      },
      green: {
        background: 'linear-gradient(180deg, #47d18c 0%, #1f9d62 100%)',
        boxShadow: '0 2px 8px rgba(31,157,98,0.24)',
      },
      gold: {
        background: 'linear-gradient(180deg, #f7c65c 0%, #e39b12 100%)',
        boxShadow: '0 2px 8px rgba(227,155,18,0.24)',
      },
      gray: {
        background: 'linear-gradient(180deg, #8b95a7 0%, #616d82 100%)',
        boxShadow: '0 2px 8px rgba(97,109,130,0.24)',
      },
    },
  },
  defaultVariants: {
    size: '200',
    tone: 'critical',
  },
});

export type UserRoleTagVariants = RecipeVariants<typeof UserRoleTag>;
