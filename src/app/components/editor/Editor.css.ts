import { style } from '@vanilla-extract/css';
import { color, config, DefaultReset, toRem } from 'folds';

export const Editor = style([
  DefaultReset,
  {
    backgroundColor: color.Surface.Container,
    color: color.SurfaceVariant.OnContainer,
    boxShadow: `inset 0 0 0 ${config.borderWidth.B300} ${color.SurfaceVariant.ContainerLine}`,
    borderRadius: config.radii.R500,
    overflow: 'hidden',
    selectors: {
      '&:focus-within': {
        boxShadow: `0 0 0 ${config.borderWidth.B400} ${color.Primary.Main}`,
      },
    },
  },
]);

export const EditorOptions = style([
  DefaultReset,
  {
    padding: config.space.S150,
  },
]);

export const EditorTextareaScroll = style({});

export const EditorTextarea = style([
  DefaultReset,
  {
    flexGrow: 1,
    height: '100%',
    padding: `${toRem(10)} ${toRem(8)}`,
    selectors: {
      [`${EditorTextareaScroll}:first-child &`]: {
        paddingLeft: toRem(14),
      },
      [`${EditorTextareaScroll}:last-child &`]: {
        paddingRight: toRem(14),
      },
      '&:focus': {
        outline: 'none',
      },
    },
  },
]);

export const EditorPlaceholderContainer = style([
  DefaultReset,
  {
    opacity: config.opacity.Placeholder,
    pointerEvents: 'none',
    userSelect: 'none',
  },
]);

export const EditorPlaceholderTextVisual = style([
  DefaultReset,
  {
    display: 'block',
    paddingTop: toRem(11),
    paddingLeft: toRem(1),
  },
]);

export const EditorToolbarBase = style({
  padding: `0 ${config.borderWidth.B300}`,
});

export const EditorToolbar = style({
  padding: config.space.S100,
});

export const MarkdownBtnBox = style({
  paddingRight: config.space.S100,
});
