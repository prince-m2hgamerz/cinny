import { createTheme } from '@vanilla-extract/css';
import { config } from 'folds';

export const onLightFontWeight = createTheme(config.fontWeight, {
  W100: '100',
  W200: '200',
  W300: '300',
  W400: '400',
  W500: '500',
  W600: '600',
  W700: '700',
  W800: '800',
  W900: '900',
});

export const onDarkFontWeight = createTheme(config.fontWeight, {
  W100: '100',
  W200: '200',
  W300: '300',
  W400: '400',
  W500: '500',
  W600: '600',
  W700: '700',
  W800: '800',
  W900: '900',
});

export const telegramFont = createTheme(config.font, {
  Inter:
    "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'InterVariable', 'Segoe UI', Arial, sans-serif",
});

export const telegramRadii = createTheme(config.radii, {
  R0: '0',
  R300: '12px',
  R400: '16px',
  R500: '20px',
  Round: '999px',
  Pill: '999px',
});

export const telegramShadow = createTheme(config.shadow, {
  E100: '0 1px 2px rgba(15, 23, 42, 0.08)',
  E200: '0 4px 12px rgba(15, 23, 42, 0.12)',
  E300: '0 10px 24px rgba(15, 23, 42, 0.14)',
  E400: '0 16px 36px rgba(15, 23, 42, 0.18)',
});
