// src/theme.js
// Central MUI theme: typography, palette, and component defaults.

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#14532d', // deep green — nods to the environmental subject matter
      light: '#4ade80',
      dark: '#052e16',
    },
    secondary: {
      main: '#0e7490',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h5: {
      fontFamily: "'Source Serif 4', Georgia, serif",
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    subtitle2: {
      fontWeight: 600,
    },
    overline: {
      fontWeight: 700,
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
  },
});

export default theme;
