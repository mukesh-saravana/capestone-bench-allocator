import { createTheme } from '@mui/material/styles';

// Design tokens aligned with docs/ui-ux-design.md
const tokens = {
  colors: {
    primary: '#1976D2',
    secondary: '#DC004E',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    neutral: '#ECEFF1',
    neutralDark: '#F5F5F5',
    text: '#212121',
    textSecondary: '#424242',
    textTertiary: '#757575',
    border: '#E0E0E0',
    background: '#FAFAFA',
  },
  shadows: {
    hover: '0 2px 8px rgba(0,0,0,0.1)',
    raised: '0 4px 12px rgba(0,0,0,0.15)',
    modal: '0 8px 24px rgba(0,0,0,0.2)',
  },
  borderRadius: {
    sm: 4,
    md: 8,
  },
};

export { tokens };

const theme = createTheme({
  palette: {
    primary: {
      main: tokens.colors.primary,
    },
    secondary: {
      main: tokens.colors.secondary,
    },
    success: {
      main: tokens.colors.success,
    },
    warning: {
      main: tokens.colors.warning,
    },
    error: {
      main: tokens.colors.danger,
    },
    background: {
      default: tokens.colors.background,
      paper: '#FFFFFF',
    },
    text: {
      primary: tokens.colors.text,
      secondary: tokens.colors.textSecondary,
    },
    divider: tokens.colors.border,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: '2.5rem', color: tokens.colors.text },
    h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: '2rem', color: tokens.colors.text },
    h3: { fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.625rem', color: tokens.colors.textSecondary },
    body1: { fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.25rem', color: tokens.colors.textSecondary },
    body2: { fontSize: '0.75rem', fontWeight: 400, lineHeight: '1.125rem', color: tokens.colors.textTertiary },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' as const },
  },
  shape: {
    borderRadius: tokens.borderRadius.md,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.sm,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.borderRadius.md,
          boxShadow: 'none',
          '&:hover': { boxShadow: tokens.shadows.hover },
          transition: 'box-shadow 200ms ease-in-out',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 100 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' as const },
    },
  },
});

export default theme;
