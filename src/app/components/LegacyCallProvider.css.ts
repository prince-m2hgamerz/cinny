import { style } from '@vanilla-extract/css';
import { config, color, toRem } from 'folds';

export const CallOverlayCard = style({
  width: 'min(1040px, 96vw)',
  height: 'min(620px, 86vh)',
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  gap: config.space.S300,
  padding: config.space.S300,
  position: 'relative',
  overflow: 'hidden',
  borderRadius: config.radii.R500,
  background: `linear-gradient(145deg, ${color.Surface.Container} 0%, ${color.SurfaceVariant.Container} 100%)`,
  color: color.Surface.OnContainer,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: `0 ${toRem(24)} ${toRem(64)} rgba(0, 0, 0, 0.45)`,
  '@media': {
    'screen and (max-width: 900px)': {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: '100vw',
      height: '100dvh',
      padding: 0,
      gap: 0,
      borderRadius: 0,
      border: 'none',
      boxShadow: 'none',
      gridTemplateRows: '1fr',
      background: color.Surface.Container,
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
    'screen and (max-width: 900px)': {
      position: 'absolute',
      top: 'env(safe-area-inset-top)',
      left: 0,
      right: 0,
      zIndex: 2,
      alignItems: 'center',
      gap: config.space.S200,
      padding: `${config.space.S200} ${config.space.S250}`,
      background: `linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0) 100%)`,
      textShadow: `0 ${toRem(2)} ${toRem(6)} rgba(0, 0, 0, 0.5)`,
    },
    'screen and (max-width: 480px)': {
      gap: config.space.S150,
      padding: `${config.space.S150} ${config.space.S200}`,
    },
  },
});

export const HeaderMeta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S100,
  minWidth: 0,
});

export const HeaderTitle = style({
  '@media': {
    'screen and (max-width: 900px)': {
      color: '#fff',
    },
  },
});

export const HeaderSubtitle = style({
  '@media': {
    'screen and (max-width: 900px)': {
      color: 'rgba(255, 255, 255, 0.8)',
    },
  },
});

export const VideoStage = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: config.radii.R500,
  backgroundColor: color.SurfaceVariant.Container,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  minHeight: 0,
  '@media': {
    'screen and (max-width: 900px)': {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      borderRadius: 0,
      border: 'none',
      minHeight: '100%',
      height: '100%',
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
    'screen and (max-width: 900px)': {
      right: config.space.S200,
      bottom: `calc(env(safe-area-inset-bottom) + ${toRem(96)})`,
      borderRadius: config.radii.R300,
      width: `clamp(${toRem(96)}, 30vw, ${toRem(180)})`,
      height: `clamp(${toRem(56)}, 18vw, ${toRem(110)})`,
    },
    'screen and (max-width: 480px)': {
      right: config.space.S150,
      width: `clamp(${toRem(84)}, 32vw, ${toRem(150)})`,
      height: `clamp(${toRem(50)}, 20vw, ${toRem(96)})`,
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
    'screen and (max-width: 900px)': {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      padding: `${config.space.S200} ${config.space.S250} calc(max(env(safe-area-inset-bottom), 12px) + ${config.space.S100})`,
      background: `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%)`,
    },
    'screen and (max-width: 480px)': {
      padding: `${config.space.S150} ${config.space.S200} calc(max(env(safe-area-inset-bottom), 10px) + ${config.space.S100})`,
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
    'screen and (max-width: 900px)': {
      width: 'min(340px, 92vw)',
      justifyContent: 'center',
      padding: `${config.space.S200} ${config.space.S300}`,
      border: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    'screen and (max-width: 480px)': {
      width: 'min(290px, 92vw)',
      gap: config.space.S150,
      padding: `${config.space.S150} ${config.space.S250}`,
    },
  },
});
