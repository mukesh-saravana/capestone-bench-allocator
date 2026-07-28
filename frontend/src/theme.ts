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
    // ai chat
    aiSurface: '#F8FAFF',
    userBubble: '#4361EE',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #4361EE 0%, #7B5EA7 100%)',
    primarySoft: 'linear-gradient(135deg, #EEF1FF 0%, #F5F0FF 100%)',
    success: 'linear-gradient(135deg, #06D6A0 0%, #0CB87C 100%)',
    successSoft: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF8 100%)',
    warning: 'linear-gradient(135deg, #F9A825 0%, #E65100 100%)',
    warningSoft: 'linear-gradient(135deg, #FFFBEB 0%, #FFF7ED 100%)',
    danger: 'linear-gradient(135deg, #EF233C 0%, #C9002C 100%)',
    dangerSoft: 'linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%)',
    sidebar: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
    card: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
    mesh: 'radial-gradient(at 40% 20%, #4361EE18 0px, transparent 50%), radial-gradient(at 80% 0%, #7B5EA715 0px, transparent 50%), radial-gradient(at 0% 50%, #06D6A012 0px, transparent 50%)',
    aiMessage: 'linear-gradient(135deg, #F8FAFF 0%, #EEF1FF 100%)',
  },
  shadows: {
    xs: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    sm: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
    md: '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
    lg: '0 20px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(0,0,0,0.04)',
    colored: (color: string) => `0 8px 20px -4px ${color}40`,
    glow: (color: string) => `0 0 0 3px ${color}25`,
    float: '0 8px 32px rgba(67,97,238,0.12), 0 2px 8px rgba(0,0,0,0.06)',
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    bubble: 20,
  },
  motion: {
    duration: {
      fast: '180ms',
      normal: '280ms',
      slow: '420ms',
    },
    easing: {
      standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
      smooth: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    },
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
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(14px) scale(0.992); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .page-transition {
          animation: pageEnter ${tokens.motion.duration.slow} ${tokens.motion.easing.standard} both;
          will-change: transform, opacity, filter;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
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
          transition: `transform ${tokens.motion.duration.fast} ${tokens.motion.easing.smooth}, box-shadow ${tokens.motion.duration.fast} ${tokens.motion.easing.smooth}, background ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}`,
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
          transition: `transform ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}, box-shadow ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}, border-color ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}`,
          '&:hover': { boxShadow: tokens.shadows.md, transform: 'translateY(-3px)', borderColor: '#D8E0F0' },
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
          transition: `box-shadow ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}, transform ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}`,
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
            transition: `box-shadow ${tokens.motion.duration.fast} ${tokens.motion.easing.smooth}, border-color ${tokens.motion.duration.fast} ${tokens.motion.easing.smooth}`,
            '&.Mui-focused': { boxShadow: tokens.shadows.glow(tokens.colors.primary) },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          transition: `background ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}, transform ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}, box-shadow ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}`,
          '&:hover': {
            transform: 'translateX(2px)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: `transform ${tokens.motion.duration.fast} ${tokens.motion.easing.smooth}, background-color ${tokens.motion.duration.fast} ${tokens.motion.easing.smooth}, color ${tokens.motion.duration.fast} ${tokens.motion.easing.smooth}`,
          '&:hover': {
            transform: 'translateY(-1px) scale(1.02)',
          },
          '&:active': {
            transform: 'translateY(0) scale(1)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          transition: `color ${tokens.motion.duration.fast} ${tokens.motion.easing.smooth}, background-color ${tokens.motion.duration.normal} ${tokens.motion.easing.standard}`,
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.borderRadius.lg,
          boxShadow: tokens.shadows.lg,
          border: `1px solid ${tokens.colors.border}`,
          backgroundImage: 'none',
          backdropFilter: 'blur(20px)',
        },
        root: {
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(15,23,42,0.5)',
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '1.0625rem',
          color: tokens.colors.text,
          paddingBottom: 8,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.sm,
          border: '1px solid',
          fontSize: '0.875rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 100, backgroundColor: tokens.colors.neutralDark },
        bar: { borderRadius: 100, background: tokens.gradients.primary },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: { borderRadius: tokens.borderRadius.sm },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.colors.sidebarBg,
          color: '#CBD5E1',
          fontSize: '0.75rem',
          borderRadius: tokens.borderRadius.sm,
          padding: '6px 12px',
          boxShadow: tokens.shadows.md,
        },
        arrow: { color: tokens.colors.sidebarBg },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: tokens.colors.border },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: tokens.borderRadius.sm },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: { fontWeight: 700, fontSize: '0.6rem' },
      },
    },
  },
});

export default theme;
