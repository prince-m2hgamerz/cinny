import { style } from '@vanilla-extract/css';
import { config, color, toRem } from 'folds';

export const CallOverlayCard = style({
  width: 'min(980px, 94vw)',
  height: 'min(560px, 82vh)',
  display: 'grid',
  gridTemplateRows: 'auto 1fr auto',
  gap: config.space.S300,
  padding: config.space.S300,
  borderRadius: config.radii.R500,
  backgroundColor: color.Surface.Container,
  color: color.Surface.OnContainer,
  border: `${config.borderWidth.B300} solid ${color.Surface.ContainerLine}`,
  boxShadow: `0 ${toRem(24)} ${toRem(64)} rgba(0, 0, 0, 0.45)`,
});

export const HeaderRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: config.space.S300,
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
  width: toRem(180),
  height: toRem(108),
  borderRadius: config.radii.R400,
  objectFit: 'cover',
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
  backgroundColor: color.Surface.Container,
  boxShadow: `0 ${toRem(8)} ${toRem(18)} rgba(0, 0, 0, 0.35)`,
});

export const FooterRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: config.space.S300,
});

export const ControlCluster = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  padding: `${config.space.S100} ${config.space.S200}`,
  borderRadius: config.radii.Pill,
  backgroundColor: color.SurfaceVariant.Container,
  border: `${config.borderWidth.B300} solid ${color.SurfaceVariant.ContainerLine}`,
});
