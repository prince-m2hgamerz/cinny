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
      padding: config.space.S200,
      gap: config.space.S200,
      borderRadius: 0,
      border: 'none',
      boxShadow: 'none',
    },
  },
});

export const HeaderRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: config.space.S300,
  flexWrap: 'wrap',
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
    },
  },
});

export const FooterRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: config.space.S300,
  paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
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
});
