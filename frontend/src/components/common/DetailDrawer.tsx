import { Drawer, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { ReactNode } from 'react';
import { tokens } from '../../theme';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  width?: number;
}

export function DetailDrawer({ open, onClose, onBack, title, subtitle, icon, children, width = 480 }: DetailDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1300,
        '& .MuiDrawer-paper': {
          width,
          maxWidth: '95vw',
          border: 'none',
          boxShadow: '-4px 0 60px rgba(0,0,0,0.22)',
          bgcolor: tokens.colors.background,
          display: 'flex',
          flexDirection: 'column',
        },
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(15,23,42,0.42)',
        },
      }}
    >
      {/* Sticky dark gradient header */}
      <Box
        sx={{
          px: 2.5, py: 2.25,
          background: `linear-gradient(135deg, ${tokens.colors.sidebarBg} 0%, #1a3464 100%)`,
          display: 'flex', alignItems: 'center', gap: 1.5,
          flexShrink: 0,
          position: 'relative', overflow: 'hidden',
          '&::after': {
            content: '""', position: 'absolute', top: -30, right: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: `${tokens.colors.primary}20`, pointerEvents: 'none',
          },
        }}
      >
        {onBack && (
          <IconButton onClick={onBack} size="small" sx={{ color: 'rgba(148,163,184,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }, flexShrink: 0 }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        {icon && !onBack && (
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: tokens.gradients.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: '#fff',
            boxShadow: tokens.shadows.colored(tokens.colors.primary),
            position: 'relative',
          }}>
            {icon}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#FFFFFF', lineHeight: 1.25 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.4 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{
          color: 'rgba(148,163,184,0.7)',
          transition: 'all 150ms ease',
          '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
          flexShrink: 0,
        }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {children}
      </Box>
    </Drawer>
  );
}
