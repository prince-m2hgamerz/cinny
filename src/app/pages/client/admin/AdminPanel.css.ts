import { style } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

export const AdminPage = style({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  backgroundColor: color.Background.Container,
  backgroundImage:
    'radial-gradient(circle at top left, rgba(56, 189, 248, 0.08), transparent 45%), radial-gradient(circle at 80% 10%, rgba(168, 85, 247, 0.08), transparent 40%)',
});

export const AdminContent = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  flex: 1,
  paddingLeft: config.space.S400,
  paddingRight: config.space.S400,
  paddingBottom: config.space.S400,
  gap: config.space.S400,
  overflow: 'auto',
  maxWidth: toRem(1280),
  margin: '0 auto',
  width: '100%',
  '@media': {
    'screen and (max-width: 720px)': {
      paddingLeft: config.space.S200,
      paddingRight: config.space.S200,
      paddingTop: config.space.S200,
      paddingBottom: config.space.S300,
    },
  },
});

export const AdminLayout = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.9fr)',
  gap: config.space.S400,
  alignItems: 'start',
  minHeight: 0,
  padding: config.space.S200,
  borderRadius: config.radii.R500,
  backgroundColor: color.SurfaceVariant.Container,
  border: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
  '@media': {
    'screen and (max-width: 1200px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
    'screen and (max-width: 720px)': {
      padding: config.space.S150,
    },
  },
});

export const AdminMain = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  gridTemplateAreas: '"requests requests" "badges settings"',
  gap: config.space.S300,
  minWidth: 0,
  '@media': {
    'screen and (max-width: 1100px)': {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateAreas: '"requests" "badges" "settings"',
    },
  },
});

export const AdminAside = style({
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S300,
  minWidth: 0,
});

export const AdminColumnSticky = style({
  position: 'sticky',
  top: config.space.S200,
  alignSelf: 'start',
  '@media': {
    'screen and (max-width: 1200px)': {
      position: 'static',
    },
  },
});

export const AdminCardRequests = style({
  gridArea: 'requests',
});

export const AdminCardBadges = style({
  gridArea: 'badges',
});

export const AdminCardSettings = style({
  gridArea: 'settings',
});

export const AdminFrameWrap = style({
  flex: 1,
  minHeight: toRem(520),
  height: '70vh',
  maxHeight: toRem(900),
  borderRadius: config.radii.R400,
  overflow: 'hidden',
  backgroundColor: color.SurfaceVariant.Container,
  backgroundImage:
    'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(14, 116, 144, 0.08))',
  border: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
  boxShadow: `0 ${toRem(18)} ${toRem(36)} rgba(0, 0, 0, 0.22)`,
  position: 'relative',
  selectors: {
    '&:before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: config.radii.R400,
      border: `${toRem(1)} solid rgba(255, 255, 255, 0.06)`,
      pointerEvents: 'none',
    },
  },
  '@media': {
    'screen and (max-width: 720px)': {
      height: toRem(480),
      minHeight: toRem(360),
    },
  },
});

export const AdminFrame = style({
  width: '100%',
  height: '100%',
  border: 0,
  backgroundColor: color.SurfaceVariant.Container,
});

export const AdminToolsCard = style({
  padding: config.space.S300,
  boxShadow: `0 ${toRem(16)} ${toRem(30)} rgba(0, 0, 0, 0.2)`,
  border: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
  borderRadius: config.radii.R400,
  backdropFilter: 'blur(10px)',
  transition: 'transform 180ms ease, box-shadow 180ms ease',
  backgroundColor: color.Surface.Container,
  backgroundImage:
    'linear-gradient(160deg, rgba(255, 255, 255, 0.02), rgba(15, 23, 42, 0.06))',
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 ${toRem(20)} ${toRem(36)} rgba(0, 0, 0, 0.26)`,
    },
  },
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
  display: 'flex',
  flexDirection: 'column',
  gap: config.space.S150,
});

export const AdminListRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  padding: `${config.space.S150} ${config.space.S200}`,
  borderRadius: config.radii.R300,
  backgroundColor: color.Surface.Container,
  border: `${toRem(1)} solid ${color.SurfaceVariant.ContainerLine}`,
  flexWrap: 'wrap',
  transition: 'background-color 160ms ease, border-color 160ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: color.SurfaceVariant.Container,
      borderColor: color.SurfaceVariant.ContainerLine,
    },
  },
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
  boxShadow: `0 ${toRem(10)} ${toRem(24)} rgba(0, 0, 0, 0.2)`,
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 ${toRem(16)} ${toRem(30)} rgba(0, 0, 0, 0.26)`,
    },
  },
});

export const AdminRequestHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: config.space.S200,
});

export const AdminRequestInputs = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
  gap: config.space.S150,
  '@media': {
    'screen and (max-width: 1024px)': {
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    },
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
