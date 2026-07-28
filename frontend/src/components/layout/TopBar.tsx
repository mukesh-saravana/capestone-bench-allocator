import { AppBar, Toolbar, Typography, IconButton, Box, Tooltip, useMediaQuery, useTheme, Avatar, Badge, Chip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { getRagStatus } from '../../lib/api';
import { tokens } from '../../theme';
import { SIDEBAR_WIDTH } from './Sidebar';

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':       { title: 'Resource Dashboard',     subtitle: 'Bench status & allocation overview' },
  '/chat':            { title: 'Chat Assistant',          subtitle: 'AI-powered staffing recommendations' },
  '/recommendations': { title: 'Recommendations',         subtitle: 'Ranked candidates for open roles' },
  '/settings':        { title: 'Settings',                subtitle: 'Configure preferences and data' },
};

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const ragStatusQuery = useQuery({ queryKey: ['system', 'rag-status'], queryFn: getRagStatus });

  const page = pageConfig[pathname] ?? { title: 'Bench Allocator', subtitle: '' };
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'DM';
  const ragLabel = ragStatusQuery.data ? `RAG: ${ragStatusQuery.data.retrievalMode}` : 'RAG: ...';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: isMobile ? '100%' : `calc(100% - ${SIDEBAR_WIDTH}px)`,
        ml: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
        bgcolor: 'rgba(247,249,252,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${tokens.colors.border}`,
        color: tokens.colors.text,
      }}
    >
      <Toolbar sx={{ minHeight: 68, gap: 2 }}>
        {isMobile && (
          <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 0.5 }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Page title block */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: tokens.colors.text, lineHeight: 1.25 }}>
            {page.title}
          </Typography>
          {!isMobile && (
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.textTertiary, lineHeight: 1.4 }}>
              {page.subtitle}
            </Typography>
          )}
        </Box>

        {/* Status chip */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label="● Live"
              size="small"
              sx={{
                bgcolor: `${tokens.colors.success}15`,
                color: tokens.colors.success,
                fontWeight: 600,
                fontSize: '0.7rem',
                border: `1px solid ${tokens.colors.success}30`,
                '& .MuiChip-label': { px: 1.25 },
              }}
            />
            <Tooltip
              title={
                ragStatusQuery.data
                  ? `Mode: ${ragStatusQuery.data.mode} · Indexed chunks: ${ragStatusQuery.data.indexedChunks}`
                  : 'Loading RAG status'
              }
            >
              <Chip
                label={ragLabel}
                size="small"
                sx={{
                  bgcolor: `${tokens.colors.primary}10`,
                  color: tokens.colors.primary,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  border: `1px solid ${tokens.colors.primary}20`,
                  '& .MuiChip-label': { px: 1.25 },
                }}
              />
            </Tooltip>
          </Box>
        )}

        {/* Action icons */}
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title="Export report">
            <IconButton size="small" sx={{ color: tokens.colors.textTertiary, '&:hover': { color: tokens.colors.primary, bgcolor: `${tokens.colors.primary}10` } }}>
              <FileDownloadOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton size="small" sx={{ color: tokens.colors.textTertiary, '&:hover': { color: tokens.colors.primary, bgcolor: `${tokens.colors.primary}10` } }}>
              <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}>
                <NotificationsOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <Box sx={{ width: 1, height: 24, bgcolor: tokens.colors.border, mx: 0.5 }} />

          {/* User avatar */}
          <Tooltip title={`${user?.name ?? 'Demo Manager'} · ${user?.role ?? ''}`}>
            <Avatar
              sx={{
                width: 32, height: 32, cursor: 'pointer',
                background: tokens.gradients.primary,
                fontSize: '0.75rem', fontWeight: 700,
                boxShadow: tokens.shadows.colored(tokens.colors.primary),
              }}
            >
              {initials}
            </Avatar>
          </Tooltip>

          <Tooltip title="Sign out">
            <IconButton size="small" onClick={() => { void logout(); }} sx={{ color: tokens.colors.textTertiary, '&:hover': { color: tokens.colors.danger, bgcolor: `${tokens.colors.danger}10` } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
