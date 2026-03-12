import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const AdminPage = style({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
});

export const AdminContent = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  flex: 1,
  paddingRight: config.space.S400,
  gap: config.space.S300,
  '@media': {
    'screen and (max-width: 720px)': {
      paddingLeft: config.space.S200,
      paddingRight: config.space.S200,
      paddingTop: config.space.S200,
    },
  },
});

export const AdminGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  gap: config.space.S300,
  '@media': {
    'screen and (max-width: 1100px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
});

export const AdminFrameWrap = style({
  flex: 1,
  minHeight: 0,
  borderRadius: config.radii.R400,
  overflow: 'hidden',
  backgroundColor: color.SurfaceVariant.Container,
  border: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: `0 ${toRem(12)} ${toRem(32)} rgba(0, 0, 0, 0.2)`,
});

export const AdminFrame = style({
  width: '100%',
  height: '100%',
  border: 0,
  backgroundColor: color.SurfaceVariant.Container,
});

export const AdminToolsCard = style({
  padding: config.space.S300,
});

export const AdminForm = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
  gap: config.space.S200,
  alignItems: 'center',
  '@media': {
    'screen and (max-width: 900px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
});

export const AdminSwitch = style({
  paddingLeft: config.space.S100,
});

export const AdminList = style({
  borderTop: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
  paddingTop: config.space.S200,
});

export const AdminListRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  padding: `${config.space.S100} 0`,
  borderBottom: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
  flexWrap: 'wrap',
});

export const AdminRequestList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S200,
});

export const AdminRequestCard = style({
  padding: config.space.S200,
  borderRadius: config.radii.R400,
  backgroundColor: color.SurfaceVariant.Container,
  border: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S200,
});

export const AdminRequestHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: config.space.S200,
});

export const AdminRequestInputs = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  gap: config.space.S150,
  '@media': {
    'screen and (max-width: 720px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
});

export const AdminRequestActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: config.space.S100,
});

export const AdminStatus = style({
  padding: `0 ${config.space.S100}`,
  borderRadius: config.radii.R400,
  fontSize: toRem(11),
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

export const AdminStatusPending = style({
  backgroundColor: color.SurfaceVariant.Container,
  color: color.SurfaceVariant.OnContainer,
  border: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
});

export const AdminStatusPayment = style({
  backgroundColor: color.Warning.Container,
  color: color.Warning.OnContainer,
});

export const AdminStatusApproved = style({
  backgroundColor: color.Success.Container,
  color: color.Success.OnContainer,
});

export const AdminStatusRejected = style({
  backgroundColor: color.Critical.Container,
  color: color.Critical.OnContainer,
});

export const AdminPlanPill = style({
  padding: `0 ${config.space.S100}`,
  borderRadius: config.radii.R400,
  fontSize: toRem(11),
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  backgroundColor: color.Primary.Container,
  color: color.Primary.OnContainer,
});
