import { style } from '@vanilla-extract/css';
import { config, color, toRem } from 'folds';

export const CallOverlayCard = style({
  width: 'min(1040px, 96vw)',
  height: 'min(620px, 86vh)',
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  gap: config.space.S300,
  padding: config.space.S300,
  borderRadius: config.radii.R500,
  background: `linear-gradient(145deg, ${color.Surface.Container} 0%, ${color.SurfaceVariant.Container} 100%)`,
  color: color.Surface.OnContainer,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: `0 ${toRem(24)} ${toRem(64)} rgba(0, 0, 0, 0.45)`,
  '@media': {
    'screen and (max-width: 720px)': {
      width: '100vw',
      height: '100vh',
      padding: `max(${config.space.S200}, env(safe-area-inset-top)) ${config.space.S200} max(${config.space.S200}, env(safe-area-inset-bottom))`,
      gap: config.space.S200,
      borderRadius: 0,
      border: 'none',
      boxShadow: 'none',
      gridTemplateRows: 'auto 1fr auto',
    },
    'screen and (max-width: 480px)': {
      padding: `max(${config.space.S100}, env(safe-area-inset-top)) ${config.space.S150} max(${config.space.S150}, env(safe-area-inset-bottom))`,
      gap: config.space.S150,
    },
    'screen and (max-height: 640px)': {
      height: '100dvh',
      padding: `max(${config.space.S100}, env(safe-area-inset-top)) ${config.space.S150} max(${config.space.S150}, env(safe-area-inset-bottom))`,
      gap: config.space.S150,
    },
    'screen and (orientation: landscape) and (max-height: 520px)': {
      gridTemplateRows: 'auto 1fr auto',
    },
  },
});

export const HeaderRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: config.space.S300,
  flexWrap: 'wrap',
  '@media': {
    'screen and (max-width: 720px)': {
      alignItems: 'flex-start',
      gap: config.space.S200,
    },
    'screen and (max-width: 480px)': {
      gap: config.space.S150,
    },
  },
});

export const HeaderMeta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S100,
  minWidth: 0,
});

export const VideoStage = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: config.radii.R500,
  backgroundColor: color.SurfaceVariant.Container,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  minHeight: 0,
  '@media': {
    'screen and (max-width: 720px)': {
      borderRadius: config.radii.R400,
      minHeight: '42vh',
      maxHeight: '100%',
    },
    'screen and (max-width: 480px)': {
      minHeight: '40vh',
    },
    'screen and (max-height: 640px)': {
      minHeight: '38vh',
    },
    'screen and (orientation: landscape) and (max-height: 520px)': {
      minHeight: '52vh',
    },
  },
});

export const RemoteVideo = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const NoVideo = style({
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: config.space.S200,
  color: color.SurfaceVariant.OnContainer,
});

export const LocalPreview = style({
  position: 'absolute',
  right: config.space.S200,
  bottom: config.space.S200,
  width: `clamp(${toRem(120)}, 20vw, ${toRem(200)})`,
  height: `clamp(${toRem(72)}, 12vw, ${toRem(120)})`,
  borderRadius: config.radii.R400,
  objectFit: 'cover',
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  backgroundColor: color.Surface.Container,
  boxShadow: `0 ${toRem(8)} ${toRem(18)} rgba(0, 0, 0, 0.35)`,
  '@media': {
    'screen and (max-width: 720px)': {
      right: config.space.S100,
      bottom: config.space.S100,
      borderRadius: config.radii.R300,
      width: `clamp(${toRem(96)}, 28vw, ${toRem(160)})`,
      height: `clamp(${toRem(56)}, 18vw, ${toRem(96)})`,
    },
    'screen and (max-width: 480px)': {
      width: `clamp(${toRem(84)}, 30vw, ${toRem(140)})`,
      height: `clamp(${toRem(50)}, 20vw, ${toRem(86)})`,
    },
    'screen and (orientation: landscape) and (max-height: 520px)': {
      width: `clamp(${toRem(90)}, 22vw, ${toRem(150)})`,
      height: `clamp(${toRem(52)}, 12vw, ${toRem(90)})`,
    },
  },
});

export const FooterRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: config.space.S300,
  paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
  '@media': {
    'screen and (max-width: 720px)': {
      paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
    },
    'screen and (max-width: 480px)': {
      paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
    },
  },
});

export const ControlCluster = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  padding: `${config.space.S100} ${config.space.S200}`,
  borderRadius: config.radii.Pill,
  backgroundColor: color.SurfaceVariant.Container,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: `0 ${toRem(10)} ${toRem(24)} rgba(0, 0, 0, 0.25)`,
  '@media': {
    'screen and (max-width: 720px)': {
      width: 'min(320px, 92vw)',
      justifyContent: 'center',
      padding: `${config.space.S200} ${config.space.S300}`,
    },
    'screen and (max-width: 480px)': {
      width: 'min(300px, 94vw)',
      gap: config.space.S150,
      padding: `${config.space.S150} ${config.space.S250}`,
    },
    'screen and (orientation: landscape) and (max-height: 520px)': {
      width: 'min(360px, 90vw)',
      padding: `${config.space.S150} ${config.space.S300}`,
    },
  },
});
