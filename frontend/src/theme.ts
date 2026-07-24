import { createTheme } from '@mui/material/styles';

// Design tokens — modernised palette
const tokens = {
  colors: {
    primary: '#4361EE',          // Vivid indigo-blue
    primaryLight: '#6B82F5',
    primaryDark: '#2E4DD4',
    secondary: '#F72585',
    success: '#06D6A0',
    successDark: '#05B386',
    warning: '#F9A825',
    danger: '#EF233C',
    neutral: '#F0F4FF',
    neutralDark: '#E8EDF9',
    text: '#0D1B2A',
    textSecondary: '#4A5568',
    textTertiary: '#94A3B8',
    border: '#E2E8F0',
    background: '#F7F9FC',
    surface: '#FFFFFF',
    // sidebar
    sidebarBg: '#0F172A',
    sidebarText: '#94A3B8',
    sidebarActiveText: '#FFFFFF',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #4361EE 0%, #7B5EA7 100%)',
    success: 'linear-gradient(135deg, #06D6A0 0%, #0CB87C 100%)',
    warning: 'linear-gradient(135deg, #F9A825 0%, #E65100 100%)',
    danger: 'linear-gradient(135deg, #EF233C 0%, #C9002C 100%)',
    sidebar: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
    card: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
  },
  shadows: {
    xs: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    sm: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
    md: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
    lg: '0 20px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(0,0,0,0.04)',
    colored: (color: string) => `0 8px 20px -4px ${color}40`,
    glow: (color: string) => `0 0 0 3px ${color}25`,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
};

export { tokens };

const theme = createTheme({
  palette: {
    primary: { main: tokens.colors.primary, light: tokens.colors.primaryLight, dark: tokens.colors.primaryDark },
    secondary: { main: tokens.colors.secondary },
    success: { main: tokens.colors.success, dark: tokens.colors.successDark },
    warning: { main: tokens.colors.warning },
    error: { main: tokens.colors.danger },
    background: { default: tokens.colors.background, paper: tokens.colors.surface },
    text: { primary: tokens.colors.text, secondary: tokens.colors.textSecondary },
    divider: tokens.colors.border,
  },
  typography: {
    fontFamily: '"Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', color: tokens.colors.text },
    h2: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.015em', color: tokens.colors.text },
    h3: { fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.01em', color: tokens.colors.textSecondary },
    body1: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6, color: tokens.colors.textSecondary },
    body2: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5, color: tokens.colors.textTertiary },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.01em' },
  },
  shape: { borderRadius: tokens.borderRadius.sm },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { background: ${tokens.colors.background}; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${tokens.colors.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${tokens.colors.textTertiary}; }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.sm,
          padding: '8px 18px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 180ms ease',
          '&:hover': { boxShadow: 'none', transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        contained: {
          background: tokens.gradients.primary,
          '&:hover': { background: `linear-gradient(135deg, ${tokens.colors.primaryLight} 0%, ${tokens.colors.primary} 100%)` },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.borderRadius.md,
          boxShadow: tokens.shadows.xs,
          transition: 'all 220ms ease',
          '&:hover': { boxShadow: tokens.shadows.md, transform: 'translateY(-2px)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: tokens.borderRadius.md,
          boxShadow: tokens.shadows.xs,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 100, fontWeight: 500 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' as const },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.borderRadius.sm,
            transition: 'box-shadow 180ms ease',
            '&.Mui-focused': { boxShadow: tokens.shadows.glow(tokens.colors.primary) },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            background: tokens.colors.neutralDark,
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: tokens.colors.textTertiary,
            borderBottom: `1px solid ${tokens.colors.border}`,
          },
        },
      },
    },
  },
});

export default theme;
